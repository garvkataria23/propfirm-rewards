import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateRewardDto, UpdateRewardDto, RedeemRewardDto, UpdateRedemptionStatusDto } from './dto/reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getCategories() {
    return this.prisma.rewardCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAll(query: { categorySlug?: string; search?: string; inStockOnly?: boolean }) {
    const { categorySlug, search, inStockOnly } = query;

    return this.prisma.reward.findMany({
      where: {
        isActive: true,
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(inStockOnly && {
          OR: [{ isUnlimitedStock: true }, { stock: { gt: 0 } }],
        }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
      include: { category: true },
      orderBy: [{ sortOrder: 'asc' }, { pointsRequired: 'asc' }],
    });
  }

  async findBySlugOrId(identifier: string) {
    const reward = await this.prisma.reward.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: { category: true },
    });

    if (!reward) {
      throw new NotFoundException(`Reward '${identifier}' not found`);
    }

    return reward;
  }

  // REDEEM FLOW with double-spending protection and ACID transaction
  async redeemReward(userId: string, rewardId: string, dto: RedeemRewardDto) {
    // 1. Verify user status
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new BadRequestException('Your account is currently not active or suspended from redeeming rewards.');
    }

    // 2. Execute Atomic Transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Lock and fetch reward
      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward || !reward.isActive) {
        throw new BadRequestException('This reward is currently unavailable.');
      }

      if (!reward.isUnlimitedStock && reward.stock <= 0) {
        throw new BadRequestException('This reward is currently out of stock.');
      }

      // Check user points balance
      const latestTx = await tx.pointsLedger.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      });

      const currentBalance = latestTx ? latestTx.balanceAfter : 0;
      if (currentBalance < reward.pointsRequired) {
        throw new BadRequestException(
          `Insufficient points balance. You have ${currentBalance.toLocaleString()} points, but this reward requires ${reward.pointsRequired.toLocaleString()} points.`,
        );
      }

      // Handle Shipping Address
      let shippingAddressId = dto.shippingAddressId;
      if (!shippingAddressId && dto.addressLine1 && dto.fullName) {
        const newAddress = await tx.userAddress.create({
          data: {
            userId,
            fullName: dto.fullName,
            phone: dto.phone || user.phone || 'N/A',
            addressLine1: dto.addressLine1,
            addressLine2: dto.addressLine2 || null,
            city: dto.city || 'N/A',
            state: dto.state || 'N/A',
            postalCode: dto.postalCode || 'N/A',
            country: dto.country || user.country || 'United States',
            isDefault: false,
          },
        });
        shippingAddressId = newAddress.id;
      }

      // Generate Unique Redemption Code: RDM-2026-XXXX
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const redemptionCode = `RDM-${new Date().getFullYear()}-${randomSuffix}`;

      // Deduct stock if applicable
      if (!reward.isUnlimitedStock) {
        await tx.reward.update({
          where: { id: reward.id },
          data: { stock: { decrement: 1 } },
        });
      }

      // Create Redemption record
      const redemption = await tx.redemption.create({
        data: {
          redemptionCode,
          userId,
          rewardId: reward.id,
          pointsSpent: reward.pointsRequired,
          status: 'PENDING',
          shippingAddressId: shippingAddressId || null,
          shippingNotes: dto.notes || null,
        },
        include: {
          reward: true,
          shippingAddress: true,
        },
      });

      // Deduct Points from Ledger
      const newBalance = currentBalance - reward.pointsRequired;
      const ledgerEntry = await tx.pointsLedger.create({
        data: {
          userId,
          redemptionId: redemption.id,
          type: 'REDEMPTION',
          points: -reward.pointsRequired,
          balanceAfter: newBalance,
          description: `Reward Redemption: ${reward.name} (Code: ${redemptionCode})`,
        },
      });

      // Create Notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Reward Redemption Confirmed! 🎁',
          message: `You successfully redeemed ${reward.name} for ${reward.pointsRequired.toLocaleString()} points. Order: ${redemptionCode}`,
          type: 'REDEMPTION',
          linkUrl: `/dashboard/redemptions/${redemption.id}`,
        },
      });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          adminId: null,
          action: 'REDEEM_REWARD',
          entity: 'Redemption',
          entityId: redemption.id,
          newValue: JSON.stringify({
            userId,
            rewardName: reward.name,
            pointsSpent: reward.pointsRequired,
            remainingBalance: newBalance,
          }),
          notes: `User redeemed ${reward.name}`,
        },
      });

      return {
        redemption,
        previousBalance: currentBalance,
        pointsSpent: reward.pointsRequired,
        remainingBalance: newBalance,
      };
    });

    return result;
  }

  // Admin Reward Management
  async adminGetAll(includeInactive = true) {
    return this.prisma.reward.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: { category: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async adminCreateReward(dto: CreateRewardDto, adminId: string) {
    const existing = await this.prisma.reward.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Slug '${dto.slug}' already exists`);
    }

    const reward = await this.prisma.reward.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        specifications: dto.specifications,
        imageUrl: dto.imageUrl,
        pointsRequired: dto.pointsRequired,
        stock: dto.stock ?? 0,
        isUnlimitedStock: dto.isUnlimitedStock ?? false,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { category: true },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'CREATE_REWARD',
        entity: 'Reward',
        entityId: reward.id,
        newValue: JSON.stringify(reward),
        notes: `Created reward: ${reward.name}`,
      },
    });

    return reward;
  }

  async adminUpdateReward(id: string, dto: UpdateRewardDto, adminId: string) {
    const existing = await this.prisma.reward.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Reward not found');
    }

    const updated = await this.prisma.reward.update({
      where: { id },
      data: {
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.description && { description: dto.description }),
        ...(dto.specifications !== undefined && { specifications: dto.specifications }),
        ...(dto.imageUrl && { imageUrl: dto.imageUrl }),
        ...(dto.pointsRequired !== undefined && { pointsRequired: dto.pointsRequired }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.isUnlimitedStock !== undefined && { isUnlimitedStock: dto.isUnlimitedStock }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
      include: { category: true },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'UPDATE_REWARD',
        entity: 'Reward',
        entityId: id,
        previousValue: JSON.stringify(existing),
        newValue: JSON.stringify(updated),
        notes: `Updated reward: ${updated.name}`,
      },
    });

    return updated;
  }

  async adminDeleteReward(id: string, adminId: string) {
    const existing = await this.prisma.reward.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Reward not found');
    }

    const redemptionCount = await this.prisma.redemption.count({ where: { rewardId: id } });
    if (redemptionCount > 0) {
      const disabled = await this.prisma.reward.update({
        where: { id },
        data: { isActive: false },
      });

      await this.prisma.auditLog.create({
        data: {
          adminId,
          action: 'DEACTIVATE_REWARD',
          entity: 'Reward',
          entityId: id,
          notes: `Deactivated reward with ${redemptionCount} historical redemptions`,
        },
      });

      return { message: 'Reward has historical redemptions, so it has been deactivated rather than deleted', reward: disabled };
    }

    await this.prisma.reward.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'DELETE_REWARD',
        entity: 'Reward',
        entityId: id,
        previousValue: JSON.stringify(existing),
        notes: `Deleted reward: ${existing.name}`,
      },
    });

    return { message: 'Reward deleted successfully' };
  }
}
