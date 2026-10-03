import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { UpdateRedemptionStatusDto } from '../rewards/dto/reward.dto';

export const ALLOWED_REDEMPTION_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED', 'REJECTED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: [],
};

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
    limit?: number | string;
    offset?: number | string;
  }) {
    const { status, userId, search } = query;
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    const where = {
      ...(status && { status }),
      ...(userId && { userId }),
      ...(search && {
        OR: [
          { redemptionCode: { contains: search, mode: 'insensitive' as const } },
          { trackingNumber: { contains: search, mode: 'insensitive' as const } },
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
          { reward: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [redemptions, total] = await Promise.all([
      this.prisma.redemption.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, country: true } },
          reward: true,
          shippingAddress: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.redemption.count({ where }),
    ]);

    return {
      redemptions,
      total,
      limit,
      offset,
    };
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

    if (previousStatus === newStatus) {
      return redemption;
    }

    const allowedNext = ALLOWED_REDEMPTION_TRANSITIONS[previousStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid state transition: Cannot change redemption from "${previousStatus}" to "${newStatus}".`,
      );
    }

    // Only allow refunds for pre-shipment states
    let refundProcessed = false;
    if (
      (newStatus === 'CANCELLED' || newStatus === 'REJECTED') &&
      ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(previousStatus)
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
        // Atomic point balance restore
        await tx.$executeRaw`
          UPDATE "User"
          SET "pointsBalance" = "pointsBalance" + ${redemption.pointsSpent}
          WHERE "id" = ${redemption.userId}
        `;

        const updatedUser = await tx.user.findUnique({
          where: { id: redemption.userId },
          select: { pointsBalance: true },
        });

        const newBalance = updatedUser?.pointsBalance ?? 0;
        const balanceBefore = newBalance - redemption.pointsSpent;

        await tx.pointsLedger.create({
          data: {
            userId: redemption.userId,
            redemptionId: redemption.id,
            type: 'REFUND_REVERSAL',
            points: redemption.pointsSpent,
            balanceBefore,
            balanceAfter: newBalance,
            referenceType: 'REDEMPTION_REFUND',
            referenceId: redemption.id,
            idempotencyKey: `refund-${redemption.id}`,
            description: `Points Refund: Cancelled redemption for ${redemption.reward.name} (${redemption.redemptionCode})`,
            reason: dto.adminNotes || 'Order cancelled by administration',
            createdById: adminId,
          },
        });

        // Restock
        if (!redemption.reward.isUnlimitedStock) {
          await tx.$executeRaw`
            UPDATE "Reward"
            SET "stock" = "stock" + 1
            WHERE "id" = ${redemption.rewardId}
          `;
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

  async adminDeleteRedemption(id: string, adminId: string) {
    const redemption = await this.prisma.redemption.findUnique({ where: { id } });
    if (!redemption) throw new NotFoundException('Redemption not found');

    await this.prisma.redemption.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'DELETE_REDEMPTION',
        entity: 'Redemption',
        entityId: id,
        notes: `Admin deleted redemption order: ${redemption.redemptionCode}`,
      },
    });

    return { message: 'Redemption deleted successfully' };
  }
}

