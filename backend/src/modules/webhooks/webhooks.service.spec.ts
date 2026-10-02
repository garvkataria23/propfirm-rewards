import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { EmailService } from '../email/email.service';
import { UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('WebhooksService (HMAC Authentication, Anti-Replay & Idempotency)', () => {
  let service: WebhooksService;
  let prisma: any;
  let whatsapp: any;
  let email: any;
  const SECRET = 'test-super-secret-webhook-key-2026';

  beforeEach(async () => {
    process.env.WEBHOOK_SECRET = SECRET;
    process.env.NODE_ENV = 'production';

    prisma = {
      propFirm: {
        findUnique: jest.fn().mockResolvedValue({ id: 'pf-ftmo', name: 'FTMO', slug: 'ftmo' }),
        findFirst: jest.fn().mockResolvedValue({ id: 'pf-ftmo', name: 'FTMO', slug: 'ftmo' }),
      },
      webhookEvent: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      purchaseSubmission: {
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      pointsLedger: {
        create: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $executeRaw: jest.fn().mockResolvedValue(1),
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    whatsapp = {
      sendPurchaseApprovedNotification: jest.fn().mockResolvedValue(undefined),
    };

    email = {
      sendPurchaseApprovedEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: WhatsAppService, useValue: whatsapp },
        { provide: EmailService, useValue: email },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  afterEach(() => {
    delete process.env.WEBHOOK_SECRET;
  });

  function generateSignature(payload: any, secret: string): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(raw).digest('hex');
  }

  it('should reject webhook request if signature is missing in production', async () => {
    const payload = { orderId: 'ORD-12345', amount: 300 };

    await expect(
      service.handleAffiliatePostback('ftmo', payload, {}),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject webhook request if HMAC signature is invalid or forged', async () => {
    const payload = { orderId: 'ORD-12345', amount: 300 };
    const invalidSignature = 'deadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678';

    await expect(
      service.handleAffiliatePostback('ftmo', payload, { signature: invalidSignature }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject webhook request if timestamp is expired (replay attack defense > 5 min)', async () => {
    const payload = { orderId: 'ORD-REPLAY-1', amount: 300 };
    const expiredTimestamp = (Date.now() - 10 * 60 * 1000).toString(); // 10 minutes ago
    const signature = generateSignature(payload, SECRET);

    await expect(
      service.handleAffiliatePostback('ftmo', payload, {
        signature,
        timestamp: expiredTimestamp,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should safely return idempotent replay if event has already been processed', async () => {
    const payload = { orderId: 'ORD-DUP-99', eventId: 'evt-dup-99', amount: 250 };
    const validSignature = generateSignature(payload, SECRET);

    prisma.webhookEvent.findUnique.mockResolvedValue({
      id: 'we-1',
      eventId: 'evt-dup-99',
      processed: true,
      statusCode: 200,
      responseBody: '{"success":true,"message":"Processed previously"}',
    });

    const result = await service.handleAffiliatePostback('ftmo', payload, {
      signature: validSignature,
      timestamp: Date.now().toString(),
    });

    expect(result.duplicate).toBe(true);
    expect(prisma.purchaseSubmission.updateMany).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('should verify signature and process matching submission with atomic points update', async () => {
    const payload = {
      orderId: 'ORD-VALID-555',
      eventId: 'evt-555',
      amount: 499,
      status: 'approved',
    };
    const validSignature = generateSignature(payload, SECRET);

    prisma.webhookEvent.findUnique.mockResolvedValue(null);
    prisma.webhookEvent.create.mockResolvedValue({ id: 'evt-rec-1' });

    prisma.propFirm.findUnique.mockResolvedValue({
      id: 'pf-ftmo',
      name: 'FTMO',
      slug: 'ftmo',
    });

    const mockSubmission = {
      id: 'sub-555',
      userId: 'user-77',
      status: 'PENDING',
      orderId: 'ORD-VALID-555',
      purchaseAmountUsd: 499,
      submissionCode: 'SUB-2026-FTMO',
      pointsAwarded: 5000,
      user: { id: 'user-77', name: 'Sam Trader', email: 'sam@trader.com' },
      propFirm: { name: 'FTMO' },
    };

    prisma.purchaseSubmission.findFirst.mockResolvedValue(mockSubmission);
    prisma.purchaseSubmission.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-77', pointsBalance: 5000 });

    const result = await service.handleAffiliatePostback('ftmo', payload, {
      signature: validSignature,
      timestamp: Date.now().toString(),
    });

    expect(result.success).toBe(true);
    expect(result.matched).toBe(true);
    expect(result.submissionCode).toBe('SUB-2026-FTMO');
    expect(prisma.$executeRaw).toHaveBeenCalled();
    expect(prisma.pointsLedger.create).toHaveBeenCalled();
  });
});
