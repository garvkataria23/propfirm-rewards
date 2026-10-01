'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Gift,
  PlusCircle,
  Edit2,
  Trash2,
  Coins,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Reward {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  specifications?: string;
  imageUrl: string;
  pointsRequired: number;
  stock: number;
  isUnlimitedStock: boolean;
  isActive: boolean;
  category: Category;
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState({
    categoryId: '',
    name: '',
    slug: '',
    description: '',
    specifications: '',
    imageUrl: '',
    pointsRequired: '',
    stock: '',
    isUnlimitedStock: false,
    isActive: true,
  });

  const fetchCatalog = () => {
    setLoading(true);
    Promise.all([
      api.get<Reward[]>('/rewards/admin/all'),
      api.get<Category[]>('/rewards/categories'),
    ])
      .then(([rewardsData, categoriesData]) => {
        setRewards(rewardsData);
        setCategories(categoriesData);
        if (categoriesData.length > 0 && !rewardForm.categoryId) {
          setRewardForm((prev) => ({ ...prev, categoryId: categoriesData[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenAdd = () => {
    setEditingReward(null);
    setRewardForm({
      categoryId: categories[0]?.id || '',
      name: '',
      slug: '',
      description: '',
      specifications: '',
      imageUrl: '',
      pointsRequired: '10000',
      stock: '10',
      isUnlimitedStock: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Reward) => {
    setEditingReward(r);
    setRewardForm({
      categoryId: r.categoryId,
      name: r.name,
      slug: r.slug,
      description: r.description,
      specifications: r.specifications || '',
      imageUrl: r.imageUrl,
      pointsRequired: String(r.pointsRequired),
      stock: String(r.stock),
      isUnlimitedStock: r.isUnlimitedStock,
      isActive: r.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...rewardForm,
        pointsRequired: parseInt(rewardForm.pointsRequired, 10),
        stock: parseInt(rewardForm.stock, 10) || 0,
      };

      if (editingReward) {
        await api.put(`/rewards/admin/${editingReward.id}`, payload);
      } else {
        await api.post('/rewards/admin', payload);
      }

      setIsModalOpen(false);
      fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'Failed to save reward');
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate or delete this reward?')) return;
    try {
      await api.delete(`/rewards/admin/${id}`);
      fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'Failed to delete reward');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Rewards Inventory Catalog</h1>
          <p className="text-xs text-slate-400">
            Control items available in the Rewards Store, set required points, and track stock.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Add New Reward
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <Card
              key={reward.id}
              className="p-5 flex flex-col justify-between border-slate-800 bg-slate-900/60 card-hover-glow space-y-4"
            >
              <div className="space-y-3">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 relative border border-slate-800">
                  <img src={reward.imageUrl} alt={reward.name} className="h-full w-full object-cover" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="default" className="bg-slate-950/80">
                      {reward.category?.name}
                    </Badge>
                    {!reward.isActive && (
                      <Badge variant="danger">DISABLED</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base truncate">{reward.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-emerald-400 text-sm">
                      {reward.pointsRequired.toLocaleString()} PTS
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span>Inventory:</span>
                  <span className="font-semibold text-white">
                    {reward.isUnlimitedStock ? 'Unlimited Digital' : `${reward.stock} units available`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(reward)}>
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDeleteReward(reward.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reward Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReward ? `Edit ${editingReward.name}` : 'Add New Reward to Catalog'}
        description="Set points pricing, inventory stock, and high-resolution product imagery."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveReward} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Reward Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apple iPad Pro 11 M4"
                value={rewardForm.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setRewardForm({
                    ...rewardForm,
                    name: val,
                    slug: !editingReward ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-') : rewardForm.slug,
                  });
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Category *</label>
              <select
                value={rewardForm.categoryId}
                onChange={(e) => setRewardForm({ ...rewardForm, categoryId: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">URL Slug *</label>
              <input
                type="text"
                required
                value={rewardForm.slug}
                onChange={(e) => setRewardForm({ ...rewardForm, slug: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Points Required *</label>
              <input
                type="number"
                required
                min={1}
                value={rewardForm.pointsRequired}
                onChange={(e) => setRewardForm({ ...rewardForm, pointsRequired: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-bold text-emerald-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Image URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={rewardForm.imageUrl}
              onChange={(e) => setRewardForm({ ...rewardForm, imageUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Description *</label>
            <textarea
              rows={2}
              required
              value={rewardForm.description}
              onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Technical Specifications</label>
            <input
              type="text"
              placeholder="e.g. 256GB Storage | Space Black | 120Hz ProMotion"
              value={rewardForm.specifications}
              onChange={(e) => setRewardForm({ ...rewardForm, specifications: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Stock Count</label>
              <input
                type="number"
                disabled={rewardForm.isUnlimitedStock}
                value={rewardForm.stock}
                onChange={(e) => setRewardForm({ ...rewardForm, stock: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rewardForm.isUnlimitedStock}
                  onChange={(e) => setRewardForm({ ...rewardForm, isUnlimitedStock: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Unlimited Stock (Digital)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rewardForm.isActive}
                  onChange={(e) => setRewardForm({ ...rewardForm, isActive: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Active & Visible in Store</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary">
              Save Reward
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
