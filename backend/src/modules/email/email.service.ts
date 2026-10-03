import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'PropFirm Rewards <support@propfirmrewards.com>';
    this.frontendUrl = (process.env.FRONTEND_URL || 'https://propfirmrewards.com').replace(/\/$/, '');

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email provider initialized');
    } else {
      this.logger.log('RESEND_API_KEY not configured. Emails will be logged to console in dev mode.');
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    // Record into outbox
    const outbox = await this.prisma.notificationOutbox.create({
      data: {
        channel: 'EMAIL',
        recipient: to,
        subject,
        content: htmlContent.slice(0, 2000),
        status: 'PENDING',
        attempts: 1,
      },
    }).catch(() => null);

    if (this.resend) {
      try {
        const response = await this.resend.emails.send({
          from: this.fromEmail,
          to,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Email sent via Resend to ${to}: ${subject} (ID: ${response.data?.id})`);

        if (outbox) {
          await this.prisma.notificationOutbox.update({
            where: { id: outbox.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              metadata: JSON.stringify({ resendId: response.data?.id }),
            },
          }).catch(() => {});
        }

        return response;
      } catch (err: any) {
        this.logger.error(`Failed to send email via Resend to ${to}`, err);

        if (outbox) {
          await this.prisma.notificationOutbox.update({
            where: { id: outbox.id },
            data: {
              status: 'FAILED',
              error: err?.message || String(err),
            },
          }).catch(() => {});
        }

        throw err;
      }
    } else {
      this.logger.log(`\n📧 [DEV EMAIL SIMULATOR]\nTo: ${to}\nSubject: ${subject}\n---\n${htmlContent.replace(/<[^>]*>?/gm, ' ').substring(0, 300)}...\n`);
      if (outbox) {
        await this.prisma.notificationOutbox.update({
          where: { id: outbox.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            metadata: JSON.stringify({ simulated: true }),
          },
        }).catch(() => {});
      }
      return { data: { id: 'simulated_' + Date.now() } };
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: sans-serif; background-color: #0b0f17; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #10b981;">Welcome to PropFirm Rewards, ${name}!</h2>
        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
          Your trader account is now active. Buy eligible prop-firm challenges using our referral codes, submit your proof of purchase, and earn points redeemable for top-tier trading gear and gift cards.
        </p>
        <div style="margin: 24px 0;">
          <a href="${this.frontendUrl}/prop-firms" style="background-color: #10b981; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Explore Prop Firms</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you have any questions, our support team is available 24/7.</p>
      </div>
    `;
    return this.sendEmail(to, 'Welcome to PropFirm Rewards! 🚀', html);
  }

  async sendPurchaseSubmittedEmail(to: string, name: string, submissionCode: string, propFirmName: string) {
    const html = `
      <div style="font-family: sans-serif; background-color: #0b0f17; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #3b82f6;">Purchase Submission Received (${submissionCode})</h2>
        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
          Hi ${name}, we have received your purchase verification submission for <strong>${propFirmName}</strong>.
        </p>
        <p style="color: #94a3b8; font-size: 14px;">
          Our review team is verifying the order details against affiliate records. You will receive an automated notification as soon as points are credited.
        </p>
        <div style="margin: 24px 0;">
          <a href="${this.frontendUrl}/dashboard/purchases" style="background-color: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">View Submission Status</a>
        </div>
      </div>
    `;
    return this.sendEmail(to, `Purchase Submission Received: ${submissionCode}`, html);
  }

  async sendPurchaseApprovedEmail(to: string, name: string, submissionCode: string, points: number, newBalance: number) {
    const html = `
      <div style="font-family: sans-serif; background-color: #0b0f17; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #10b981;">Purchase Verified! +${points.toLocaleString()} Points Credited 🎉</h2>
        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
          Hi ${name}, congratulations! Your purchase submission <strong>${submissionCode}</strong> has been verified by our team.
        </p>
        <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #10b981; font-size: 24px; font-weight: bold;">+${points.toLocaleString()} Points</p>
          <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 14px;">Updated Available Balance: <strong>${newBalance.toLocaleString()} Points</strong></p>
        </div>
        <div style="margin: 24px 0;">
          <a href="${this.frontendUrl}/rewards" style="background-color: #10b981; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Explore Rewards Store</a>
        </div>
      </div>
    `;
    return this.sendEmail(to, `Purchase Verified: +${points.toLocaleString()} Points Added!`, html);
  }

  async sendRedemptionShippedEmail(to: string, name: string, redemptionCode: string, rewardName: string, courier: string, trackingNumber: string) {
    const html = `
      <div style="font-family: sans-serif; background-color: #0b0f17; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #8b5cf6;">Your Reward has Shipped! 📦</h2>
        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
          Hi ${name}, your redeemed item <strong>${rewardName}</strong> (Order: ${redemptionCode}) is on its way.
        </p>
        <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; color: #cbd5e1;"><strong>Courier:</strong> ${courier}</p>
          <p style="margin: 0; color: #cbd5e1;"><strong>Tracking Number:</strong> <span style="font-family: monospace; color: #8b5cf6;">${trackingNumber}</span></p>
        </div>
        <div style="margin: 24px 0;">
          <a href="${this.frontendUrl}/dashboard/redemptions" style="background-color: #8b5cf6; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Track Reward</a>
        </div>
      </div>
    `;
    return this.sendEmail(to, `Your Reward ${rewardName} Has Shipped!`, html);
  }
}
