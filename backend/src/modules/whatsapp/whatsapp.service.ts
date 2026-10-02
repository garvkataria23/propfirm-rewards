import { Injectable, Logger } from '@nestjs/common';

export interface WhatsAppMessagePayload {
  to: string; // E.164 formatted number e.g. +14155552671
  type: 'template' | 'text';
  templateName?: string;
  parameters?: Record<string, string>;
  text?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiToken: string | undefined;
  private readonly phoneNumberId: string | undefined;
  private readonly isConfigured: boolean;

  constructor() {
    this.apiToken = process.env.WHATSAPP_API_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.isConfigured = Boolean(this.apiToken && this.phoneNumberId);

    if (this.isConfigured) {
      this.logger.log('✅ Meta WhatsApp Business Cloud API initialized with active credentials');
    } else {
      this.logger.log(
        'ℹ️ WhatsApp API credentials not set yet. WhatsAppService is in PRODUCTION SIMULATION mode. Messages will be pre-formatted and logged until WHATSAPP_API_TOKEN is connected.'
      );
    }
  }

  /**
   * Cleans and formats phone numbers to standard E.164 format
   */
  normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9+]/g, '');
    if (!cleaned.startsWith('+')) {
      // Default to + if missing
      cleaned = `+${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Universal message dispatcher (Live Meta Graph API or Clean Simulator)
   */
  async sendMessage(payload: WhatsAppMessagePayload): Promise<{ success: boolean; messageId?: string; simulated: boolean }> {
    const formattedRecipient = this.normalizePhoneNumber(payload.to);
    if (!formattedRecipient || formattedRecipient.length < 8) {
      this.logger.warn(`WhatsApp send skipped: invalid phone number "${payload.to}"`);
      return { success: false, simulated: false };
    }

    if (this.isConfigured) {
      try {
        const url = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;
        
        let body: any;
        if (payload.type === 'template' && payload.templateName) {
          body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedRecipient.replace('+', ''),
            type: 'template',
            template: {
              name: payload.templateName,
              language: { code: 'en_US' },
              components: [
                {
                  type: 'body',
                  parameters: Object.values(payload.parameters || {}).map((val) => ({
                    type: 'text',
                    text: String(val),
                  })),
                },
              ],
            },
          };
        } else {
          body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedRecipient.replace('+', ''),
            type: 'text',
            text: { body: payload.text },
          };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data: any = await res.json();
        if (res.ok) {
          const msgId = data?.messages?.[0]?.id;
          this.logger.log(`📱 WhatsApp sent to ${formattedRecipient} (MsgID: ${msgId})`);
          return { success: true, messageId: msgId, simulated: false };
        } else {
          this.logger.error(`Meta WhatsApp API error: ${JSON.stringify(data)}`);
          return { success: false, simulated: false };
        }
      } catch (err: any) {
        this.logger.error(`Failed to send WhatsApp message via Meta Cloud API: ${err.message}`);
        return { success: false, simulated: false };
      }
    } else {
      // Production Simulation Mode: Clean formatted log
      const previewText = payload.text || JSON.stringify(payload.parameters);
      this.logger.log(
        `\n🟢 [WHATSAPP NOTIFICATION ENGINE (Simulation Ready)]\n` +
        `├─ To: ${formattedRecipient}\n` +
        `├─ Type: ${payload.type.toUpperCase()}${payload.templateName ? ` (${payload.templateName})` : ''}\n` +
        `└─ Content: ${previewText}\n`
      );
      return { success: true, messageId: `SIM_WA_${Date.now()}`, simulated: true };
    }
  }

  /**
   * 1. Confirmation when trader submits a new prop firm purchase
   */
  async sendPurchaseSubmittedAlert(phone: string, traderName: string, submissionCode: string, firmName: string, orderId: string) {
    const text =
      `🎉 *PropNation Rewards: Purchase Received!*\n\n` +
      `Hey ${traderName}, your purchase submission for *${firmName}* has been received.\n\n` +
      `📋 *Tracking ID:* ${submissionCode}\n` +
      `🧾 *Order ID:* ${orderId}\n` +
      `⚡ *Status:* Under Review (Avg. 35 mins)\n\n` +
      `We will notify you on WhatsApp the moment your reward points are credited. Track status anytime at propnation.com/dashboard.`;

    return this.sendMessage({
      to: phone,
      type: 'text',
      text,
      templateName: 'purchase_submitted',
      parameters: { traderName, firmName, submissionCode, orderId },
    });
  }

  /**
   * 2. Alert when purchase is verified & points credited with 14-day anti-refund escrow info
   */
  async sendPurchaseApprovedAlert(phone: string, traderName: string, submissionCode: string, firmName: string, pointsAwarded: number, holdingDays = 14) {
    const text =
      `✅ *PropNation Rewards: Purchase Verified!*\n\n` +
      `Awesome news ${traderName}! Your *${firmName}* purchase (${submissionCode}) has been verified.\n\n` +
      `🪙 *Points Credited:* +${pointsAwarded.toLocaleString()} PTS\n` +
      `🛡️ *Status:* Verified & Clear in ${holdingDays} days (Anti-Refund Escrow)\n\n` +
      `Browse tech & gift cards at propnation.com/rewards to claim your next reward!`;

    return this.sendMessage({
      to: phone,
      type: 'text',
      text,
      templateName: 'purchase_approved',
      parameters: { traderName, firmName, points: String(pointsAwarded) },
    });
  }

  /**
   * 3. Alert when physical or digital reward order is dispatched
   */
  async sendRedemptionDispatchedAlert(
    phone: string,
    traderName: string,
    redemptionCode: string,
    rewardName: string,
    courier?: string,
    trackingNumber?: string,
    trackingUrl?: string,
    digitalCode?: string,
  ) {
    let dispatchDetails = '';
    if (digitalCode) {
      dispatchDetails = `🎁 *Your Digital Voucher Code:* \`${digitalCode}\`\nRedeem directly on retailer portal.`;
    } else {
      dispatchDetails =
        `🚚 *Courier:* ${courier || 'Express International'}\n` +
        `📦 *Tracking #:* ${trackingNumber || 'Available in Dashboard'}\n` +
        (trackingUrl ? `🔗 *Track Delivery:* ${trackingUrl}` : '');
    }

    const text =
      `🚀 *PropNation Rewards: Reward Order Dispatched!*\n\n` +
      `Hey ${traderName}, your order *${redemptionCode}* for *${rewardName}* has been processed!\n\n` +
      `${dispatchDetails}\n\n` +
      `Need help? Reply to this message or visit propnation.com/support/live.`;

    return this.sendMessage({
      to: phone,
      type: 'text',
      text,
      templateName: 'reward_dispatched',
      parameters: { traderName, redemptionCode, rewardName },
    });
  }

  /**
   * 4. Live WhatsApp Support Bot / Escalation ping
   */
  async sendSupportNotification(phone: string, traderName: string, ticketCode: string, agentMessage: string) {
    const text =
      `💬 *PropNation 24/7 Support Update*\n\n` +
      `Hello ${traderName}, support update for Ticket *#${ticketCode}*:\n\n` +
      `"${agentMessage}"\n\n` +
      `View your conversation or reply directly at propnation.com/support/live.`;

    return this.sendMessage({
      to: phone,
      type: 'text',
      text,
    });
  }
}
