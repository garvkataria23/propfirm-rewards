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

const DEFAULT_ADMIN_CATEGORIES: Category[] = [
  { id: 'cat-apple', name: 'Apple Ecosystem', slug: 'apple' },
  { id: 'cat-gaming', name: 'Gaming & Setups', slug: 'gaming' },
  { id: 'cat-crypto', name: 'USDT & Cash Vouchers', slug: 'vouchers' },
  { id: 'cat-audio', name: 'Pro Audio & Wearables', slug: 'audio' },
];

const DEFAULT_ADMIN_REWARDS: Reward[] = [
  {
    id: 'rew-1',
    categoryId: 'cat-apple',
    name: 'Apple AirPods Pro (2nd Gen - MagSafe USB-C)',
    slug: 'apple-airpods-pro-2',
    description: 'Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio with MagSafe Charging Case.',
    specifications: 'USB-C MagSafe Case • H2 Chip • 30h Listening Time',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
    pointsRequired: 24900,
    stock: 15,
    isUnlimitedStock: false,
    isActive: true,
    category: { id: 'cat-apple', name: 'Apple Ecosystem', slug: 'apple' },
  },
  {
    id: 'rew-2',
    categoryId: 'cat-apple',
    name: 'Apple iPad Air 11" M2 Chip (128GB Wi-Fi)',
    slug: 'apple-ipad-air-m2',
    description: 'Supercharged by the Apple M2 chip with Liquid Retina display for mobile charting and multi-asset execution.',
    specifications: '11-inch Liquid Retina • M2 Chip • 128GB Storage',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    pointsRequired: 59900,
    stock: 8,
    isUnlimitedStock: false,
    isActive: true,
    category: { id: 'cat-apple', name: 'Apple Ecosystem', slug: 'apple' },
  },
  {
    id: 'rew-3',
    categoryId: 'cat-audio',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    slug: 'sony-wh-1000xm5',
    description: 'Industry-leading 8-microphone noise cancellation and ultra-comfortable lightweight design for long trading sessions.',
    specifications: '30-Hour Battery • Multipoint Bluetooth • Matte Black',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    pointsRequired: 39900,
    stock: 12,
    isUnlimitedStock: false,
    isActive: true,
    category: { id: 'cat-audio', name: 'Pro Audio & Wearables', slug: 'audio' },
  },
  {
    id: 'rew-4',
    categoryId: 'cat-apple',
    name: 'Apple MacBook Air 13" M3 Chip (16GB RAM / 512GB SSD)',
    slug: 'macbook-air-m3',
    description: 'Ultimate portable trading workstation with dual external display support and 18-hour battery life.',
    specifications: 'Apple M3 8-Core • 16GB Unified Memory • 512GB SSD',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    pointsRequired: 129900,
    stock: 5,
    isUnlimitedStock: false,
    isActive: true,
    category: { id: 'cat-apple', name: 'Apple Ecosystem', slug: 'apple' },
  },
  {
    id: 'rew-5',
    categoryId: 'cat-gaming',
    name: 'Sony PlayStation 5 Slim Console (Disc Edition)',
    slug: 'ps5-slim-disc',
    description: '4K 120Hz gaming console with 1TB ultra-high-speed SSD and DualSense wireless controller.',
    specifications: '1TB Custom SSD • DualSense Controller • 4K HDR',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
    pointsRequired: 49900,
    stock: 9,
    isUnlimitedStock: false,
    isActive: true,
    category: { id: 'cat-gaming', name: 'Gaming & Setups', slug: 'gaming' },
  },
  {
    id: 'rew-6',
    categoryId: 'cat-crypto',
    name: '$100 USDT Instant Crypto / Prop Firm Voucher',
    slug: '100-usdt-voucher',
    description: 'Instant digital payout via USDT (TRC-20 / ERC-20) or direct Prop Firm challenge credit.',
    specifications: 'Instant Electronic Delivery • Zero Network Fee',
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80',
    pointsRequired: 10000,
    stock: 999,
    isUnlimitedStock: true,
    isActive: true,
    category: { id: 'cat-crypto', name: 'USDT & Cash Vouchers', slug: 'vouchers' },
  },
];

const REWARDS_STORAGE_KEY = 'propfirm_admin_rewards_v2';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>(DEFAULT_ADMIN_REWARDS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_ADMIN_CATEGORIES);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState({
    categoryId: DEFAULT_ADMIN_CATEGORIES[0].id,
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

  const persistRewards = (updated: Reward[]) => {
    setRewards(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const fetchCatalog = () => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(REWARDS_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRewards(parsed);
          }
        }
      } catch {}
    }

    Promise.all([
      api.get<Reward[]>('/rewards/admin/all'),
      api.get<Category[]>('/rewards/categories'),
    ])
      .then(([rewardsData, categoriesData]) => {
        if (Array.isArray(rewardsData) && rewardsData.length > 0) {
          persistRewards(rewardsData);
        }
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenAdd = () => {
    setEditingReward(null);
    setRewardForm({
      categoryId: categories[0]?.id || DEFAULT_ADMIN_CATEGORIES[0].id,
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
    const payload = {
      ...rewardForm,
      pointsRequired: parseInt(rewardForm.pointsRequired, 10) || 10000,
      stock: parseInt(rewardForm.stock, 10) || 0,
    };

    try {
      if (editingReward) {
        await api.put(`/rewards/admin/${editingReward.id}`, payload);
      } else {
        await api.post('/rewards/admin', payload);
      }
    } catch {}

    const matchedCategory =
      categories.find((c) => c.id === payload.categoryId) || DEFAULT_ADMIN_CATEGORIES[0];

    if (editingReward) {
      persistRewards(
        rewards.map((r) =>
          r.id === editingReward.id ? { ...r, ...payload, category: matchedCategory } : r
        )
      );
    } else {
      const created: Reward = {
        id: `rew-${Date.now()}`,
        ...payload,
        category: matchedCategory,
      };
      persistRewards([created, ...rewards]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate or delete this reward?')) return;
    try {
      await api.delete(`/rewards/admin/${id}`);
    } catch {}
    persistRewards(rewards.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Rewards Inventory Catalog</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Control items available in the Rewards Store, set required points, and track stock.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={handleOpenAdd}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Add New Reward
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <Card
              key={reward.id}
              className="p-5 flex flex-col justify-between card-hover-glow space-y-4"
            >
              <div className="space-y-3">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 relative border border-slate-200 dark:border-slate-800">
                  <img src={reward.imageUrl} alt={reward.name} className="h-full w-full object-cover" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="default" className="bg-white/90 text-slate-900 dark:bg-slate-950/90 dark:text-white shadow-xs">
                      {reward.category?.name}
                    </Badge>
                    {!reward.isActive && (
                      <Badge variant="danger">DISABLED</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{reward.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {reward.pointsRequired.toLocaleString()} PTS
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span>Inventory:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {reward.isUnlimitedStock ? 'Unlimited Digital' : `${reward.stock} units available`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(reward)}>
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
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Reward Name *</label>
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
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Category *</label>
              <select
                value={rewardForm.categoryId}
                onChange={(e) => setRewardForm({ ...rewardForm, categoryId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
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
              <label className="text-slate-700 dark:text-slate-300 font-semibold">URL Slug *</label>
              <input
                type="text"
                required
                value={rewardForm.slug}
                onChange={(e) => setRewardForm({ ...rewardForm, slug: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Points Required *</label>
              <input
                type="number"
                required
                min={1}
                value={rewardForm.pointsRequired}
                onChange={(e) => setRewardForm({ ...rewardForm, pointsRequired: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold">Image URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={rewardForm.imageUrl}
              onChange={(e) => setRewardForm({ ...rewardForm, imageUrl: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold">Description *</label>
            <textarea
              rows={2}
              required
              value={rewardForm.description}
              onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold">Technical Specifications</label>
            <input
              type="text"
              placeholder="e.g. 256GB Storage | Space Black | 120Hz ProMotion"
              value={rewardForm.specifications}
              onChange={(e) => setRewardForm({ ...rewardForm, specifications: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Stock Count</label>
              <input
                type="number"
                disabled={rewardForm.isUnlimitedStock}
                value={rewardForm.stock}
                onChange={(e) => setRewardForm({ ...rewardForm, stock: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={rewardForm.isUnlimitedStock}
                  onChange={(e) => setRewardForm({ ...rewardForm, isUnlimitedStock: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-600"
                />
                <span>Unlimited Stock (Digital)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={rewardForm.isActive}
                  onChange={(e) => setRewardForm({ ...rewardForm, isActive: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-600"
                />
                <span>Active &amp; Visible in Store</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
