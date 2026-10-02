export interface UserPurchaseRecord {
  id: string;
  submissionCode: string;
  propFirm: { name: string; logoUrl: string };
  accountType: string;
  orderId: string;
  accountId?: string;
  purchaseDate: string;
  purchaseAmountUsd: number;
  emailUsed: string;
  referralCodeUsed: string;
  pointsAwarded: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  infoRequestedMessage?: string;
  userResubmissionNotes?: string;
  proofs: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }[];
  createdAt: string;
}

export interface UserLedgerTransaction {
  id: string;
  type: string;
  points: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface UserRedemptionRecord {
  id: string;
  redemptionCode: string;
  pointsSpent: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  courier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingNotes?: string;
  voucherCode?: string;
  isDigital?: boolean;
  createdAt: string;
  updatedAt: string;
  reward: {
    name: string;
    imageUrl: string;
    description: string;
  };
}

const SEED_PURCHASES: Record<string, UserPurchaseRecord[]> = {
  'default_seed': [
    {
      id: 'pur-seed-1',
      submissionCode: 'PN-PUR-88214',
      propFirm: {
        name: 'Funding Pips',
        logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
      },
      accountType: '$100K 2-Step Evaluation',
      orderId: 'FP-98214',
      accountId: 'MT5-881920',
      purchaseDate: '2026-10-01',
      purchaseAmountUsd: 399.0,
      emailUsed: 'trader@example.com',
      referralCodeUsed: 'NATION',
      pointsAwarded: 4500,
      status: 'APPROVED',
      proofs: [
        {
          id: 'proof-1',
          fileUrl: '/demo-proofs/fundedsquad-invoice-sample.jpg',
          fileName: 'FundingPips_Official_Receipt_FP98214.pdf',
          fileType: 'application/pdf',
        },
      ],
      createdAt: '2026-10-01T08:30:00Z',
    },
    {
      id: 'pur-seed-2',
      submissionCode: 'PN-PUR-77402',
      propFirm: {
        name: 'FundedSquad',
        logoUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=120&auto=format&fit=crop&q=80',
      },
      accountType: '$50K Direct Evaluation',
      orderId: 'FS-51656',
      accountId: 'CTR-22019',
      purchaseDate: '2026-10-02',
      purchaseAmountUsd: 249.0,
      emailUsed: 'trader@example.com',
      referralCodeUsed: 'NATION',
      pointsAwarded: 2800,
      status: 'UNDER_REVIEW',
      proofs: [
        {
          id: 'proof-2',
          fileUrl: '/demo-proofs/order-confirmed-sample.jpg',
          fileName: 'FundedSquad_Payment_Proof.png',
          fileType: 'image/png',
        },
      ],
      createdAt: '2026-10-02T11:15:00Z',
    },
    {
      id: 'pur-seed-3',
      submissionCode: 'PN-PUR-66109',
      propFirm: {
        name: 'FTMO',
        logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
      },
      accountType: '$200K Challenge (Normal Risk)',
      orderId: 'FTMO-77301',
      accountId: 'MT5-901412',
      purchaseDate: '2026-09-24',
      purchaseAmountUsd: 1080.0,
      emailUsed: 'trader@example.com',
      referralCodeUsed: 'NATION',
      pointsAwarded: 11200,
      status: 'APPROVED',
      proofs: [
        {
          id: 'proof-3',
          fileUrl: '/demo-proofs/email-processing-sample.jpg',
          fileName: 'FTMO_Order_Confirmation_Receipt.png',
          fileType: 'image/png',
        },
      ],
      createdAt: '2026-09-24T14:20:00Z',
    },
  ],
};

const SEED_LEDGER: Record<string, UserLedgerTransaction[]> = {
  'default_seed': [
    {
      id: 'tx-1',
      type: 'PURCHASE_REWARD',
      points: 4500,
      balanceAfter: 15700,
      description: 'Funding Pips $100K 2-Step Evaluation verified (Order #FP-98214)',
      createdAt: '2026-10-01T08:35:00Z',
    },
    {
      id: 'tx-2',
      type: 'REDEMPTION',
      points: -22000,
      balanceAfter: 11200,
      description: 'Redeemed Apple AirPods Pro (2nd Gen - MagSafe USB-C)',
      createdAt: '2026-10-01T10:14:00Z',
    },
    {
      id: 'tx-3',
      type: 'PURCHASE_REWARD',
      points: 11200,
      balanceAfter: 33200,
      description: 'FTMO $200K Challenge purchase verified (Order #FTMO-77301)',
      createdAt: '2026-09-24T14:25:00Z',
    },
    {
      id: 'tx-4',
      type: 'WELCOME_BONUS',
      points: 1000,
      balanceAfter: 22000,
      description: 'Account activation welcome reward (+1,000 PTS)',
      createdAt: '2026-09-20T09:00:00Z',
    },
  ],
};

function normalizeKey(email?: string | null): string {
  if (!email) return 'anonymous';
  return email.toLowerCase().trim();
}

export const userDataStore = {
  // Purchases
  getUserPurchases(email: string): UserPurchaseRecord[] {
    if (typeof window === 'undefined') return [];
    const key = `propfirm_purchases_${normalizeKey(email)}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse purchases:', e);
      }
    }

    // If trader demo or primary user, return rich baseline seed
    const normalized = normalizeKey(email);
    if (normalized.includes('trader') || normalized.includes('garv') || normalized.includes('alex')) {
      const seed = SEED_PURCHASES['default_seed'];
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }

    return [];
  },

  addUserPurchase(email: string, purchase: UserPurchaseRecord): void {
    if (typeof window === 'undefined') return;
    const key = `propfirm_purchases_${normalizeKey(email)}`;
    const current = this.getUserPurchases(email);
    const updated = [purchase, ...current.filter((p) => p.id !== purchase.id && p.submissionCode !== purchase.submissionCode)];
    localStorage.setItem(key, JSON.stringify(updated));

    // Also record an entry in ledger as pending
    this.addUserLedgerTransaction(email, {
      id: `tx-${Date.now()}`,
      type: 'PURCHASE_PENDING',
      points: purchase.pointsAwarded,
      balanceAfter: this.calculateAvailablePoints(email),
      description: `Submitted ${purchase.propFirm.name} ${purchase.accountType} (Order #${purchase.orderId}) - Pending Escrow Verification`,
      createdAt: new Date().toISOString(),
    });
  },

  // Ledger / Points
  getUserLedger(email: string): UserLedgerTransaction[] {
    if (typeof window === 'undefined') return [];
    const key = `propfirm_ledger_${normalizeKey(email)}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse ledger:', e);
      }
    }

    const normalized = normalizeKey(email);
    if (normalized.includes('trader') || normalized.includes('garv') || normalized.includes('alex')) {
      const seed = SEED_LEDGER['default_seed'];
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }

    // Default welcome record for any new user
    const defaultTx: UserLedgerTransaction[] = [
      {
        id: `tx-welcome-${Date.now()}`,
        type: 'WELCOME_BONUS',
        points: 1000,
        balanceAfter: 1000,
        description: 'Welcome Bonus: Account registered & verified (+1,000 PTS)',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(key, JSON.stringify(defaultTx));
    return defaultTx;
  },

  addUserLedgerTransaction(email: string, tx: UserLedgerTransaction): void {
    if (typeof window === 'undefined') return;
    const key = `propfirm_ledger_${normalizeKey(email)}`;
    const current = this.getUserLedger(email);
    const updated = [tx, ...current];
    localStorage.setItem(key, JSON.stringify(updated));
  },

  calculateAvailablePoints(email: string): number {
    const purchases = this.getUserPurchases(email);
    const approvedPoints = purchases
      .filter((p) => p.status === 'APPROVED')
      .reduce((sum, p) => sum + p.pointsAwarded, 0);

    const redemptions = this.getUserRedemptions(email);
    const spentPoints = redemptions.reduce((sum, r) => sum + r.pointsSpent, 0);

    const bonus = 1000; // Welcome perk
    const balance = approvedPoints + bonus - spentPoints;
    return Math.max(balance, 1000);
  },

  calculatePendingPoints(email: string): number {
    const purchases = this.getUserPurchases(email);
    return purchases
      .filter((p) => p.status === 'PENDING' || p.status === 'UNDER_REVIEW')
      .reduce((sum, p) => sum + p.pointsAwarded, 0);
  },

  // Redemptions
  getUserRedemptions(email: string): UserRedemptionRecord[] {
    if (typeof window === 'undefined') return [];
    const key = `propfirm_redemptions_${normalizeKey(email)}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse redemptions:', e);
      }
    }
    return [];
  },

  addUserRedemption(email: string, rdm: UserRedemptionRecord): void {
    if (typeof window === 'undefined') return;
    const key = `propfirm_redemptions_${normalizeKey(email)}`;
    const current = this.getUserRedemptions(email);
    const updated = [rdm, ...current];
    localStorage.setItem(key, JSON.stringify(updated));

    // Ledger debit
    this.addUserLedgerTransaction(email, {
      id: `tx-rdm-${Date.now()}`,
      type: 'REDEMPTION',
      points: -rdm.pointsSpent,
      balanceAfter: this.calculateAvailablePoints(email) - rdm.pointsSpent,
      description: `Redeemed ${rdm.reward.name} (${rdm.redemptionCode})`,
      createdAt: new Date().toISOString(),
    });
  },
};
