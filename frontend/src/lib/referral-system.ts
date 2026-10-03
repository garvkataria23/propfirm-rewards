/**
 * Prop Nation - Universal 1-Click Referral & Challenge Configurator Engine
 * Automatically constructs pre-filling affiliate checkout URLs with
 * account size, trading platform, promo code, and unique SubID tracking,
 * copies referral code to clipboard, records active session,
 * and handles seamless return-to-verify workflows.
 */

export interface ActiveCheckoutSession {
  firmId: string;
  firmName: string;
  firmSlug: string;
  affiliateCode: string;
  targetUrl: string;
  activatedAt: string;
  trackingId?: string;
  tierName?: string;
  tierPrice?: number;
  discountedPrice?: number;
  expectedPoints?: number;
  platform?: string;
  accountType?: string;
  userEmail?: string;
}

export interface ChallengeConfigParams {
  tier?: string;
  price?: number;
  discountedPrice?: number;
  expectedPoints?: number;
  platform?: string;
  accountType?: string;
  trackingId?: string;
  email?: string;
}

const STORAGE_KEY = 'pn_active_checkout_intent';

/**
 * Generates an institutional unique tracking session ID (SubID)
 * Example: PN-TRK-74921
 */
export function generateTrackingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PN-TRK-${rand}`;
}

/**
 * Builds a Universal Auto-Apply Checkout URL with deep-linked challenge configurations.
 * Prop firms utilize diverse affiliate tracking and discount cart plugins
 * (WooCommerce, WHMCS, Shopify, Tapfiliate, Refersion, Rewardful, Stripe).
 * We stack all standard coupon, referral, tier, platform, and SubID parameters
 * so the prop firm's cart automatically ingests the referral code and pre-selects the tier.
 */
export function buildAutoApplyUrl(
  rawUrl: string,
  code: string = 'NATION',
  config?: ChallengeConfigParams
): string {
  if (!rawUrl) return '';

  const cleanCode = (code || 'NATION').trim();
  const lowerCode = cleanCode.toLowerCase();
  const upperCode = cleanCode.toUpperCase();
  const trackingId = config?.trackingId || generateTrackingId();

  try {
    const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);

    // 1. Universal affiliate referral tracking query parameters
    url.searchParams.set('ref', lowerCode);
    url.searchParams.set('aff', lowerCode);
    url.searchParams.set('affiliate', lowerCode);

    // 2. Universal SubID / ClickID attribution
    url.searchParams.set('subid', trackingId);
    url.searchParams.set('clickid', trackingId);
    url.searchParams.set('campaign', trackingId);

    // 3. Universal checkout cart coupon & discount auto-apply query parameters
    url.searchParams.set('coupon', upperCode);
    url.searchParams.set('discount', upperCode);
    url.searchParams.set('promo', upperCode);
    url.searchParams.set('code', upperCode);

    // 4. Challenge Tier & Account Size Pre-filling
    if (config?.tier) {
      const cleanTier = config.tier.replace(/[^0-9kK]/g, '').toLowerCase();
      url.searchParams.set('tier', cleanTier || config.tier);
      url.searchParams.set('plan', cleanTier || config.tier);
      url.searchParams.set('account_size', cleanTier || config.tier);
      url.searchParams.set('product', config.tier);
    }

    // 5. Trading Platform Pre-filling (MT5, cTrader, etc.)
    if (config?.platform) {
      const platformCode = config.platform.toLowerCase().includes('mt5')
        ? 'mt5'
        : config.platform.toLowerCase().includes('ctrader')
        ? 'ctrader'
        : config.platform.toLowerCase().includes('tradelocker')
        ? 'tradelocker'
        : 'mt5';
      url.searchParams.set('platform', platformCode);
    }

    // 6. Challenge Evaluation Model (2-step, 1-step, instant)
    if (config?.accountType) {
      const typeCode = config.accountType.toLowerCase().includes('1-step')
        ? '1-step'
        : config.accountType.toLowerCase().includes('instant')
        ? 'instant'
        : '2-step';
      url.searchParams.set('challenge_type', typeCode);
      url.searchParams.set('step', typeCode);
    }

    // 7. Customer Email Pre-filling for checkout carts
    if (config?.email && config.email.includes('@')) {
      url.searchParams.set('email', config.email.trim());
      url.searchParams.set('checkout[email]', config.email.trim());
    }

    return url.toString();
  } catch {
    const delimiter = rawUrl.includes('?') ? '&' : '?';
    let base = `${rawUrl}${delimiter}ref=${lowerCode}&coupon=${upperCode}&aff=${lowerCode}&discount=${upperCode}&promo=${upperCode}&subid=${trackingId}`;
    if (config?.tier) base += `&tier=${encodeURIComponent(config.tier)}`;
    if (config?.platform) base += `&platform=${encodeURIComponent(config.platform)}`;
    if (config?.email) base += `&email=${encodeURIComponent(config.email)}`;
    return base;
  }
}

/**
 * Activates referral tracking, pre-loads the code to the clipboard,
 * and saves active session for automatic pre-fill in purchase submission.
 */
export async function activateReferralIntent(
  firm: {
    id: string;
    name: string;
    slug: string;
    affiliateCode?: string;
    affiliateUrl?: string;
    websiteUrl?: string;
  },
  config?: ChallengeConfigParams
): Promise<{ autoApplyUrl: string; code: string; trackingId: string }> {
  const code = (firm.affiliateCode || 'NATION').trim().toUpperCase();
  const trackingId = config?.trackingId || generateTrackingId();
  const destinationBase = firm.affiliateUrl || firm.websiteUrl || `https://${firm.slug}.com`;
  
  const fullConfig: ChallengeConfigParams = {
    ...config,
    trackingId,
  };

  const autoApplyUrl = buildAutoApplyUrl(destinationBase, code, fullConfig);

  // 1. Seamless background clipboard copy
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code);
    }
  } catch {
    // Graceful fallback if clipboard permission is restricted
  }

  // 2. Save active checkout intent to localStorage
  if (typeof window !== 'undefined') {
    try {
      const session: ActiveCheckoutSession = {
        firmId: firm.id,
        firmName: firm.name,
        firmSlug: firm.slug,
        affiliateCode: code,
        targetUrl: autoApplyUrl,
        activatedAt: new Date().toISOString(),
        trackingId,
        tierName: config?.tier,
        tierPrice: config?.price,
        discountedPrice: config?.discountedPrice,
        expectedPoints: config?.expectedPoints,
        platform: config?.platform,
        accountType: config?.accountType,
        userEmail: config?.email,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable or disabled
    }
  }

  return { autoApplyUrl, code, trackingId };
}

/**
 * Retrieves the most recent checkout intent (within the last 48 hours).
 */
export function getActiveCheckoutIntent(): ActiveCheckoutSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ActiveCheckoutSession;
    if (!session || !session.activatedAt) return null;

    // Expire intent after 48 hours
    const ageMs = Date.now() - new Date(session.activatedAt).getTime();
    if (ageMs > 48 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Clears active checkout intent after purchase proof submission.
 */
export function clearActiveCheckoutIntent(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
