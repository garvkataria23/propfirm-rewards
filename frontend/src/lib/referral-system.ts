/**
 * Prop Nation - Universal 1-Click Referral Auto-Apply Engine
 * Automatically constructs pre-filling affiliate checkout URLs,
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
}

const STORAGE_KEY = 'pn_active_checkout_intent';

/**
 * Builds a Universal Auto-Apply Checkout URL.
 * Prop firms utilize diverse affiliate tracking and discount cart plugins
 * (WooCommerce, WHMCS, Shopify, Tapfiliate, Refersion, Rewardful, Stripe).
 * We stack all standard coupon and referral parameters so the prop firm's
 * cart automatically ingests the referral code and pre-fills the discount box.
 */
export function buildAutoApplyUrl(rawUrl: string, code: string = 'NATION'): string {
  if (!rawUrl) return '';

  const cleanCode = (code || 'NATION').trim();
  const lowerCode = cleanCode.toLowerCase();
  const upperCode = cleanCode.toUpperCase();

  try {
    const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);

    // Universal affiliate referral tracking query parameters
    url.searchParams.set('ref', lowerCode);
    url.searchParams.set('aff', lowerCode);
    url.searchParams.set('affiliate', lowerCode);

    // Universal checkout cart coupon & discount auto-apply query parameters
    url.searchParams.set('coupon', upperCode);
    url.searchParams.set('discount', upperCode);
    url.searchParams.set('promo', upperCode);
    url.searchParams.set('code', upperCode);

    return url.toString();
  } catch {
    const delimiter = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${delimiter}ref=${lowerCode}&coupon=${upperCode}&aff=${lowerCode}&discount=${upperCode}&promo=${upperCode}`;
  }
}

/**
 * Activates referral tracking, pre-loads the code to the clipboard,
 * and saves active session for automatic pre-fill in purchase submission.
 */
export async function activateReferralIntent(firm: {
  id: string;
  name: string;
  slug: string;
  affiliateCode?: string;
  affiliateUrl?: string;
  websiteUrl?: string;
}): Promise<{ autoApplyUrl: string; code: string }> {
  const code = (firm.affiliateCode || 'NATION').trim().toUpperCase();
  const destinationBase = firm.affiliateUrl || firm.websiteUrl || `https://${firm.slug}.com`;
  const autoApplyUrl = buildAutoApplyUrl(destinationBase, code);

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
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable or disabled
    }
  }

  return { autoApplyUrl, code };
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
