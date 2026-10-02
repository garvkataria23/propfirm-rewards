import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAdjustPointsDto } from './dto/points.dto';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async getUserSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pointsBalance: true },
    });

    const availablePoints = user?.pointsBalance ?? 0;

    // 2. Total Earned (sum of all positive ledger credits)
    const positiveCredits = await this.prisma.pointsLedger.aggregate({
      where: {
        userId,
        points: { gt: 0 },
      },
      _sum: { points: true },
    });
    const totalPointsEarned = positiveCredits._sum.points || 0;

    // 3. Total Redeemed (sum of negative points spent on rewards)
    const redemptionsSum = await this.prisma.pointsLedger.aggregate({
      where: {
        userId,
        points: { lt: 0 },
      },
      _sum: { points: true },
    });
    const totalPointsRedeemed = Math.abs(redemptionsSum._sum.points || 0);

    // 4. Pending Points (from submissions in PENDING or UNDER_REVIEW)
    const pendingSubs = await this.prisma.purchaseSubmission.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
      select: { pointsAwarded: true },
    });
    const pendingPoints = pendingSubs.reduce((acc, curr) => acc + (curr.pointsAwarded || 0), 0);
    const pendingPurchases = pendingSubs.length;

    // 5. Total Verified Purchases
    const verifiedPurchases = await this.prisma.purchaseSubmission.count({
      where: {
        userId,
        status: 'APPROVED',
      },
    });

    // 6. Active Redemptions
    const activeRedemptions = await this.prisma.redemption.count({
      where: {
        userId,
        status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      },
    });

    return {
      availablePoints,
      totalPointsEarned,
      totalPointsRedeemed,
      pendingPoints,
      pendingPurchases,
      totalVerifiedPurchases: verifiedPurchases,
      activeRedemptions,
    };
  }

  async getUserLedger(userId: string, limit = 50, offset = 0) {
    const [transactions, total] = await Promise.all([
      this.prisma.pointsLedger.findMany({
        where: { userId },
        include: {
          submission: {
            select: {
              id: true,
              submissionCode: true,
              orderId: true,
              propFirm: { select: { name: true, logoUrl: true } },
            },
          },
          redemption: {
            select: {
              id: true,
              redemptionCode: true,
              status: true,
              reward: { select: { name: true, imageUrl: true } },
            },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.pointsLedger.count({ where: { userId } }),
    ]);

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  // Admin Manual Adjustment with Financial Grade Atomicity
  async adminAdjustPoints(targetUserId: string, dto: AdminAdjustPointsDto, adminId: string) {
    if (!dto.reason || dto.reason.trim().length < 5) {
      throw new BadRequestException('A descriptive reason (at least 5 characters) is mandatory for admin point adjustments');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check idempotency if key provided
    if (dto.idempotencyKey) {
      const existingEntry = await this.prisma.pointsLedger.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existingEntry) {
        return {
          user: { id: user.id, name: user.name, email: user.email },
          previousBalance: existingEntry.balanceBefore,
          adjustment: existingEntry.points,
          newBalance: existingEntry.balanceAfter,
          ledgerEntry: existingEntry,
          idempotentReplay: true,
        };
      }
    }

    const idempotencyKey =
      dto.idempotencyKey ||
      `admin-adj-${targetUserId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const result = await this.prisma.$transaction(async (tx) => {
      let balanceBefore = 0;
      let balanceAfter = 0;

      if (dto.points > 0) {
        // Atomic balance increment
        await tx.$executeRaw`
          UPDATE "User"
          SET "pointsBalance" = "pointsBalance" + ${dto.points}
          WHERE "id" = ${targetUserId}
        `;
      } else {
        const deduction = Math.abs(dto.points);
        // Atomic balance decrement with strict floor condition
        const affectedRows = await tx.$executeRaw`
          UPDATE "User"
          SET "pointsBalance" = "pointsBalance" - ${deduction}
          WHERE "id" = ${targetUserId} AND "pointsBalance" >= ${deduction}
        `;

        if (affectedRows === 0) {
          const currentUser = await tx.user.findUnique({
            where: { id: targetUserId },
            select: { pointsBalance: true },
          });
          throw new BadRequestException(
            `Cannot deduct ${deduction} points. User current balance is only ${currentUser?.pointsBalance ?? 0}.`,
          );
        }
      }

      // Read verified post-update balance
      const updatedUser = await tx.user.findUnique({
        where: { id: targetUserId },
        select: { pointsBalance: true },
      });

      balanceAfter = updatedUser?.pointsBalance ?? 0;
      balanceBefore = balanceAfter - dto.points;

      const txType = dto.points > 0 ? 'ADMIN_CREDIT' : 'ADMIN_DEDUCTION';

      const ledgerEntry = await tx.pointsLedger.create({
        data: {
          userId: targetUserId,
          type: txType,
          points: dto.points,
          balanceBefore,
          balanceAfter,
          description: dto.description.trim(),
          reason: dto.reason.trim(),
          referenceType: 'ADMIN_MANUAL',
          referenceId: adminId,
          idempotencyKey,
          createdById: adminId,
        },
      });

      // User notification
      await tx.notification.create({
        data: {
          userId: targetUserId,
          title: dto.points > 0 ? 'Admin Bonus Points Added! 🌟' : 'Points Adjusted',
          message: `${dto.description} (${dto.points > 0 ? '+' : ''}${dto.points.toLocaleString()} points). Reason: ${dto.reason}`,
          type: 'POINTS',
          linkUrl: '/dashboard/points',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId,
          action: 'ADJUST_POINTS',
          entity: 'User',
          entityId: targetUserId,
          previousValue: JSON.stringify({ balance: balanceBefore }),
          newValue: JSON.stringify({ balance: balanceAfter, adjustment: dto.points }),
          notes: `Reason: ${dto.reason} | Description: ${dto.description}`,
        },
      });

      return {
        user: { id: user.id, name: user.name, email: user.email },
        previousBalance: balanceBefore,
        adjustment: dto.points,
        newBalance: balanceAfter,
        ledgerEntry,
      };
    });

    return result;
  }
}
