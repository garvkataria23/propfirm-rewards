import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { UpdateRedemptionStatusDto } from '../rewards/dto/reward.dto';

@Injectable()
export class RedemptionsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private whatsappService: WhatsAppService,
  ) {}

  async getUserRedemptions(userId: string) {
    return this.prisma.redemption.findMany({
      where: { userId },
      include: {
        reward: { include: { category: true } },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserRedemptionById(userId: string, id: string) {
    const redemption = await this.prisma.redemption.findFirst({
      where: { id, userId },
      include: {
        reward: { include: { category: true } },
        shippingAddress: true,
      },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption order not found');
    }

    return redemption;
  }

  // Admin Operations
  async getAdminRedemptions(query: {
    status?: string;
    userId?: string;
    search?: string;
  }) {
    const { status, userId, search } = query;

    return this.prisma.redemption.findMany({
      where: {
        ...(status && { status }),
        ...(userId && { userId }),
        ...(search && {
          OR: [
            { redemptionCode: { contains: search } },
            { trackingNumber: { contains: search } },
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
            { reward: { name: { contains: search } } },
          ],
        }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, country: true } },
        reward: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminRedemptionById(id: string) {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id },
      include: {
        user: true,
        reward: { include: { category: true } },
        shippingAddress: true,
      },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    return redemption;
  }

  async updateStatus(id: string, dto: UpdateRedemptionStatusDto, adminId: string) {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id },
      include: {
        user: true,
        reward: true,
      },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    const previousStatus = redemption.status;
    const newStatus = dto.status.toUpperCase();

    // If cancelling or rejecting an order that spent points, safely refund points and restore stock
    let refundProcessed = false;
    if (
      (newStatus === 'CANCELLED' || newStatus === 'REJECTED') &&
      previousStatus !== 'CANCELLED' &&
      previousStatus !== 'REJECTED'
    ) {
      refundProcessed = true;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update Redemption
      const updated = await tx.redemption.update({
        where: { id },
        data: {
          status: newStatus,
          ...(dto.courier !== undefined && { courier: dto.courier }),
          ...(dto.trackingNumber !== undefined && { trackingNumber: dto.trackingNumber }),
          ...(dto.adminNotes !== undefined && { adminNotes: dto.adminNotes }),
          ...(dto.shippingNotes !== undefined && { shippingNotes: dto.shippingNotes }),
        },
        include: {
          user: true,
          reward: true,
          shippingAddress: true,
        },
      });

      // 2. Refund points if cancelled/rejected
      if (refundProcessed) {
        const lastTx = await tx.pointsLedger.findFirst({
          where: { userId: redemption.userId },
          orderBy: { createdAt: 'desc' },
          select: { balanceAfter: true },
        });

        const currentBalance = lastTx ? lastTx.balanceAfter : 0;
        const newBalance = currentBalance + redemption.pointsSpent;

        await tx.pointsLedger.create({
          data: {
            userId: redemption.userId,
            redemptionId: redemption.id,
            type: 'REFUND_REVERSAL',
            points: redemption.pointsSpent,
            balanceAfter: newBalance,
            description: `Points Refund: Cancelled redemption for ${redemption.reward.name} (${redemption.redemptionCode})`,
            reason: dto.adminNotes || 'Order cancelled by administration',
            createdById: adminId,
          },
        });

        // Restock
        if (!redemption.reward.isUnlimitedStock) {
          await tx.reward.update({
            where: { id: redemption.rewardId },
            data: { stock: { increment: 1 } },
          });
        }
      }

      // 3. User Notification
      let notifTitle = `Redemption Status: ${newStatus}`;
      let notifMsg = `Your redemption order ${redemption.redemptionCode} (${redemption.reward.name}) is now ${newStatus}.`;

      if (newStatus === 'SHIPPED') {
        notifTitle = 'Your Reward Has Shipped! 🚀';
        notifMsg = `Package sent via ${dto.courier || 'courier'}. Tracking: ${dto.trackingNumber || 'Available in order details'}.`;
      } else if (newStatus === 'DELIVERED') {
        notifTitle = 'Reward Delivered! 📦';
        notifMsg = `Your order ${redemption.redemptionCode} has been delivered. Enjoy your reward!`;
      } else if (refundProcessed) {
        notifTitle = 'Redemption Cancelled & Points Refunded';
        notifMsg = `Your order ${redemption.redemptionCode} was ${newStatus}. ${redemption.pointsSpent.toLocaleString()} points refunded back to your balance.`;
      }

      await tx.notification.create({
        data: {
          userId: redemption.userId,
          title: notifTitle,
          message: notifMsg,
          type: 'REDEMPTION',
          linkUrl: `/dashboard/redemptions/${redemption.id}`,
        },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          adminId,
          action: 'UPDATE_REDEMPTION_STATUS',
          entity: 'Redemption',
          entityId: id,
          previousValue: JSON.stringify({ status: previousStatus }),
          newValue: JSON.stringify({
            status: newStatus,
            courier: dto.courier,
            trackingNumber: dto.trackingNumber,
            refundProcessed,
          }),
          notes: dto.adminNotes || `Status updated from ${previousStatus} to ${newStatus}`,
        },
      });

      return updated;
    });

    // Send email on SHIPPED
    if (newStatus === 'SHIPPED') {
      if (dto.courier && dto.trackingNumber) {
        this.emailService.sendRedemptionShippedEmail(
          redemption.user.email,
          redemption.user.name,
          redemption.redemptionCode,
          redemption.reward.name,
          dto.courier,
          dto.trackingNumber,
        ).catch(() => {});
      }

      // Send WhatsApp alert
      if (redemption.user.phone) {
        const trackingUrl = dto.trackingNumber
          ? `https://parcelsapp.com/en/tracking/${dto.trackingNumber}`
          : undefined;

        this.whatsappService.sendRedemptionDispatchedAlert(
          redemption.user.phone,
          redemption.user.name,
          redemption.redemptionCode,
          redemption.reward.name,
          dto.courier,
          dto.trackingNumber,
          trackingUrl,
          dto.adminNotes?.includes('CODE:') ? dto.adminNotes.split('CODE:')[1]?.trim() : undefined,
        ).catch(() => {});
      }
    }

    return result;
  }
}
