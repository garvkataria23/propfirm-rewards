import { Test, TestingModule } from '@nestjs/testing';
import { PointsService } from './points.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PointsService (Ledger & Admin Adjustments)', () => {
  let service: PointsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      pointsLedger: {
        findFirst: jest.fn(),
        create: jest.fn(),
        aggregate: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      purchaseSubmission: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      redemption: {
        count: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $executeRaw: jest.fn(),
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PointsService>(PointsService);
  });

  it('should reject admin adjustment if reason is empty or too short', async () => {
    await expect(
      service.adminAdjustPoints('user-1', { points: 1000, reason: '   ', description: 'Bonus' }, 'admin-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject negative deduction if it would make balance negative (affectedRows === 0)', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', name: 'Alex', pointsBalance: 500 });
    // Postgres atomic conditional update matches 0 rows because balance < deduction
    prisma.$executeRaw.mockResolvedValue(0);

    await expect(
      service.adminAdjustPoints(
        'user-1',
        { points: -2000, reason: 'Chargeback on challenge', description: 'Reversal' },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should credit points safely with atomic raw query and audit record', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'user-1', name: 'Alex', email: 'alex@example.com', pointsBalance: 3000 })
      .mockResolvedValueOnce({ id: 'user-1', pointsBalance: 5000 });
    prisma.$executeRaw.mockResolvedValue(1);
    prisma.pointsLedger.create.mockResolvedValue({
      id: 'tx-bonus',
      points: 2000,
      balanceBefore: 3000,
      balanceAfter: 5000,
      reason: 'Top performer monthly bonus',
    });

    const result = await service.adminAdjustPoints(
      'user-1',
      { points: 2000, reason: 'Top performer monthly bonus', description: 'Performance reward' },
      'admin-1',
    );

    expect(prisma.$executeRaw).toHaveBeenCalled();
    expect(prisma.pointsLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          type: 'ADMIN_CREDIT',
          points: 2000,
          balanceAfter: 5000,
          reason: 'Top performer monthly bonus',
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalled();
    expect(result.newBalance).toBe(5000);
  });
});
