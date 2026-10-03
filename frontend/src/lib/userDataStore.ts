import {
  auth,
  db,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from '@/lib/firebase';

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

const LEGACY_SEED_PURCHASE_IDS = new Set(['pur-seed-1', 'pur-seed-2', 'pur-seed-3']);
const LEGACY_SEED_TX_IDS = new Set(['tx-1', 'tx-2', 'tx-3', 'tx-4']);

function isLegacySeedPurchase(p: UserPurchaseRecord): boolean {
  return LEGACY_SEED_PURCHASE_IDS.has(p.id);
}

function isLegacySeedTx(tx: UserLedgerTransaction): boolean {
  return LEGACY_SEED_TX_IDS.has(tx.id) || tx.id.startsWith('tx-welcome-');
}

function normalizeKey(email?: string | null): string {
  if (!email) return 'anonymous';
  return email.toLowerCase().trim();
}

export const userDataStore = {
  // Purchases — starts empty (0 data) for all new accounts
  getUserPurchases(email: string): UserPurchaseRecord[] {
    if (typeof window === 'undefined') return [];
    const key = `propfirm_v2_purchases_${normalizeKey(email)}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: UserPurchaseRecord[] = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((p) => !isLegacySeedPurchase(p)) : [];
      } catch (e) {
        console.error('Failed to parse purchases:', e);
      }
    }
    return [];
  },

  addUserPurchase(email: string, purchase: UserPurchaseRecord): void {
    if (typeof window === 'undefined') return;
    const key = `propfirm_v2_purchases_${normalizeKey(email)}`;
    const current = this.getUserPurchases(email);
    const updated = [purchase, ...current.filter((p) => p.id !== purchase.id && p.submissionCode !== purchase.submissionCode)];
    localStorage.setItem(key, JSON.stringify(updated));

    // Persist to Cloud Firestore if authenticated
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'users', uid, 'purchases', purchase.id), {
        ...purchase,
        userId: uid,
        userEmail: normalizeKey(email),
        syncedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'purchases', purchase.id), {
        ...purchase,
        userId: uid,
        userEmail: normalizeKey(email),
        syncedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }

    // Record an entry in ledger for the submitted purchase
    this.addUserLedgerTransaction(email, {
      id: `tx-${Date.now()}`,
      type: 'PURCHASE_PENDING',
      points: purchase.pointsAwarded,
      balanceAfter: this.calculateAvailablePoints(email),
      description: `Submitted ${purchase.propFirm.name} ${purchase.accountType} (Order #${purchase.orderId}) - Pending Escrow Verification`,
      createdAt: new Date().toISOString(),
    });
  },

  // Ledger / Points — starts empty (0 data) for all new accounts
  getUserLedger(email: string): UserLedgerTransaction[] {
    if (typeof window === 'undefined') return [];
    const key = `propfirm_v2_ledger_${normalizeKey(email)}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: UserLedgerTransaction[] = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((tx) => !isLegacySeedTx(tx)) : [];
      } catch (e) {
        console.error('Failed to parse ledger:', e);
      }
    }
    return [];
  },

  addUserLedgerTransaction(email: string, tx: UserLedgerTransaction): void {
    if (typeof window === 'undefined') return;
    const key = `propfirm_v2_ledger_${normalizeKey(email)}`;
    const current = this.getUserLedger(email);
    const updated = [tx, ...current.filter((t) => t.id !== tx.id)];
    localStorage.setItem(key, JSON.stringify(updated));

    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'users', uid, 'ledger', tx.id), {
        ...tx,
        userId: uid,
        userEmail: normalizeKey(email),
        syncedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'users', uid), {
        points: {
          available: this.calculateAvailablePoints(email),
          pending: this.calculatePendingPoints(email),
          lifetimeEarned: this.calculateTotalEarnedPoints(email),
          lifetimeRedeemed: this.calculateTotalRedeemedPoints(email),
        },
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }
  },

  calculateAvailablePoints(email: string): number {
    const approvedPoints = this.calculateTotalEarnedPoints(email);
    const spentPoints = this.calculateTotalRedeemedPoints(email);
    return Math.max(approvedPoints - spentPoints, 0);
  },

  calculatePendingPoints(email: string): number {
    const purchases = this.getUserPurchases(email);
    return purchases
      .filter((p) => p.status === 'PENDING' || p.status === 'UNDER_REVIEW')
      .reduce((sum, p) => sum + p.pointsAwarded, 0);
  },

  calculateTotalEarnedPoints(email: string): number {
    const purchases = this.getUserPurchases(email);
    return purchases
      .filter((p) => p.status === 'APPROVED')
      .reduce((sum, p) => sum + p.pointsAwarded, 0);
  },

  calculateTotalRedeemedPoints(email: string): number {
    const redemptions = this.getUserRedemptions(email);
    return redemptions.reduce((sum, r) => sum + r.pointsSpent, 0);
  },

  // Redemptions — starts empty (0 data) for all new accounts
  getUserRedemptions(email: string): UserRedemptionRecord[] {
    if (typeof window === 'undefined') return [];
    const key = `propfirm_v2_redemptions_${normalizeKey(email)}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse redemptions:', e);
      }
    }
    return [];
  },

  addUserRedemption(email: string, rdm: UserRedemptionRecord): void {
    if (typeof window === 'undefined') return;
    const key = `propfirm_v2_redemptions_${normalizeKey(email)}`;
    const current = this.getUserRedemptions(email);
    const updated = [rdm, ...current.filter((r) => r.id !== rdm.id && r.redemptionCode !== rdm.redemptionCode)];
    localStorage.setItem(key, JSON.stringify(updated));

    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'users', uid, 'redemptions', rdm.id), {
        ...rdm,
        userId: uid,
        userEmail: normalizeKey(email),
        syncedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'redemptions', rdm.id), {
        ...rdm,
        userId: uid,
        userEmail: normalizeKey(email),
        syncedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }

    // Ledger debit
    this.addUserLedgerTransaction(email, {
      id: `tx-rdm-${Date.now()}`,
      type: 'REDEMPTION',
      points: -rdm.pointsSpent,
      balanceAfter: this.calculateAvailablePoints(email),
      description: `Redeemed ${rdm.reward.name} (${rdm.redemptionCode})`,
      createdAt: new Date().toISOString(),
    });
  },

  async syncFromFirestore(uid: string, email: string): Promise<void> {
    if (typeof window === 'undefined' || !uid || !email) return;
    try {
      const normalized = normalizeKey(email);
      const [purchasesSnap, ledgerSnap, redemptionsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users', uid, 'purchases'), orderBy('createdAt', 'desc'), limit(50))).catch(() => null),
        getDocs(query(collection(db, 'users', uid, 'ledger'), orderBy('createdAt', 'desc'), limit(50))).catch(() => null),
        getDocs(query(collection(db, 'users', uid, 'redemptions'), orderBy('createdAt', 'desc'), limit(50))).catch(() => null),
      ]);

      if (purchasesSnap && !purchasesSnap.empty) {
        const remotePurchases = purchasesSnap.docs
          .map((d) => d.data() as UserPurchaseRecord)
          .filter((p) => !isLegacySeedPurchase(p));
        const localPurchases = this.getUserPurchases(email);
        const merged = [...remotePurchases, ...localPurchases].filter(
          (item, index, self) => index === self.findIndex((p) => p.id === item.id || p.submissionCode === item.submissionCode)
        );
        localStorage.setItem(`propfirm_v2_purchases_${normalized}`, JSON.stringify(merged));
      }

      if (ledgerSnap && !ledgerSnap.empty) {
        const remoteLedger = ledgerSnap.docs
          .map((d) => d.data() as UserLedgerTransaction)
          .filter((tx) => !isLegacySeedTx(tx));
        const localLedger = this.getUserLedger(email);
        const merged = [...remoteLedger, ...localLedger].filter(
          (item, index, self) => index === self.findIndex((t) => t.id === item.id)
        );
        localStorage.setItem(`propfirm_v2_ledger_${normalized}`, JSON.stringify(merged));
      }

      if (redemptionsSnap && !redemptionsSnap.empty) {
        const remoteRedemptions = redemptionsSnap.docs.map((d) => d.data() as UserRedemptionRecord);
        const localRedemptions = this.getUserRedemptions(email);
        const merged = [...remoteRedemptions, ...localRedemptions].filter(
          (item, index, self) => index === self.findIndex((r) => r.id === item.id || r.redemptionCode === item.redemptionCode)
        );
        localStorage.setItem(`propfirm_v2_redemptions_${normalized}`, JSON.stringify(merged));
      }
    } catch {
      // Non-blocking sync
    }
  },
};
