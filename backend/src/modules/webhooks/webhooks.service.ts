import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { EmailService } from '../email/email.service';

export interface AffiliateWebhookPayload {
  orderId?: string;
  order_id?: string;
  transactionId?: string;
  subid?: string;
  amount?: number | string;
  payout?: number | string;
  commission?: number | string;
  status?: string;
  email?: string;
  secret?: string;
  signature?: string;
  timestamp?: string;
  eventId?: string;
  event_id?: string;
}

export interface WebhookSecurityContext {
  signature?: string;
  timestamp?: string;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
    private email: EmailService,
  ) {}

  /**
   * Cryptographically verifies HMAC-SHA256 signature using constant-time comparison
   */
  private verifyHmac(payloadString: string, signature: string, secret: string): boolean {
    try {
      const normalizedSig = signature.replace(/^sha256=/, '').trim();
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payloadString);
      const expectedDigest = hmac.digest('hex');

      const sigBuf = Buffer.from(normalizedSig, 'hex');
      const expectedBuf = Buffer.from(expectedDigest, 'hex');

      if (sigBuf.length !== expectedBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  async handleAffiliatePostback(
    slug: string,
    payload: AffiliateWebhookPayload,
    context?: WebhookSecurityContext,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // 1. Signature and Authentication Verification
    if (isProduction || webhookSecret) {
      if (!webhookSecret) {
        this.logger.error('CRITICAL: WEBHOOK_SECRET is not configured in environment!');
        throw new UnauthorizedException('Webhook processing disabled: missing server secret configuration');
      }

      const receivedSignature = context?.signature || payload.signature;
      if (!receivedSignature) {
        throw new UnauthorizedException('Missing required webhook signature (x-signature)');
      }

      // 2. Timestamp Verification & Replay Attack Defense (5-minute tolerance window)
      const receivedTimestamp = context?.timestamp || payload.timestamp;
      if (receivedTimestamp) {
        const timeVal = Number(receivedTimestamp);
        if (!isNaN(timeVal)) {
          // Normalize if passed in seconds instead of ms
          const eventTimeMs = timeVal < 10000000000 ? timeVal * 1000 : timeVal;
          const diffMs = Math.abs(Date.now() - eventTimeMs);
          const FIVE_MINUTES_MS = 5 * 60 * 1000;
          if (diffMs > FIVE_MINUTES_MS) {
            throw new BadRequestException('Webhook timestamp expired or outside tolerance window (replay detected)');
          }
        }
      }

      // Reconstruct deterministic string for HMAC check
      // Exclude signature field itself from verification payload
      const { signature: _sig, ...dataToVerify } = payload;
      const sortedKeys = Object.keys(dataToVerify).sort();
      const canonicalPayload = sortedKeys.map((k) => `${k}=${(dataToVerify as any)[k]}`).join('&');

      const isSignatureValid =
        this.verifyHmac(canonicalPayload, receivedSignature, webhookSecret) ||
        this.verifyHmac(JSON.stringify(payload), receivedSignature, webhookSecret);

      if (!isSignatureValid) {
        throw new UnauthorizedException('Invalid cryptographic webhook signature');
      }
    }

    // 3. Find Prop Firm
    const firm = await this.prisma.propFirm.findFirst({
      where: {
        OR: [
          { slug: slug.toLowerCase() },
          { name: { contains: slug, mode: 'insensitive' } },
        ],
      },
    });

    if (!firm) {
      throw new NotFoundException(`Prop firm with slug "${slug}" not found`);
    }

    // 4. Validate Order / Event ID
    const orderId = payload.orderId || payload.order_id || payload.transactionId || payload.subid;
    if (!orderId) {
      throw new BadRequestException('No Order ID or Transaction ID detected in postback payload');
    }

    const cleanOrderId = String(orderId).trim();
    const eventId =
      payload.eventId ||
      payload.event_id ||
      `evt_${firm.slug}_${cleanOrderId}_${context?.timestamp || Date.now()}`;

    // 5. Check Idempotency via WebhookEvent table
    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      this.logger.log(`[Idempotency] Webhook event ${eventId} has already been processed.`);
      return {
        success: true,
        duplicate: true,
        message: `Webhook event ${eventId} was previously received and processed.`,
      };
    }

    // Record webhook event receipt
    await this.prisma.webhookEvent.create({
      data: {
        provider: firm.slug,
        eventId,
        signature: context?.signature || 'verified',
        payload: JSON.stringify(payload),
        status: 'PROCESSING',
      },
    });

    // 6. Search for existing pending submission matching this prop firm and order ID
    const submission = await this.prisma.purchaseSubmission.findFirst({
      where: {
        propFirmId: firm.id,
        orderId: { equals: cleanOrderId, mode: 'insensitive' },
      },
      include: {
        user: true,
        offer: true,
      },
    });

    if (!submission) {
      this.logger.log(
        `Affiliate webhook received for order "${cleanOrderId}", but no user submission was found yet. Stored in queue.`
      );
      await this.prisma.webhookEvent.update({
        where: { eventId },
        data: { status: 'PENDING_USER_CLAIM' },
      });
      return {
        success: true,
        matched: false,
        message: `Order ID ${cleanOrderId} logged successfully. Awaiting user submission.`,
      };
    }

    if (submission.status === 'APPROVED') {
      await this.prisma.webhookEvent.update({
        where: { eventId },
        data: { status: 'ALREADY_APPROVED' },
      });
      return {
        success: true,
        matched: true,
        alreadyApproved: true,
        message: `Order ${cleanOrderId} has already been approved previously.`,
      };
    }

    // 7. Auto-approve the matched submission atomically
    const pointsToAward =
      submission.pointsAwarded ||
      submission.offer?.rewardPoints ||
      Math.round(Number(submission.purchaseAmountUsd) * 10);

    await this.prisma.$transaction(async (tx) => {
      // Conditional update ensures zero double-approvals during concurrent webhooks
      const updateCount = await tx.purchaseSubmission.updateMany({
        where: {
          id: submission.id,
          status: { not: 'APPROVED' },
        },
        data: {
          status: 'APPROVED',
          pointsAwarded: pointsToAward,
          reviewedAt: new Date(),
          infoRequestedMessage: 'Auto-verified via official partner affiliate postback webhook.',
        },
      });

      if (updateCount.count === 0) {
        return;
      }

      // Atomic points increment
      await tx.$executeRaw`
        UPDATE "User"
        SET "pointsBalance" = "pointsBalance" + ${pointsToAward}
        WHERE "id" = ${submission.userId}
      `;

      const updatedUser = await tx.user.findUnique({
        where: { id: submission.userId },
        select: { pointsBalance: true },
      });

      const newBalance = updatedUser?.pointsBalance ?? 0;
      const balanceBefore = newBalance - pointsToAward;

      // Immutable Ledger Entry
      await tx.pointsLedger.create({
        data: {
          userId: submission.userId,
          submissionId: submission.id,
          type: 'PURCHASE_VERIFIED',
          points: pointsToAward,
          balanceBefore,
          balanceAfter: newBalance,
          referenceType: 'WEBHOOK_POSTBACK',
          referenceId: eventId,
          idempotencyKey: `wh-${eventId}`,
          description: `Verified via S2S Webhook: ${firm.name} Challenge`,
          reason: `Automated Postback Reconciliation (Commission: $${payload.commission || payload.payout || 'N/A'})`,
        },
      });

      // User notification
      await tx.notification.create({
        data: {
          userId: submission.userId,
          title: 'Purchase Auto-Verified! 🎉',
          message: `Your purchase ${cleanOrderId} (${firm.name}) was verified via partner webhook! +${pointsToAward.toLocaleString()} points added.`,
          type: 'PURCHASE',
          linkUrl: `/dashboard/purchases/${submission.id}`,
        },
      });

      // Mark webhook event completed
      await tx.webhookEvent.update({
        where: { eventId },
        data: { status: 'PROCESSED' },
      });
    });

    // 8. Notifications
    if (submission.user.phone) {
      this.whatsapp
        .sendPurchaseApprovedAlert(
          submission.user.phone,
          submission.user.name,
          submission.submissionCode,
          firm.name,
          pointsToAward,
          14,
        )
        .catch(() => {});
    }

    this.email
      .sendPurchaseApprovedEmail(
        submission.user.email,
        submission.user.name,
        submission.submissionCode,
        pointsToAward,
        pointsToAward,
      )
      .catch(() => {});

    this.logger.log(
      `✅ Order ${cleanOrderId} successfully auto-verified via HMAC webhook for user ${submission.user.email}`,
    );

    return {
      success: true,
      matched: true,
      submissionCode: submission.submissionCode,
      pointsAwarded: pointsToAward,
      message: `Order ${cleanOrderId} successfully verified and points credited.`,
    };
  }
}
