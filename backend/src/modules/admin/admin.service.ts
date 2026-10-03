import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  private statsCache = new Map<number, { data: any; expiresAt: number }>();
  private readonly STATS_TTL_MS = 30_000; // 30s cache

  constructor(private prisma: PrismaService) {}

  async getDashboardStats(days = 30) {
    const now = Date.now();
    const cached = this.statsCache.get(days);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const [
      totalUsers,
      newUsers,
      totalSubmissions,
      pendingVerification,
      approvedPurchases,
      rejectedPurchases,
      moreInfoSubmissions,
      pointsIssuedAgg,
      pointsRedeemedAgg,
      pendingRedemptions,
      completedRedemptions,
      activeRewards,
      lowStockRewards,
      recentSubmissions,
      recentRedemptions,
      propFirmsCount,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({ where: { role: 'USER', createdAt: { gte: sinceDate } } }),
      this.prisma.purchaseSubmission.count(),
      this.prisma.purchaseSubmission.count({ where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } } }),
      this.prisma.purchaseSubmission.count({ where: { status: 'APPROVED' } }),
      this.prisma.purchaseSubmission.count({ where: { status: 'REJECTED' } }),
      this.prisma.purchaseSubmission.count({ where: { status: 'MORE_INFO_REQUIRED' } }),
      this.prisma.pointsLedger.aggregate({
        where: { points: { gt: 0 } },
        _sum: { points: true },
      }),
      this.prisma.pointsLedger.aggregate({
        where: { points: { lt: 0 } },
        _sum: { points: true },
      }),
      this.prisma.redemption.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
      this.prisma.redemption.count({ where: { status: { in: ['SHIPPED', 'DELIVERED'] } } }),
      this.prisma.reward.count({ where: { isActive: true } }),
      this.prisma.reward.count({
        where: {
          isActive: true,
          isUnlimitedStock: false,
          stock: { lte: 5 },
        },
      }),
      this.prisma.purchaseSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          propFirm: { select: { name: true, logoUrl: true } },
        },
      }),
      this.prisma.redemption.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          reward: { select: { name: true, imageUrl: true } },
        },
      }),
      this.prisma.propFirm.count({ where: { isActive: true } }),
    ]);

    const pointsIssued = pointsIssuedAgg._sum.points || 0;
    const pointsRedeemed = Math.abs(pointsRedeemedAgg._sum.points || 0);

    const result = {
      metrics: {
        totalUsers,
        newUsers,
        totalSubmissions,
        pendingVerification,
        approvedPurchases,
        rejectedPurchases,
        moreInfoSubmissions,
        totalPointsIssued: pointsIssued,
        totalPointsRedeemed: pointsRedeemed,
        netPointsOutstanding: pointsIssued - pointsRedeemed,
        pendingRedemptions,
        completedRedemptions,
        activeRewards,
        lowStockRewards,
        propFirmsCount,
      },
      recentSubmissions,
      recentRedemptions,
    };

    this.statsCache.set(days, { data: result, expiresAt: Date.now() + this.STATS_TTL_MS });
    return result;
  }

  async getAuditLogs(query: {
    action?: string;
    entity?: string;
    adminId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { action, entity, adminId, limit = 50, offset = 0 } = query;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          ...(action && { action }),
          ...(entity && { entity }),
          ...(adminId && { adminId }),
        },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({
        where: {
          ...(action && { action }),
          ...(entity && { entity }),
          ...(adminId && { adminId }),
        },
      }),
    ]);

    return { logs, total, limit, offset };
  }

  async getSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSetting(key: string, value: string, adminId: string) {
    const existing = await this.prisma.systemSetting.findUnique({ where: { key } });

    const updated = await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'UPDATE_SETTING',
        entity: 'SystemSetting',
        entityId: key,
        previousValue: existing?.value || null,
        newValue: value,
        notes: `Updated system setting: ${key}`,
      },
    });

    return updated;
  }
}
