import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesService } from './purchases.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { BadRequestException } from '@nestjs/common';

describe('PurchasesService (Business Rules & Anti-Fraud)', () => {
  let service: PurchasesService;
  let prisma: any;
  let emailService: any;
  let whatsappService: any;

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
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u-1', pointsBalance: 2000 }),
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
      $executeRaw: jest.fn().mockResolvedValue(1),
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    emailService = {
      sendPurchaseSubmittedEmail: jest.fn().mockResolvedValue({}),
      sendPurchaseApprovedEmail: jest.fn().mockResolvedValue({}),
      sendPurchaseRejectedEmail: jest.fn().mockResolvedValue({}),
      sendMoreInfoRequiredEmail: jest.fn().mockResolvedValue({}),
    };

    whatsappService = {
      sendPurchaseSubmittedAlert: jest.fn().mockResolvedValue({}),
      sendPurchaseApprovedAlert: jest.fn().mockResolvedValue({}),
      sendRejectionAlert: jest.fn().mockResolvedValue({}),
      sendMoreInfoAlert: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: { uploadFile: jest.fn() } },
        { provide: EmailService, useValue: emailService },
        { provide: WhatsAppService, useValue: whatsappService },
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
        service.submitPurchase(
          'user-1',
          {
            propFirmId: 'pf-1',
            accountType: '100k Challenge',
            orderId: 'ORD-DUP-123',
            purchaseDate: '2026-03-01',
            purchaseAmountUsd: 540,
            emailUsed: 'trader@example.com',
            referralCodeUsed: 'PROPNATION',
          },
          [],
        ),
      ).rejects.toThrow();
    });
  });

  describe('Purchase Approval and Points Awarding', () => {
    it('should forbid duplicate approval of an already approved purchase', async () => {
      prisma.purchaseSubmission.findUnique.mockResolvedValue({
        id: 'sub-1',
        status: 'APPROVED',
      });

      await expect(service.approvePurchase('sub-1', {}, 'admin-1')).rejects.toThrow(BadRequestException);
    });

    it('should conditionally update status and atomically credit points', async () => {
      const mockSubmission = {
        id: 'sub-pending',
        userId: 'u-1',
        status: 'PENDING',
        orderId: 'ORD-999',
        purchaseAmountUsd: 500,
        submissionCode: 'SUB-2026-1234',
        user: { id: 'u-1', name: 'Alex', email: 'alex@example.com', phone: '+123456789' },
        propFirm: { name: 'Apex Trader Funding' },
        offer: { rewardPoints: 5000 },
      };

      prisma.purchaseSubmission.findUnique.mockResolvedValue(mockSubmission);
      prisma.purchaseSubmission.updateMany.mockResolvedValue({ count: 1 });
      prisma.user.findUnique.mockResolvedValue({ id: 'u-1', pointsBalance: 7000 });

      const result = await service.approvePurchase('sub-pending', {}, 'admin-1');

      expect(prisma.purchaseSubmission.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-pending', status: { not: 'APPROVED' } },
        }),
      );
      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(result.newBalance).toBe(7000);
    });
  });

  describe('Purchase Rejection', () => {
    it('should record rejection reason and notify the trader', async () => {
      prisma.purchaseSubmission.findUnique.mockResolvedValue({
        id: 'sub-reject',
        userId: 'u-1',
        status: 'PENDING',
        submissionCode: 'SUB-2026-5555',
        propFirm: { name: 'Topstep' },
        user: { id: 'u-1', name: 'Alex', email: 'alex@example.com', phone: '+123456789' },
      });
      prisma.purchaseSubmission.update.mockResolvedValue({
        id: 'sub-reject',
        status: 'REJECTED',
        rejectionReason: 'Invalid receipt uploaded',
      });

      const result = await service.rejectPurchase(
        'sub-reject',
        { reason: 'Invalid receipt uploaded' },
        'admin-1',
      );

      expect(result.status).toBe('REJECTED');
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('Upload Security Filter (proofUploadOptions)', () => {
    // Dynamic import or testing proofUploadOptions directly
    const { proofUploadOptions } = require('./purchases.controller');

    it('should accept valid PNG image', (done) => {
      const mockFile = { originalname: 'receipt.png', mimetype: 'image/png' } as any;
      proofUploadOptions.fileFilter(null, mockFile, (err: any, accept: boolean) => {
        expect(err).toBeNull();
        expect(accept).toBe(true);
        done();
      });
    });

    it('should accept valid PDF document', (done) => {
      const mockFile = { originalname: 'invoice.pdf', mimetype: 'application/pdf' } as any;
      proofUploadOptions.fileFilter(null, mockFile, (err: any, accept: boolean) => {
        expect(err).toBeNull();
        expect(accept).toBe(true);
        done();
      });
    });

    it('should reject dangerous executable .exe', (done) => {
      const mockFile = { originalname: 'malware.exe', mimetype: 'application/x-msdownload' } as any;
      proofUploadOptions.fileFilter(null, mockFile, (err: any, accept: boolean) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(accept).toBe(false);
        done();
      });
    });

    it('should reject HTML files to prevent XSS payloads', (done) => {
      const mockFile = { originalname: 'phish.html', mimetype: 'text/html' } as any;
      proofUploadOptions.fileFilter(null, mockFile, (err: any, accept: boolean) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(accept).toBe(false);
        done();
      });
    });

    it('should reject SVG files to prevent embedded script execution', (done) => {
      const mockFile = { originalname: 'vector.svg', mimetype: 'image/svg+xml' } as any;
      proofUploadOptions.fileFilter(null, mockFile, (err: any, accept: boolean) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(accept).toBe(false);
        done();
      });
    });

    it('should reject spoofed mimetype with mismatched dangerous extension', (done) => {
      const mockFile = { originalname: 'exploit.sh', mimetype: 'image/png' } as any;
      proofUploadOptions.fileFilter(null, mockFile, (err: any, accept: boolean) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(accept).toBe(false);
        done();
      });
    });
  });
});

