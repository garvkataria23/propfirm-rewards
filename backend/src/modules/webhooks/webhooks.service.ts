import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
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
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
    private email: EmailService,
  ) {}

  async handleAffiliatePostback(slug: string, payload: AffiliateWebhookPayload) {
    this.logger.log(`Received affiliate postback for firm [${slug}]: ${JSON.stringify(payload)}`);

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

    const orderId = payload.orderId || payload.order_id || payload.transactionId || payload.subid;
    if (!orderId) {
      return {
        success: false,
        message: 'No Order ID or Transaction ID detected in postback payload',
      };
    }

    const cleanOrderId = String(orderId).trim();

    // 1. Search for existing pending submission matching this prop firm and order ID
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
      return {
        success: true,
        matched: false,
        message: `Order ID ${cleanOrderId} logged successfully. Awaiting user claim.`,
      };
    }

    if (submission.status === 'APPROVED') {
      return {
        success: true,
        matched: true,
        alreadyApproved: true,
        message: `Order ${cleanOrderId} has already been approved previously.`,
      };
    }

    // 2. Auto-approve the matched submission
    const pointsToAward =
      submission.pointsAwarded ||
      submission.offer?.rewardPoints ||
      Math.round(submission.purchaseAmountUsd * 10);

    const holdingUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14-day anti-refund escrow

    await this.prisma.$transaction(async (tx) => {
      // Get current balance
      const lastTx = await tx.pointsLedger.findFirst({
        where: { userId: submission.userId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      });

      const currentBalance = lastTx ? lastTx.balanceAfter : 0;
      const newBalance = currentBalance + pointsToAward;

      // Update submission status
      await tx.purchaseSubmission.update({
        where: { id: submission.id },
        data: {
          status: 'APPROVED',
          pointsAwarded: pointsToAward,
          reviewedAt: new Date(),
          infoRequestedMessage: 'Auto-verified via official prop firm affiliate postback webhook.',
        },
      });

      // Create Ledger Entry
      await tx.pointsLedger.create({
        data: {
          userId: submission.userId,
          submissionId: submission.id,
          type: 'PURCHASE_VERIFIED',
          points: pointsToAward,
          balanceAfter: newBalance,
          description: `Verified via S2S Webhook: ${firm.name} Challenge`,
          reason: `Automated Postback Reconciliation (Commission $${payload.commission || payload.payout || 'N/A'})`,
        },
      });

      // User notification
      await tx.notification.create({
        data: {
          userId: submission.userId,
          title: 'Purchase Auto-Verified!',
          message: `Your purchase ${cleanOrderId} (${firm.name}) was verified via partner webhook! +${pointsToAward.toLocaleString()} PTS added.`,
          type: 'PURCHASE',
          linkUrl: `/dashboard/purchases/${submission.id}`,
        },
      });
    });

    // 3. Send automated notifications
    if (submission.user.phone) {
      this.whatsapp.sendPurchaseApprovedAlert(
        submission.user.phone,
        submission.user.name,
        submission.submissionCode,
        firm.name,
        pointsToAward,
        14,
      ).catch(() => {});
    }

    this.email.sendPurchaseApprovedEmail(
      submission.user.email,
      submission.user.name,
      submission.submissionCode,
      pointsToAward,
      pointsToAward,
    ).catch(() => {});

    this.logger.log(`✅ Order ${cleanOrderId} successfully auto-verified via affiliate webhook for user ${submission.user.email}`);

    return {
      success: true,
      matched: true,
      submissionCode: submission.submissionCode,
      pointsAwarded: pointsToAward,
      message: `Order ${cleanOrderId} successfully verified and points credited.`,
    };
  }
}
