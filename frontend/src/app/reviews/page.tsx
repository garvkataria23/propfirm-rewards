'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Plus,
  Filter,
  Sparkles,
  Gift,
  Award,
  Coins,
  Heart,
  TrendingUp,
  Check,
} from 'lucide-react';

interface Review {
  id: string;
  category: 'PROP_FIRM' | 'REWARD_STORE';
  firmName: string;
  author: string;
  authorCountry: string;
  rating: number;
  date: string;
  verifiedBuyer: boolean;
  tierOrItem: string;
  pointsEarnedOrSpent: string;
  title: string;
  content: string;
  payoutProof: boolean;
  likes: number;
  hasLiked?: boolean;
  adminResponse?: string;
}

export default function ReviewsPage() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && pathname === '/reviews') {
      router.replace('/dashboard/reviews');
    }
  }, [user, isLoading, pathname, router]);

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  // Form states
  const [newFirm, setNewFirm] = useState('Funding Pips');
  const [newCategory, setNewCategory] = useState<'PROP_FIRM' | 'REWARD_STORE'>('PROP_FIRM');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTier, setNewTier] = useState('$100K 2-Step');
  const [newRating, setNewRating] = useState(5);

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      category: 'PROP_FIRM',
      firmName: 'Funding Pips',
      author: 'Garv Gautam Kataria',
      authorCountry: '🇮🇳 India',
      rating: 5,
      date: 'Today, Oct 02',
      verifiedBuyer: true,
      tierOrItem: '$100K 2-Step Evaluation',
      pointsEarnedOrSpent: '+4,500 PTS Credited',
      title: 'Fastest verification turnaround & zero spread slippage on MT5',
      content:
        'Purchased the Funding Pips $100K 2-step evaluation using code PIPSREWARDS. The 10% discount worked instantly, and the AI OCR scanner picked up my invoice screenshot with 99.4% accuracy. Points were verified and credited in under 35 minutes! Spreads on EURUSD were 0.1 during London session.',
      payoutProof: true,
      likes: 42,
      adminResponse: 'Thank you Garv! Your prompt submission and clear invoice screenshot helped our team verify your challenge instantly. Enjoy your reward points!',
    },
    {
      id: 'rev-2',
      category: 'REWARD_STORE',
      firmName: 'Apple Store Rewards',
      author: 'David Vance',
      authorCountry: '🇬🇧 United Kingdom',
      rating: 5,
      date: 'Yesterday, Oct 01',
      verifiedBuyer: true,
      tierOrItem: 'Apple AirPods Pro 2 (USB-C)',
      pointsEarnedOrSpent: '-22,000 PTS Liquidated',
      title: 'DHL Express tracked parcel delivered right to my trading desk',
      content:
        'Redeemed my accumulated cashback points for the AirPods Pro 2. The live courier radar showed every checkpoint from Singapore hub to London Heathrow. Received automated WhatsApp delivery pings at every step. Truly production-grade service!',
      payoutProof: true,
      likes: 38,
      adminResponse: 'Congratulations on passing your FTMO evaluation and claiming your gear, David! Keep trading with discipline.',
    },
    {
      id: 'rev-3',
      category: 'PROP_FIRM',
      firmName: 'FTMO',
      author: 'Lucas Rodriguez',
      authorCountry: '🇺🇸 United States',
      rating: 5,
      date: 'Sep 29, 2026',
      verifiedBuyer: true,
      tierOrItem: '$200K Challenge Account',
      pointsEarnedOrSpent: '+11,200 PTS Credited',
      title: 'Huge points yield on $200K challenge, already pass Phase 1',
      content:
        'FTMO remains the gold standard in prop trading. Getting 11,200 reward points (worth $112 USD) just for buying through our community link is insane value. Already ordered an Apple Pencil Pro and still have points left over.',
      payoutProof: true,
      likes: 29,
    },
    {
      id: 'rev-4',
      category: 'PROP_FIRM',
      firmName: 'FundedNext',
      author: 'Marcus Cole',
      authorCountry: '🇦🇺 Australia',
      rating: 5,
      date: 'Sep 25, 2026',
      verifiedBuyer: true,
      tierOrItem: 'Stellar 1-Step $100K',
      pointsEarnedOrSpent: '+4,800 PTS Credited',
      title: '15% profit sharing on challenge phase plus instant reward points',
      content:
        'FundedNext Stellar program gives 15% reward during phase 1, and combining that with PropNation points makes this a no-brainer. Payout was executed to my TRC20 wallet with zero issues.',
      payoutProof: true,
      likes: 21,
    },
    {
      id: 'rev-5',
      category: 'REWARD_STORE',
      firmName: 'Tech & Gadgets',
      author: 'Elena Rostova',
      authorCountry: '🇩🇪 Germany',
      rating: 5,
      date: 'Sep 20, 2026',
      verifiedBuyer: true,
      tierOrItem: 'Apple iPad Air 11" M2 (128GB)',
      pointsEarnedOrSpent: '-59,000 PTS Liquidated',
      title: 'iPad arrived in factory sealed packaging within 3 business days',
      content:
        'I accumulated points over 4 challenge purchases and redeemed the iPad Air for my charts and TradingView setups. Arrived via FedEx Priority with signature confirmation. Best rewards program in the prop industry.',
      payoutProof: true,
      likes: 35,
    },
  ]);

  const handleLike = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const hasLiked = r.hasLiked;
          return {
            ...r,
            likes: hasLiked ? r.likes - 1 : r.likes + 1,
            hasLiked: !hasLiked,
          };
        }
        return r;
      })
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !newTitle.trim()) return;

    const added: Review = {
      id: `rev-${Date.now()}`,
      category: newCategory,
      firmName: newFirm,
      author: 'Garv Gautam Kataria',
      authorCountry: '🇮🇳 India',
      rating: newRating,
      date: 'Just now',
      verifiedBuyer: true,
      tierOrItem: newTier,
      pointsEarnedOrSpent: newCategory === 'PROP_FIRM' ? '+4,500 PTS Credited' : 'Verified Claim',
      title: newTitle,
      content: newContent,
      payoutProof: true,
      likes: 1,
      hasLiked: true,
    };

    setReviews([added, ...reviews]);
    setWriteModalOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'REWARDS') return r.category === 'REWARD_STORE';
    return r.firmName.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Badge variant="purple">Verified Trader Community</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 flex items-center gap-3">
            <Star className="h-9 w-9 text-amber-400 fill-amber-400" />
            Trader Reviews &amp; Reward Testimonials
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Real evaluations, payout receipts, and tech delivery experiences submitted by verified prop firm traders.
          </p>
        </div>

        <Button
          onClick={() => setWriteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Submit Trader Review
        </Button>
      </div>

      {/* Ratings Overview Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="flex items-center gap-4">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            4.9<span className="text-xl text-slate-400 font-semibold">/5</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-5 w-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">Based on 486 verified reviews</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Trader Satisfaction Rate</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">98.4%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[98.4%]" />
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="text-right">
            <span className="block font-bold text-slate-900 dark:text-white">Avg Verification Time</span>
            <span>&lt; 38 Minutes SLA</span>
          </div>
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { key: 'ALL', label: 'All Reviews' },
          { key: 'Funding Pips', label: 'Funding Pips' },
          { key: 'FTMO', label: 'FTMO' },
          { key: 'FundedNext', label: 'FundedNext' },
          { key: 'REWARDS', label: '🎁 Reward Tech Deliveries' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setSelectedFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedFilter === f.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-5">
        {filteredReviews.map((rev) => (
          <Card
            key={rev.id}
            className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-4 hover:border-blue-500/30 transition-all shadow-xs"
          >
            {/* Header: Firm / Item, Rating, Verified Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  {rev.firmName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold font-mono">
                  {rev.tierOrItem}
                </span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {rev.pointsEarnedOrSpent}
                </span>
                {rev.verifiedBuyer && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Trader
                  </span>
                )}
                <span className="text-xs text-slate-400">{rev.date}</span>
              </div>
            </div>

            {/* Title & Body */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {rev.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                {rev.content}
              </p>
            </div>

            {/* Official Admin Verified Reply (if present) */}
            {rev.adminResponse && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Official PropNation Response</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {rev.adminResponse}
                </p>
              </div>
            )}

            {/* Footer: Author Info & Helpful Counter */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span>Trader: <strong className="text-slate-900 dark:text-white">{rev.author}</strong></span>
                <span className="text-slate-400">({rev.authorCountry})</span>
              </span>

              <button
                onClick={() => handleLike(rev.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  rev.hasLiked
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${rev.hasLiked ? 'fill-blue-600 text-blue-600' : ''}`} />
                <span>Helpful ({rev.likes})</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Write a Review Modal */}
      {writeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Submit Verified Trader Review
              </h3>
              <button
                onClick={() => setWriteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="PROP_FIRM">Prop Firm Evaluation</option>
                    <option value="REWARD_STORE">Rewards Store Claim</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Item / Firm Name</label>
                  <input
                    type="text"
                    required
                    value={newFirm}
                    onChange={(e) => setNewFirm(e.target.value)}
                    placeholder="e.g. Funding Pips or AirPods Pro"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account Size / Tier</label>
                <input
                  type="text"
                  required
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  placeholder="e.g. $100K 2-Step Challenge"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">{newRating} Stars</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of your trading experience or delivery"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Detailed Feedback</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write honest feedback about slippage, spread, points crediting speed, or package delivery quality..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWriteModalOpen(false)}
                  className="w-1/3 border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Publish Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
