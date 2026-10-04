'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Coins,
} from 'lucide-react';

interface PropFirmOffer {
  id: string;
  accountTierName: string;
  purchasePriceUsd: number;
  rewardPoints: number;
  isActive: boolean;
}

interface PropFirm {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  websiteUrl: string;
  affiliateCode: string;
  affiliateUrl: string;
  eligibilityTerms?: string;
  isActive: boolean;
  offers: PropFirmOffer[];
}

const DEFAULT_ADMIN_PROP_FIRMS: PropFirm[] = [
  {
    id: 'firm-1',
    name: 'Funding Pips',
    slug: 'funding-pips',
    logoUrl: '',
    description: 'Industry-leading prop firm with weekly payouts, zero minimum trading days, and 100% reward points.',
    websiteUrl: 'https://fundingpips.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://app.fundingpips.com/register?ref=NATION',
    eligibilityTerms: 'Must apply code NATION at checkout. Valid on all 1-Step and 2-Step Evaluation accounts.',
    isActive: true,
    offers: [
      { id: 'off-1', accountTierName: '$10,000 2-Step Evaluation', purchasePriceUsd: 59, rewardPoints: 5900, isActive: true },
      { id: 'off-2', accountTierName: '$50,000 2-Step Evaluation', purchasePriceUsd: 239, rewardPoints: 23900, isActive: true },
      { id: 'off-3', accountTierName: '$100,000 2-Step Evaluation', purchasePriceUsd: 399, rewardPoints: 39900, isActive: true },
    ],
  },
  {
    id: 'firm-2',
    name: 'FTMO',
    slug: 'ftmo',
    logoUrl: '',
    description: 'Global gold-standard proprietary trading firm offering up to $200,000 challenges and 90% profit split.',
    websiteUrl: 'https://ftmo.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://trader.ftmo.com/?affiliates=NATION',
    eligibilityTerms: 'Must register or purchase via official NATION partner link.',
    isActive: true,
    offers: [
      { id: 'off-4', accountTierName: '$25,000 FTMO Challenge', purchasePriceUsd: 250, rewardPoints: 25000, isActive: true },
      { id: 'off-5', accountTierName: '$100,000 FTMO Challenge', purchasePriceUsd: 540, rewardPoints: 54000, isActive: true },
      { id: 'off-6', accountTierName: '$200,000 FTMO Challenge', purchasePriceUsd: 1080, rewardPoints: 108000, isActive: true },
    ],
  },
  {
    id: 'firm-3',
    name: 'FundedNext',
    slug: 'fundednext',
    logoUrl: '',
    description: '15% profit share during challenge phases with Stellar 1-Step and 2-Step evaluations.',
    websiteUrl: 'https://fundednext.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://fundednext.com/?fpr=NATION',
    eligibilityTerms: 'Apply coupon code NATION at checkout for instant discount + 100 pts/$1.',
    isActive: true,
    offers: [
      { id: 'off-7', accountTierName: '$50,000 Stellar 2-Step', purchasePriceUsd: 299, rewardPoints: 29900, isActive: true },
      { id: 'off-8', accountTierName: '$100,000 Stellar 2-Step', purchasePriceUsd: 549, rewardPoints: 54900, isActive: true },
    ],
  },
  {
    id: 'firm-4',
    name: 'The5ers',
    slug: 'the5ers',
    logoUrl: '',
    description: 'Instant funding and High Stakes evaluation programs with scaling up to $4,000,000.',
    websiteUrl: 'https://the5ers.com',
    affiliateCode: 'NATION',
    affiliateUrl: 'https://the5ers.com/?ref=NATION',
    eligibilityTerms: 'Use code NATION at checkout.',
    isActive: true,
    offers: [
      { id: 'off-9', accountTierName: '$60,000 High Stakes', purchasePriceUsd: 300, rewardPoints: 30000, isActive: true },
      { id: 'off-10', accountTierName: '$100,000 High Stakes', purchasePriceUsd: 495, rewardPoints: 49500, isActive: true },
    ],
  },
];

const FIRMS_STORAGE_KEY = 'propfirm_admin_firms_v2';

export default function AdminPropFirmsPage() {
  const [propFirms, setPropFirms] = useState<PropFirm[]>(DEFAULT_ADMIN_PROP_FIRMS);
  const [loading, setLoading] = useState(false);

  // Prop firm create/edit modal
  const [editingFirm, setEditingFirm] = useState<PropFirm | null>(null);
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  const [firmForm, setFirmForm] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    description: '',
    websiteUrl: '',
    affiliateCode: 'NATION',
    affiliateUrl: '',
    eligibilityTerms: '',
    isActive: true,
  });

  // Offer modal
  const [managingFirmOffers, setManagingFirmOffers] = useState<PropFirm | null>(null);
  const [newOffer, setNewOffer] = useState({
    accountTierName: '',
    purchasePriceUsd: '',
    rewardPoints: '',
  });

  const persistFirms = (updated: PropFirm[]) => {
    setPropFirms(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FIRMS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const fetchFirms = () => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(FIRMS_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPropFirms(parsed);
          }
        }
      } catch {}
    }

    api
      .get<PropFirm[]>('/prop-firms', { includeInactive: true })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          persistFirms(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  const handleOpenAddFirm = () => {
    setEditingFirm(null);
    setFirmForm({
      name: '',
      slug: '',
      logoUrl: '',
      description: '',
      websiteUrl: '',
      affiliateCode: 'NATION',
      affiliateUrl: '',
      eligibilityTerms: '',
      isActive: true,
    });
    setIsFirmModalOpen(true);
  };

  const handleOpenEditFirm = (f: PropFirm) => {
    setEditingFirm(f);
    setFirmForm({
      name: f.name,
      slug: f.slug,
      logoUrl: f.logoUrl || '',
      description: f.description,
      websiteUrl: f.websiteUrl,
      affiliateCode: f.affiliateCode,
      affiliateUrl: f.affiliateUrl,
      eligibilityTerms: f.eligibilityTerms || '',
      isActive: f.isActive,
    });
    setIsFirmModalOpen(true);
  };

  const handleSaveFirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFirm) {
        await api.put(`/prop-firms/${editingFirm.id}`, firmForm);
      } else {
        await api.post('/prop-firms', firmForm);
      }
    } catch {
      // Fallback to instant local persistence
    }

    if (editingFirm) {
      persistFirms(
        propFirms.map((f) => (f.id === editingFirm.id ? { ...f, ...firmForm } : f))
      );
    } else {
      const created: PropFirm = {
        id: `firm-${Date.now()}`,
        ...firmForm,
        offers: [],
      };
      persistFirms([created, ...propFirms]);
    }
    setIsFirmModalOpen(false);
  };

  const handleDeleteFirm = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate or delete this prop firm?')) return;
    try {
      await api.delete(`/prop-firms/${id}`);
    } catch {}
    persistFirms(propFirms.filter((f) => f.id !== id));
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingFirmOffers) return;

    const price = parseFloat(newOffer.purchasePriceUsd) || 0;
    const pts = parseInt(newOffer.rewardPoints, 10) || Math.round(price * 100);
    const createdOffer: PropFirmOffer = {
      id: `off-${Date.now()}`,
      accountTierName: newOffer.accountTierName,
      purchasePriceUsd: price,
      rewardPoints: pts,
      isActive: true,
    };

    try {
      await api.post(`/prop-firms/${managingFirmOffers.id}/offers`, {
        accountTierName: createdOffer.accountTierName,
        purchasePriceUsd: createdOffer.purchasePriceUsd,
        rewardPoints: createdOffer.rewardPoints,
      });
    } catch {}

    const updatedFirm: PropFirm = {
      ...managingFirmOffers,
      offers: [...(managingFirmOffers.offers || []), createdOffer],
    };
    setManagingFirmOffers(updatedFirm);
    persistFirms(propFirms.map((f) => (f.id === updatedFirm.id ? updatedFirm : f)));
    setNewOffer({ accountTierName: '', purchasePriceUsd: '', rewardPoints: '' });
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Remove this offer tier?')) return;
    try {
      await api.delete(`/prop-firms/offers/${offerId}`);
    } catch {}
    if (managingFirmOffers) {
      const updatedFirm: PropFirm = {
        ...managingFirmOffers,
        offers: managingFirmOffers.offers.filter((o) => o.id !== offerId),
      };
      setManagingFirmOffers(updatedFirm);
      persistFirms(propFirms.map((f) => (f.id === updatedFirm.id ? updatedFirm : f)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Prop Firms &amp; Referral Offers
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Configure partner prop firms, affiliate referral links, discount codes, and challenge tier points.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={handleOpenAddFirm}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Add New Prop Firm
        </Button>
      </div>

      {/* Grid of Prop Firms */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading prop firms...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {propFirms.map((firm) => (
            <Card key={firm.id} className="p-6 space-y-5 card-hover-glow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {firm.logoUrl ? (
                      <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-900 dark:text-white text-lg">{firm.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 dark:text-white text-base">{firm.name}</h3>
                      <Badge variant={firm.isActive ? 'success' : 'danger'}>
                        {firm.isActive ? 'ACTIVE' : 'DISABLED'}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Slug: {firm.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditFirm(firm)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit firm"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFirm(firm.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete firm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Codes & links */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5">Referral Code:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{firm.affiliateCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5">Affiliate URL:</span>
                  <a
                    href={firm.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-800 dark:text-slate-200 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 truncate block"
                  >
                    {firm.affiliateUrl}
                  </a>
                </div>
              </div>

              {/* Challenge offers count & manage button */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {firm.offers?.length || 0} Challenge Offer Tiers Configured
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setManagingFirmOffers(firm)}
                  className="text-xs"
                >
                  <Coins className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                  Configure Offers &amp; Points
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Prop Firm Add/Edit Modal */}
      <Modal
        isOpen={isFirmModalOpen}
        onClose={() => setIsFirmModalOpen(false)}
        title={editingFirm ? `Edit ${editingFirm.name}` : 'Add New Prop Firm'}
        description="Configure prop firm branding, affiliate tracking links, and promo codes."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveFirm} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Prop Firm Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Funding Pips"
                value={firmForm.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFirmForm({
                    ...firmForm,
                    name: val,
                    slug: !editingFirm ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-') : firmForm.slug,
                  });
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">URL Slug *</label>
              <input
                type="text"
                required
                placeholder="e.g. funding-pips"
                value={firmForm.slug}
                onChange={(e) => setFirmForm({ ...firmForm, slug: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold">Logo Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={firmForm.logoUrl}
              onChange={(e) => setFirmForm({ ...firmForm, logoUrl: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold">Short Description *</label>
            <textarea
              rows={2}
              required
              placeholder="Firm overview, profit splits, drawdown models..."
              value={firmForm.description}
              onChange={(e) => setFirmForm({ ...firmForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Official Website URL *</label>
              <input
                type="url"
                required
                placeholder="https://propfirm.com"
                value={firmForm.websiteUrl}
                onChange={(e) => setFirmForm({ ...firmForm, websiteUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Affiliate Tracking Link *</label>
              <input
                type="url"
                required
                placeholder="https://propfirm.com?ref=proprewards"
                value={firmForm.affiliateUrl}
                onChange={(e) => setFirmForm({ ...firmForm, affiliateUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold">Referral / Coupon Code *</label>
            <input
              type="text"
              required
              placeholder="NATION"
              value={firmForm.affiliateCode}
              onChange={(e) => setFirmForm({ ...firmForm, affiliateCode: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold">Eligibility Terms</label>
            <input
              type="text"
              placeholder="e.g. Valid for 2-step evaluation challenges only."
              value={firmForm.eligibilityTerms}
              onChange={(e) => setFirmForm({ ...firmForm, eligibilityTerms: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={firmForm.isActive}
              onChange={(e) => setFirmForm({ ...firmForm, isActive: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-700 text-emerald-600"
            />
            <label htmlFor="isActive" className="text-slate-700 dark:text-slate-300 font-semibold">
              Prop Firm is Active (visible to traders on platform)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsFirmModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary">
              Save Prop Firm
            </Button>
          </div>
        </form>
      </Modal>

      {/* Offers & Points Management Modal */}
      <Modal
        isOpen={!!managingFirmOffers}
        onClose={() => setManagingFirmOffers(null)}
        title={`Configure Offers: ${managingFirmOffers?.name}`}
        description="Add account challenge tiers and designate the exact points reward for each."
        maxWidth="lg"
      >
        {managingFirmOffers && (
          <div className="space-y-5 text-xs">
            <form onSubmit={handleAddOffer} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block text-[11px]">
                + Add Challenge Tier Offer
              </span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tier Name (e.g. $100K 2-Step)"
                  value={newOffer.accountTierName}
                  onChange={(e) => setNewOffer({ ...newOffer, accountTierName: e.target.value })}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Price $ (e.g. 549)"
                  value={newOffer.purchasePriceUsd}
                  onChange={(e) => setNewOffer({ ...newOffer, purchasePriceUsd: e.target.value })}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  required
                  placeholder="Points (e.g. 8500)"
                  value={newOffer.rewardPoints}
                  onChange={(e) => setNewOffer({ ...newOffer, rewardPoints: e.target.value })}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" variant="primary">
                  Add Tier
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              <span className="font-bold text-slate-600 dark:text-slate-400 block uppercase tracking-wider text-[11px]">
                Active Challenge Tiers ({managingFirmOffers.offers?.length || 0})
              </span>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 overflow-hidden">
                {managingFirmOffers.offers?.map((offer) => (
                  <div key={offer.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{offer.accountTierName}</span>
                      <span className="text-slate-500 dark:text-slate-400 ml-2">(${offer.purchasePriceUsd})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{offer.rewardPoints.toLocaleString('en-US')} PTS
                      </span>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                        title="Delete tier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
