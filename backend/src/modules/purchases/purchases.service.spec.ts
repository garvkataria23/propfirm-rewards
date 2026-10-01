import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesService } from './purchases.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('PurchasesService (Business Rules & Anti-Fraud)', () => {
  let service: PurchasesService;
  let prisma: any;
  let emailService: any;

  beforeEach(async () => {
    prisma = {
      propFirm: {
        findUnique: jest.fn(),
      },
      propFirmOffer: {
        findUnique: jest.fn(),
      },
      purchaseSubmission: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
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
    };

    emailService = {
      sendPurchaseSubmittedEmail: jest.fn().mockResolvedValue({}),
      sendPurchaseApprovedEmail: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: { uploadFile: jest.fn() } },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  describe('Anti-Fraud Duplicate Purchase Prevention', () => {
    it('should reject purchase submission if Order ID has already been approved previously', async () => {
      prisma.propFirm.findUnique.mockResolvedValue({ id: 'pf-1', name: 'FTMO' });
      prisma.purchaseSubmission.findFirst.mockResolvedValue({
        id: 'sub-existing',
        orderId: 'ORD-DUP-123',
        status: 'APPROVED',
      });

      await expect(
        service.submitPurchase('user-1', {
          propFirmId: 'pf-1',
          accountType: '$100K Challenge',
          orderId: 'ORD-DUP-123',
          purchaseDate: '2026-09-01',
          purchaseAmountUsd: 600,
          emailUsed: 'trader@example.com',
          referralCodeUsed: 'PROPREWARDS10',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject purchase submission if Order ID is currently under pending review', async () => {
      prisma.propFirm.findUnique.mockResolvedValue({ id: 'pf-1', name: 'FTMO' });
      prisma.purchaseSubmission.findFirst.mockResolvedValue({
        id: 'sub-pending',
        orderId: 'ORD-PENDING-456',
        status: 'PENDING',
      });

      await expect(
        service.submitPurchase('user-1', {
          propFirmId: 'pf-1',
          accountType: '$50K Challenge',
          orderId: 'ORD-PENDING-456',
          purchaseDate: '2026-09-01',
          purchaseAmountUsd: 390,
          emailUsed: 'trader@example.com',
          referralCodeUsed: 'PROPREWARDS10',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Purchase Approval and Points Awarding', () => {
    it('should calculate points according to offer and credit them via atomic PointsLedger', async () => {
      const mockSubmission = {
        id: 'sub-1',
        submissionCode: 'SUB-2026-1001',
        userId: 'user-1',
        status: 'PENDING',
        pointsAwarded: 5500,
        purchaseAmountUsd: 390,
        accountType: '$50K Challenge',
        orderId: 'ORD-999',
        user: { email: 'trader@example.com', name: 'Alex' },
        propFirm: { name: 'FTMO' },
      };

      prisma.purchaseSubmission.findUnique.mockResolvedValue(mockSubmission);
      prisma.pointsLedger.findFirst.mockResolvedValue({ balanceAfter: 2000 });
      prisma.purchaseSubmission.update.mockResolvedValue({ ...mockSubmission, status: 'APPROVED' });
      prisma.pointsLedger.create.mockResolvedValue({
        id: 'tx-1',
        points: 5500,
        balanceAfter: 7500,
      });

      const result = await service.approvePurchase('sub-1', {}, 'admin-1');

      expect(prisma.purchaseSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: expect.objectContaining({ status: 'APPROVED', pointsAwarded: 5500 }),
        }),
      );

      expect(prisma.pointsLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            type: 'PURCHASE_REWARD',
            points: 5500,
            balanceAfter: 7500,
          }),
        }),
      );

      expect(result.newBalance).toBe(7500);
    });

    it('should forbid duplicate approval of an already approved purchase', async () => {
      prisma.purchaseSubmission.findUnique.mockResolvedValue({
        id: 'sub-already-approved',
        status: 'APPROVED',
      });

      await expect(
        service.approvePurchase('sub-already-approved', {}, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Purchase Rejection', () => {
    it('should record rejection reason and notify the trader', async () => {
      const mockSubmission = {
        id: 'sub-to-reject',
        submissionCode: 'SUB-2026-9999',
        userId: 'user-1',
        status: 'PENDING',
        user: { email: 'trader@example.com', name: 'Alex' },
        propFirm: { name: 'FTMO' },
      };

      prisma.purchaseSubmission.findUnique.mockResolvedValue(mockSubmission);
      prisma.purchaseSubmission.update.mockResolvedValue({
        ...mockSubmission,
        status: 'REJECTED',
        rejectionReason: 'Invalid referral code used',
      });

      const result = await service.rejectPurchase(
        'sub-to-reject',
        { reason: 'Invalid referral code used' },
        'admin-1',
      );

      expect(prisma.purchaseSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-to-reject' },
          data: expect.objectContaining({
            status: 'REJECTED',
            rejectionReason: 'Invalid referral code used',
          }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
