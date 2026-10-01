'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

interface Review {
  id: string;
  firmName: string;
  author: string;
  rating: number;
  date: string;
  verifiedBuyer: boolean;
  title: string;
  content: string;
  payoutProof: boolean;
  likes: number;
}

export default function ReviewsPage() {
  const [selectedFirm, setSelectedFirm] = useState<string>('ALL');
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newFirm, setNewFirm] = useState('FundedNext');

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      firmName: 'FundedNext',
      author: 'Garv Gautam Kataria',
      rating: 5,
      date: 'March 2026',
      verifiedBuyer: true,
      title: 'Stellar 1-Step: Lowest raw spreads and instantaneous points credit',
      content:
        'Purchased the $100K Stellar challenge using the PropNation discount code. The 15% discount applied immediately at checkout, and once I submitted my invoice, my 2,500 points were verified within 40 minutes. Spreads on EURUSD were 0.1-0.3 during London session.',
      payoutProof: true,
      likes: 31,
    },
    {
      id: 'rev-2',
      firmName: 'FTMO',
      author: 'David Vance',
      rating: 5,
      date: 'March 2026',
      verifiedBuyer: true,
      title: 'The gold standard in prop trading with flawless payout consistency',
      content:
        'Have passed 3 evaluations on FTMO. Their client portal and metrics tracking are top notch. Points reward credited through this platform helped me pick up the Sony wireless headphones for my trading desk.',
      payoutProof: true,
      likes: 24,
    },
    {
      id: 'rev-3',
      firmName: 'The5ers',
      author: 'Marcus Cole',
      rating: 4,
      date: 'February 2026',
      verifiedBuyer: true,
      title: 'High Stakes program is exceptional for aggressive swing traders',
      content:
        'Great scaling plan up to $4M. The overnight swap rates are very reasonable. Payout arrived via crypto within 24 hours of bi-weekly request.',
      payoutProof: true,
      likes: 18,
    },
    {
      id: 'rev-4',
      firmName: 'Topstep',
      author: 'Elena R.',
      rating: 5,
      date: 'January 2026',
      verifiedBuyer: true,
      title: 'Best Futures evaluation with TradingView integration',
      content:
        'Trading ES and NQ on Tradovate/TradingView was super smooth. Zero commissions on evaluation with code. Highly recommended for orderflow traders.',
      payoutProof: true,
      likes: 29,
    },
  ]);

  const filteredReviews = reviews.filter((r) =>
    selectedFirm === 'ALL' ? true : r.firmName === selectedFirm
  );

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !newTitle.trim()) return;
    const added: Review = {
      id: `rev-${Date.now()}`,
      firmName: newFirm,
      author: 'Garv Gautam Kataria',
      rating: newRating,
      date: 'Just now',
      verifiedBuyer: true,
      title: newTitle,
      content: newContent,
      payoutProof: true,
      likes: 1,
    };
    setReviews([added, ...reviews]);
    setWriteModalOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#14234b]/60">
        <div>
          <Badge variant="purple">Verified Trader Feedback</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2 flex items-center gap-3">
            <Star className="h-9 w-9 text-amber-400 fill-amber-400" />
            Prop Firm Reviews
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real evaluations and payout experiences verified by authentic traders across leading CFD and Futures prop firms.
          </p>
        </div>

        <Button
          onClick={() => setWriteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Write a Review
        </Button>
      </div>

      {/* Firm Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['ALL', 'FundedNext', 'FTMO', 'The5ers', 'Topstep'].map((firm) => (
          <button
            key={firm}
            onClick={() => setSelectedFirm(firm)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedFirm === firm
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white bg-[#070e20] border border-[#14234b]/50'
            }`}
          >
            {firm === 'ALL' ? 'All Prop Firms' : firm}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <Card
            key={rev.id}
            className="p-6 bg-[#070e20] border-[#14234b]/60 space-y-4 hover:border-blue-500/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white text-base">{rev.firmName}</span>
                <span className="text-slate-600">/</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {rev.verifiedBuyer && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Purchase
                  </span>
                )}
                <span className="text-xs text-slate-500">{rev.date}</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{rev.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1.5">{rev.content}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#14234b]/40 text-xs text-slate-400">
              <span className="text-slate-400">
                Trader: <strong className="text-white">{rev.author}</strong>
              </span>

              <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Helpful ({rev.likes})</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Write a Review Modal */}
      {writeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#070e20] border border-[#14234b] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Write a Prop Firm Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Prop Firm</label>
                <select
                  value={newFirm}
                  onChange={(e) => setNewFirm(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  <option value="FundedNext">FundedNext</option>
                  <option value="FTMO">FTMO</option>
                  <option value="The5ers">The5ers</option>
                  <option value="Topstep">Topstep</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Review Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smooth evaluation pass & fast points"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Detailed Feedback</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details on spreads, challenge rules, customer service, or verification..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setWriteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                  Submit Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
