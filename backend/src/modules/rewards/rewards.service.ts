import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateRewardDto, UpdateRewardDto, RedeemRewardDto, UpdateRedemptionStatusDto } from './dto/reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  private categoriesCache: { data: any; expiresAt: number } | null = null;
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private readonly CACHE_TTL_MS = 60 * 1000; // 60 seconds

  private invalidateCache() {
    this.categoriesCache = null;
    this.cache.clear();
  }

  async getCategories() {
    if (this.categoriesCache && Date.now() < this.categoriesCache.expiresAt) {
      return this.categoriesCache.data;
    }
    const result = await this.prisma.rewardCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    this.categoriesCache = { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS };
    return result;
  }

  async findAll(query: { categorySlug?: string; search?: string; inStockOnly?: boolean }) {
    const cacheKey = JSON.stringify(query);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    const { categorySlug, search, inStockOnly } = query;

    const result = await this.prisma.reward.findMany({
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

    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
    return result;
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

    // Check idempotency if key provided
    if (dto.idempotencyKey) {
      const existingLedger = await this.prisma.pointsLedger.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { redemption: { include: { reward: true, shippingAddress: true } } },
      });
      if (existingLedger?.redemption) {
        return {
          redemption: existingLedger.redemption,
          previousBalance: existingLedger.balanceBefore,
          pointsSpent: Math.abs(existingLedger.points),
          remainingBalance: existingLedger.balanceAfter,
          idempotentReplay: true,
        };
      }
    }

    // 2. Execute Atomic Transaction with Database-Level Lock
    const result = await this.prisma.$transaction(async (tx) => {
      // Fetch reward
      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward || !reward.isActive) {
        throw new BadRequestException('This reward is currently unavailable.');
      }

      if (!reward.isUnlimitedStock && reward.stock <= 0) {
        throw new BadRequestException('This reward is currently out of stock.');
      }

      // CRITICAL CONCURRENCY SAFEGUARD: Atomic balance deduction
      // If two requests hit simultaneously, Postgres row-level lock ensures
      // only one query succeeds in meeting the `pointsBalance >= pointsRequired` condition.
      const affectedRows = await tx.$executeRaw`
        UPDATE "User"
        SET "pointsBalance" = "pointsBalance" - ${reward.pointsRequired}
        WHERE "id" = ${userId} AND "pointsBalance" >= ${reward.pointsRequired}
      `;

      if (affectedRows === 0) {
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { pointsBalance: true },
        });
        throw new BadRequestException(
          `Insufficient points balance. You have ${(currentUser?.pointsBalance ?? 0).toLocaleString()} points, but this reward requires ${reward.pointsRequired.toLocaleString()} points.`,
        );
      }

      // Atomic stock deduction if applicable
      if (!reward.isUnlimitedStock) {
        const stockAffected = await tx.$executeRaw`
          UPDATE "Reward"
          SET "stock" = "stock" - 1
          WHERE "id" = ${reward.id} AND "stock" > 0
        `;
        if (stockAffected === 0) {
          throw new BadRequestException('This reward is currently out of stock.');
        }
      }

      // Read current balance after atomic deduction
      const updatedUser = await tx.user.findUnique({
        where: { id: userId },
        select: { pointsBalance: true },
      });

      const remainingBalance = updatedUser?.pointsBalance ?? 0;
      const previousBalance = remainingBalance + reward.pointsRequired;

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

      // Cryptographically secure unique redemption code: RDM-2026-XXXXXX
      const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
      const redemptionCode = `RDM-${new Date().getFullYear()}-${randomSuffix}`;
      const idempotencyKey =
        dto.idempotencyKey || `rdm-${userId}-${Date.now()}-${randomSuffix}`;

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

      // Insert immutable PointsLedger entry
      const ledgerEntry = await tx.pointsLedger.create({
        data: {
          userId,
          redemptionId: redemption.id,
          type: 'REDEMPTION',
          points: -reward.pointsRequired,
          balanceBefore: previousBalance,
          balanceAfter: remainingBalance,
          referenceType: 'REWARD_REDEMPTION',
          referenceId: redemption.id,
          idempotencyKey,
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
          previousValue: JSON.stringify({ balance: previousBalance }),
          newValue: JSON.stringify({
            userId,
            rewardName: reward.name,
            pointsSpent: reward.pointsRequired,
            remainingBalance,
          }),
          notes: `User redeemed ${reward.name}`,
        },
      });

      return {
        redemption,
        previousBalance,
        pointsSpent: reward.pointsRequired,
        remainingBalance,
        ledgerEntry,
      };
    });

    this.invalidateCache();

    // Trigger community broadcast to Discord, Telegram & on-site pulse
    this.notificationsService.broadcastSocialAlert({
      type: 'REDEMPTION',
      traderName: user.name || 'Trader',
      points: result.redemption.pointsSpent,
      title: `Reward Redeemed: ${result.redemption.reward.name}`,
      description: `Trader unlocked ${result.redemption.reward.name} for ${result.redemption.pointsSpent.toLocaleString()} PTS`,
      propFirmOrItem: result.redemption.reward.name,
    }).catch(() => {});

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

    this.invalidateCache();
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

    this.invalidateCache();
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

      this.invalidateCache();
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

    this.invalidateCache();
    return { message: 'Reward deleted successfully' };
  }
}
