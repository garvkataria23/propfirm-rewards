import { Test, TestingModule } from '@nestjs/testing';
import { RewardsService } from './rewards.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BadRequestException } from '@nestjs/common';

describe('RewardsService (Redemption & Inventory Rules)', () => {
  let service: RewardsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      reward: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      pointsLedger: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      redemption: {
        create: jest.fn(),
      },
      userAddress: {
        create: jest.fn(),
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
        RewardsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: { sendRedemptionShippedEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('should reject redemption if user is suspended', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-suspended',
      status: 'SUSPENDED',
    });

    await expect(
      service.redeemReward('user-suspended', 'reward-1', {}),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject redemption if reward is out of stock and not unlimited', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
    });

    prisma.reward.findUnique.mockResolvedValue({
      id: 'reward-out-of-stock',
      name: 'Ultra Wide Monitor',
      isActive: true,
      isUnlimitedStock: false,
      stock: 0,
      pointsRequired: 50000,
    });

    await expect(
      service.redeemReward('user-1', 'reward-out-of-stock', {}),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject redemption if user has insufficient points balance', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 'user-1',
        status: 'ACTIVE',
        pointsBalance: 10000,
      })
      .mockResolvedValueOnce({
        id: 'user-1',
        pointsBalance: 10000,
      });

    prisma.reward.findUnique.mockResolvedValue({
      id: 'reward-expensive',
      name: 'iPhone 16 Pro Max',
      isActive: true,
      isUnlimitedStock: false,
      stock: 5,
      pointsRequired: 120000,
    });

    // Postgres atomic conditional update matches 0 rows (pointsBalance < pointsRequired)
    prisma.$executeRaw.mockResolvedValue(0);

    await expect(
      service.redeemReward('user-1', 'reward-expensive', {}),
    ).rejects.toThrow(BadRequestException);
  });

  it('should succeed and atomically deduct points and decrement stock when requirements are met', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 'user-1',
        status: 'ACTIVE',
        country: 'United States',
        pointsBalance: 25000,
      })
      .mockResolvedValueOnce({
        id: 'user-1',
        pointsBalance: 15000,
      });

    const mockReward = {
      id: 'reward-mouse',
      name: 'Logitech MX Master 3S',
      isActive: true,
      isUnlimitedStock: false,
      stock: 10,
      pointsRequired: 10000,
    };
    prisma.reward.findUnique.mockResolvedValue(mockReward);

    // Both atomic balance decrement and stock decrement succeed with 1 affected row
    prisma.$executeRaw.mockResolvedValue(1);
    prisma.userAddress.create.mockResolvedValue({ id: 'addr-1' });

    prisma.redemption.create.mockResolvedValue({
      id: 'rdm-1',
      redemptionCode: 'RDM-2026-9081',
      userId: 'user-1',
      rewardId: 'reward-mouse',
      pointsSpent: 10000,
      status: 'PENDING',
    });

    prisma.pointsLedger.create.mockResolvedValue({
      id: 'tx-rdm',
      type: 'REDEMPTION',
      points: -10000,
      balanceBefore: 25000,
      balanceAfter: 15000,
    });

    const result = await service.redeemReward('user-1', 'reward-mouse', {
      fullName: 'Alex Morgan',
      addressLine1: '123 Wall St',
      city: 'New York',
      state: 'NY',
      postalCode: '10005',
    });

    // Verified atomic update was called
    expect(prisma.$executeRaw).toHaveBeenCalled();

    // Verified ledger created with negative points
    expect(prisma.pointsLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          type: 'REDEMPTION',
          points: -10000,
          balanceAfter: 15000,
        }),
      }),
    );

    expect(result.remainingBalance).toBe(15000);
    expect(result.pointsSpent).toBe(10000);
  });
});
