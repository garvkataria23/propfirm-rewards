import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAdjustPointsDto } from './dto/points.dto';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async getUserSummary(userId: string) {
    // 1. Available Balance from latest ledger entry
    const latestTx = await this.prisma.pointsLedger.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { balanceAfter: true },
    });
    const availablePoints = latestTx ? latestTx.balanceAfter : 0;

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

  // Admin Manual Adjustment
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

    const result = await this.prisma.$transaction(async (tx) => {
      const lastTx = await tx.pointsLedger.findFirst({
        where: { userId: targetUserId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      });

      const currentBalance = lastTx ? lastTx.balanceAfter : 0;
      const newBalance = currentBalance + dto.points;

      if (newBalance < 0) {
        throw new BadRequestException(`Cannot deduct ${Math.abs(dto.points)} points. User current balance is only ${currentBalance}.`);
      }

      const txType = dto.points > 0 ? 'ADMIN_CREDIT' : 'ADMIN_DEDUCTION';

      const ledgerEntry = await tx.pointsLedger.create({
        data: {
          userId: targetUserId,
          type: txType,
          points: dto.points,
          balanceAfter: newBalance,
          description: dto.description.trim(),
          reason: dto.reason.trim(),
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
          previousValue: JSON.stringify({ balance: currentBalance }),
          newValue: JSON.stringify({ balance: newBalance, adjustment: dto.points }),
          notes: `Reason: ${dto.reason} | Description: ${dto.description}`,
        },
      });

      return {
        user: { id: user.id, name: user.name, email: user.email },
        previousBalance: currentBalance,
        adjustment: dto.points,
        newBalance,
        ledgerEntry,
      };
    });

    return result;
  }
}
