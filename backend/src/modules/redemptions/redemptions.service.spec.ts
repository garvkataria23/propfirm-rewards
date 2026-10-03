import { Test, TestingModule } from '@nestjs/testing';
import { RedemptionsService } from './redemptions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RedemptionsService (State Machine & Financial Invariants)', () => {
  let service: RedemptionsService;
  let prisma: any;
  let emailService: any;
  let whatsappService: any;

  beforeEach(async () => {
    prisma = {
      redemption: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ pointsBalance: 3000 }),
      },
      reward: {
        update: jest.fn().mockResolvedValue({}),
      },
      pointsLedger: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
      $executeRaw: jest.fn().mockResolvedValue(1),
    };

    emailService = {
      sendRedemptionShippedEmail: jest.fn().mockResolvedValue({}),
      sendRedemptionDeliveredEmail: jest.fn().mockResolvedValue({}),
    };

    whatsappService = {
      sendRedemptionShippedAlert: jest.fn().mockResolvedValue({}),
      sendRedemptionDeliveredAlert: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedemptionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailService },
        { provide: WhatsAppService, useValue: whatsappService },
      ],
    }).compile();

    service = module.get<RedemptionsService>(RedemptionsService);
  });

  describe('updateStatus - Finite State Machine Guardrails', () => {
    it('should throw NotFoundException if redemption does not exist', async () => {
      prisma.redemption.findUnique.mockResolvedValue(null);
      await expect(
        service.updateStatus('non-existent-id', { status: 'SHIPPED' }, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject invalid transition SHIPPED -> CANCELLED with BadRequestException', async () => {
      prisma.redemption.findUnique.mockResolvedValue({
        id: 'red-1',
        status: 'SHIPPED',
        pointsSpent: 500,
        userId: 'user-1',
      });

      await expect(
        service.updateStatus('red-1', { status: 'CANCELLED' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition DELIVERED -> CANCELLED with BadRequestException', async () => {
      prisma.redemption.findUnique.mockResolvedValue({
        id: 'red-1',
        status: 'DELIVERED',
        pointsSpent: 500,
        userId: 'user-1',
      });

      await expect(
        service.updateStatus('red-1', { status: 'CANCELLED' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from terminal state CANCELLED -> PENDING', async () => {
      prisma.redemption.findUnique.mockResolvedValue({
        id: 'red-1',
        status: 'CANCELLED',
        pointsSpent: 500,
        userId: 'user-1',
      });

      await expect(
        service.updateStatus('red-1', { status: 'PENDING' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid transition PENDING -> CANCELLED and restore points and inventory', async () => {
      const mockRedemption = {
        id: 'red-1',
        status: 'PENDING',
        pointsSpent: 1000,
        userId: 'user-1',
        rewardId: 'reward-1',
        user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        reward: { id: 'reward-1', name: 'Hardware Wallet', isUnlimitedStock: false },
      };

      prisma.redemption.findUnique.mockResolvedValue(mockRedemption);
      prisma.redemption.update.mockResolvedValue({
        ...mockRedemption,
        status: 'CANCELLED',
      });
      prisma.pointsLedger.findFirst.mockResolvedValue({ balanceAfter: 2000 });
      prisma.pointsLedger.create.mockResolvedValue({});

      const result = await service.updateStatus('red-1', { status: 'CANCELLED', adminNotes: 'Trader requested' }, 'admin-1');

      expect(result.status).toBe('CANCELLED');
      expect(prisma.$executeRaw).toHaveBeenCalled(); // Point restore query
      expect(prisma.pointsLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            type: 'REFUND_REVERSAL',
            points: 1000,
            balanceBefore: 2000,
            balanceAfter: 3000,
          }),
        }),
      );
    });

    it('should allow valid transition SHIPPED -> DELIVERED', async () => {
      const mockRedemption = {
        id: 'red-1',
        status: 'SHIPPED',
        pointsSpent: 1000,
        userId: 'user-1',
        rewardId: 'reward-1',
        redemptionCode: 'PN-RED-001',
        user: { id: 'user-1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
        reward: { id: 'reward-1', name: 'Hardware Wallet', isUnlimitedStock: false },
      };

      prisma.redemption.findUnique.mockResolvedValue(mockRedemption);
      prisma.redemption.update.mockResolvedValue({
        ...mockRedemption,
        status: 'DELIVERED',
      });

      const result = await service.updateStatus('red-1', { status: 'DELIVERED' }, 'admin-1');

      expect(result.status).toBe('DELIVERED');
      // No refund should have been given
      expect(prisma.pointsLedger.create).not.toHaveBeenCalled();
    });

    it('should return existing redemption if target status equals current status', async () => {
      const mockRedemption = {
        id: 'red-1',
        status: 'PENDING',
        pointsSpent: 1000,
      };

      prisma.redemption.findUnique.mockResolvedValue(mockRedemption);
      const result = await service.updateStatus('red-1', { status: 'PENDING' }, 'admin-1');

      expect(result).toBe(mockRedemption);
      expect(prisma.redemption.update).not.toHaveBeenCalled();
    });
  });
});
