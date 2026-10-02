'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Coins,
  CheckCircle2,
  AlertCircle,
  Plus,
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

export default function AdminPropFirmsPage() {
  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [loading, setLoading] = useState(true);

  // Prop firm create/edit modal
  const [editingFirm, setEditingFirm] = useState<PropFirm | null>(null);
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  const [firmForm, setFirmForm] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    description: '',
    websiteUrl: '',
    affiliateCode: '',
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

  const fetchFirms = () => {
    setLoading(true);
    api
      .get<PropFirm[]>('/prop-firms', { includeInactive: true })
      .then((data) => setPropFirms(data))
      .catch(console.error)
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
      affiliateCode: '',
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
      setIsFirmModalOpen(false);
      fetchFirms();
    } catch (err: any) {
      alert(err.message || 'Failed to save prop firm');
    }
  };

  const handleDeleteFirm = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate or delete this prop firm?')) return;
    try {
      await api.delete(`/prop-firms/${id}`);
      fetchFirms();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingFirmOffers) return;

    try {
      await api.post(`/prop-firms/${managingFirmOffers.id}/offers`, {
        accountTierName: newOffer.accountTierName,
        purchasePriceUsd: parseFloat(newOffer.purchasePriceUsd),
        rewardPoints: parseInt(newOffer.rewardPoints, 10),
      });

      setNewOffer({ accountTierName: '', purchasePriceUsd: '', rewardPoints: '' });
      fetchFirms();

      // Refresh managing modal object
      const updated = await api.get<PropFirm>(`/prop-firms/${managingFirmOffers.id}?includeInactive=true`);
      setManagingFirmOffers(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to add offer');
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Remove this offer tier?')) return;
    try {
      await api.delete(`/prop-firms/offers/${offerId}`);
      if (managingFirmOffers) {
        const updated = await api.get<PropFirm>(`/prop-firms/${managingFirmOffers.id}?includeInactive=true`);
        setManagingFirmOffers(updated);
      }
      fetchFirms();
    } catch (err: any) {
      alert(err.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Prop Firms & Referral Offers
          </h1>
          <p className="text-xs text-slate-400">
            Configure partner prop firms, affiliate referral links, discount codes, and challenge tier points.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAddFirm}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Add New Prop Firm
        </Button>
      </div>

      {/* Grid of Prop Firms */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading prop firms...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {propFirms.map((firm) => (
            <Card key={firm.id} className="p-6 space-y-5 border-slate-800 bg-slate-900/60 card-hover-glow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {firm.logoUrl ? (
                      <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-white text-lg">{firm.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{firm.name}</h3>
                      <Badge variant={firm.isActive ? 'success' : 'danger'}>
                        {firm.isActive ? 'ACTIVE' : 'DISABLED'}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Slug: {firm.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditFirm(firm)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit firm"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFirm(firm.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete firm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Codes & links */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Referral Code:</span>
                  <span className="font-mono font-bold text-emerald-400">{firm.affiliateCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Affiliate URL:</span>
                  <a
                    href={firm.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-emerald-400 truncate block"
                  >
                    {firm.affiliateUrl}
                  </a>
                </div>
              </div>

              {/* Challenge offers count & manage button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  {firm.offers?.length || 0} Challenge Offer Tiers Configured
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setManagingFirmOffers(firm)}
                  className="text-xs"
                >
                  <Coins className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  Configure Offers & Points
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
              <label className="text-slate-300 font-semibold">Prop Firm Name *</label>
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
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">URL Slug *</label>
              <input
                type="text"
                required
                placeholder="e.g. funding-pips"
                value={firmForm.slug}
                onChange={(e) => setFirmForm({ ...firmForm, slug: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Logo Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={firmForm.logoUrl}
              onChange={(e) => setFirmForm({ ...firmForm, logoUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Short Description *</label>
            <textarea
              rows={2}
              required
              placeholder="Firm overview, profit splits, drawdown models..."
              value={firmForm.description}
              onChange={(e) => setFirmForm({ ...firmForm, description: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Official Website URL *</label>
              <input
                type="url"
                required
                placeholder="https://propfirm.com"
                value={firmForm.websiteUrl}
                onChange={(e) => setFirmForm({ ...firmForm, websiteUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Affiliate Tracking Link *</label>
              <input
                type="url"
                required
                placeholder="https://propfirm.com?ref=proprewards"
                value={firmForm.affiliateUrl}
                onChange={(e) => setFirmForm({ ...firmForm, affiliateUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Referral / Coupon Code *</label>
            <input
              type="text"
              required
              placeholder="NATION"
              value={firmForm.affiliateCode}
              onChange={(e) => setFirmForm({ ...firmForm, affiliateCode: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Eligibility Terms</label>
            <input
              type="text"
              placeholder="e.g. Valid for 2-step evaluation challenges only."
              value={firmForm.eligibilityTerms}
              onChange={(e) => setFirmForm({ ...firmForm, eligibilityTerms: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={firmForm.isActive}
              onChange={(e) => setFirmForm({ ...firmForm, isActive: e.target.checked })}
              className="rounded border-slate-700 bg-slate-800 text-emerald-500"
            />
            <label htmlFor="isActive" className="text-slate-300 font-semibold">
              Prop Firm is Active (visible to traders on platform)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsFirmModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary">
              Save Prop Firm
            </Button>
          </div>
        </form>
      </Modal>

      {/* Offers & Points Management Modal (Section 20) */}
      <Modal
        isOpen={!!managingFirmOffers}
        onClose={() => setManagingFirmOffers(null)}
        title={`Configure Offers: ${managingFirmOffers?.name}`}
        description="Add account challenge tiers and designate the exact points reward for each."
        maxWidth="lg"
      >
        {managingFirmOffers && (
          <div className="space-y-5 text-xs">
            {/* Add new offer row */}
            <form onSubmit={handleAddOffer} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
              <span className="font-bold text-white uppercase tracking-wider block text-[11px]">
                + Add Challenge Tier Offer
              </span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tier Name (e.g. $100K 2-Step)"
                  value={newOffer.accountTierName}
                  onChange={(e) => setNewOffer({ ...newOffer, accountTierName: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Price $ (e.g. 549)"
                  value={newOffer.purchasePriceUsd}
                  onChange={(e) => setNewOffer({ ...newOffer, purchasePriceUsd: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                />
                <input
                  type="number"
                  required
                  placeholder="Points (e.g. 8500)"
                  value={newOffer.rewardPoints}
                  onChange={(e) => setNewOffer({ ...newOffer, rewardPoints: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" variant="primary">
                  Add Tier
                </Button>
              </div>
            </form>

            {/* List of existing tiers */}
            <div className="space-y-2">
              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[11px]">
                Active Challenge Tiers ({managingFirmOffers.offers?.length || 0})
              </span>
              <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                {managingFirmOffers.offers?.map((offer) => (
                  <div key={offer.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{offer.accountTierName}</span>
                      <span className="text-slate-400 ml-2">(${offer.purchasePriceUsd})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400">
                        +{offer.rewardPoints.toLocaleString()} PTS
                      </span>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="text-slate-500 hover:text-rose-400"
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
