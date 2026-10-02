import { Test, TestingModule } from '@nestjs/testing';
import { RewardsService } from './rewards.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BadRequestException } from '@nestjs/common';

describe('Rewards Anti-Double-Spend & Concurrency Protection', () => {
  let service: RewardsService;

  // In-memory atomic state simulating PostgreSQL row-level lock and condition
  let simulatedDb = {
    userBalance: 500,
    rewardStock: 10,
    successfulRedemptions: 0,
    failedRedemptions: 0,
  };

  beforeEach(async () => {
    simulatedDb = {
      userBalance: 500,
      rewardStock: 10,
      successfulRedemptions: 0,
      failedRedemptions: 0,
    };

    // Thread-safe mutex lock simulation mimicking PostgreSQL row-level exclusive lock during transaction
    let lockQueue: Promise<void> = Promise.resolve();
    const acquireLock = () => {
      let release: () => void;
      const nextLock = new Promise<void>((resolve) => {
        release = resolve;
      });
      const currentWait = lockQueue.then(() => release);
      lockQueue = lockQueue.then(() => nextLock);
      return currentWait;
    };

    const mockPrisma = {
      user: {
        findUnique: jest.fn().mockImplementation(async () => ({
          id: 'trader-1',
          name: 'Trader Concurrency',
          status: 'ACTIVE',
          pointsBalance: simulatedDb.userBalance,
        })),
      },
      pointsLedger: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(async ({ data }) => data),
      },
      reward: {
        findUnique: jest.fn().mockImplementation(async () => ({
          id: 'reward-500',
          name: 'TradingView 1 Month',
          isActive: true,
          isUnlimitedStock: false,
          stock: simulatedDb.rewardStock,
          pointsRequired: 500,
        })),
      },
      userAddress: {
        create: jest.fn().mockResolvedValue({ id: 'addr-mock' }),
      },
      redemption: {
        create: jest.fn().mockImplementation(async ({ data }) => ({
          id: `rdm-${Math.random().toString(36).slice(2)}`,
          ...data,
        })),
      },
      notification: {
        create: jest.fn().mockResolvedValue({}),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      $executeRaw: jest.fn().mockImplementation(async (strings: any, ...args: any[]) => {
        // Simulates Postgres atomic conditional updates:
        // 1. UPDATE "User" SET "pointsBalance" = "pointsBalance" - 500 WHERE "id" = 'trader-1' AND "pointsBalance" >= 500
        // 2. UPDATE "Reward" SET "stock" = "stock" - 1 WHERE "id" = 'reward-500' AND "stock" > 0
        const sql = Array.isArray(strings) ? strings.join(' ') : String(strings);
        if (sql.includes('User')) {
          if (simulatedDb.userBalance >= 500) {
            simulatedDb.userBalance -= 500;
            return 1;
          }
          return 0; // Balance insufficient
        }

        if (sql.includes('Reward')) {
          if (simulatedDb.rewardStock > 0) {
            simulatedDb.rewardStock -= 1;
            return 1;
          }
          return 0; // Stock exhausted
        }

        return 1;
      }),
      $transaction: jest.fn().mockImplementation(async (callback) => {
        // Enforce serializability under Postgres row lock
        const release = await acquireLock();
        try {
          return await callback(mockPrisma);
        } finally {
          release();
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: { sendRedemptionShippedEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('CRITICAL: 100 simultaneous redemption attempts for a 500-point reward must result in EXACTLY 1 success and 99 failures', async () => {
    const CONCURRENT_REQUESTS = 100;
    const requests = Array.from({ length: CONCURRENT_REQUESTS }, (_, idx) =>
      service.redeemReward('trader-1', 'reward-500', {
        fullName: `Trader Concurrency ${idx}`,
        idempotencyKey: `idem-key-${idx}`,
      }),
    );

    // Launch all 100 requests in parallel
    const results = await Promise.allSettled(requests);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // EXACTLY 1 request must succeed
    expect(fulfilled).toHaveLength(1);

    // EXACTLY 99 requests must be safely rejected
    expect(rejected).toHaveLength(99);

    // All 99 rejected requests must fail with BadRequestException (insufficient balance)
    for (const r of rejected) {
      if (r.status === 'rejected') {
        expect(r.reason).toBeInstanceOf(BadRequestException);
        expect(r.reason.message).toContain('Insufficient points balance');
      }
    }

    // Final balance in database must be strictly 0, never negative
    expect(simulatedDb.userBalance).toBe(0);
    // Stock must have decremented by exactly 1
    expect(simulatedDb.rewardStock).toBe(9);
  });
});
