'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Trophy,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Flame,
  Send,
} from 'lucide-react';

interface DiscussionPost {
  id: string;
  author: string;
  avatarLetter: string;
  propFirmTag: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'FEED' | 'LEADERBOARD' | 'WINS'>('FEED');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [newPostContent, setNewPostContent] = useState('');

  const [posts, setPosts] = useState<DiscussionPost[]>([
    {
      id: 'p-1',
      author: 'Garv Gautam Kataria',
      avatarLetter: 'G',
      propFirmTag: 'FundedNext Stellar',
      title: 'Just verified my $100K challenge purchase — got +2,500 points in 30 mins!',
      content: 'Massive shoutout to the PropNation verification team. Uploaded the invoice and received points before market open. Now 1,500 points away from redeeming the iPad Mini!',
      likes: 42,
      replies: 9,
      timestamp: '2 hours ago',
    },
    {
      id: 'p-2',
      author: 'Marcus Vance',
      avatarLetter: 'M',
      propFirmTag: 'FTMO Swing',
      title: 'Which firm is best for holding trades over high-impact CPI releases?',
      content: 'Comparing FTMO 2-Step and FundedNext Stellar 1-Step for news trading. Does anyone know if the referral code applies to the Swap-Free accounts as well?',
      likes: 19,
      replies: 14,
      timestamp: '5 hours ago',
    },
    {
      id: 'p-3',
      author: 'Elena Rostova',
      avatarLetter: 'E',
      propFirmTag: 'Topstep 150K',
      title: 'Redemption review: Samsung 4K Curved Monitor arrived via DHL Express!',
      content: 'Received the delivery tracking number within 48 hours of redemption. Box was sealed and genuine. Absolutely love this rewards platform.',
      likes: 67,
      replies: 23,
      timestamp: '1 day ago',
    },
  ]);

  const handleLike = (id: string) => {
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    const newP: DiscussionPost = {
      id: `p-${Date.now()}`,
      author: 'Garv Gautam Kataria',
      avatarLetter: 'G',
      propFirmTag: 'Verified Trader',
      title: 'Trader Update',
      content: newPostContent,
      likes: 1,
      replies: 0,
      timestamp: 'Just now',
    };
    setPosts([newP, ...posts]);
    setNewPostContent('');
  };

  const leaderboard = [
    { rank: 1, name: 'Alexandros Thorne', points: '142,500 PTS', challenges: 14, badge: 'Diamond Trader' },
    { rank: 2, name: 'Garv Gautam Kataria', points: '89,000 PTS', challenges: 8, badge: 'Platinum Trader' },
    { rank: 3, name: 'David Miller', points: '64,200 PTS', challenges: 6, badge: 'Gold Trader' },
    { rank: 4, name: 'Sophie Lin', points: '48,000 PTS', challenges: 5, badge: 'Silver Trader' },
    { rank: 5, name: 'Liam O’Connor', points: '35,500 PTS', challenges: 4, badge: 'Silver Trader' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-[#14234b]/60">
        <div>
          <Badge variant="purple">Traders Community Hub</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 flex items-center gap-3">
            <Users className="h-9 w-9 text-blue-500" />
            PropNation Community
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Connect with thousands of verified prop firm traders, share challenge reviews, celebrate reward deliveries, and climb the points leaderboard.
          </p>
        </div>

        {/* Discord & Telegram Buttons */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#5865F2]/10 dark:bg-[#5865F2]/20 border border-[#5865F2]/30 dark:border-[#5865F2]/40 text-[#5865F2] dark:text-[#99aab5] hover:text-[#4752c4] dark:hover:text-white transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#5865F2]" />
            Join Discord
          </a>
          <a
            href="https://telegram.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#229ED9]/10 dark:bg-[#229ED9]/20 border border-[#229ED9]/30 dark:border-[#229ED9]/40 text-[#0088cc] dark:text-[#a3d9ff] hover:text-[#006699] dark:hover:text-white transition-colors"
          >
            <Send className="h-3.5 w-3.5 text-[#229ED9]" />
            Join Telegram
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#14234b]/60 pb-3">
        {[
          { key: 'FEED', label: 'Discussion Feed', icon: MessageSquare },
          { key: 'LEADERBOARD', label: 'Leaderboard', icon: Trophy },
          { key: 'WINS', label: 'Wall of Wins', icon: Flame },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0a142e]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Discussion Feed */}
      {activeTab === 'FEED' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Input */}
            <Card className="p-4 sm:p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 shadow-sm">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your prop firm evaluation experience or reward unboxing..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#060b18] p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">Post as Verified Trader</span>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                    Publish Post
                  </Button>
                </div>
              </form>
            </Card>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-3 hover:border-blue-500/30 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
                        {post.avatarLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{post.author}</span>
                          <span className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">
                            {post.propFirmTag}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{post.timestamp}</div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{post.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-[#14234b]/40 text-xs text-slate-500 dark:text-slate-400">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{post.likes + (likes[post.id] || 0)} Likes</span>
                    </button>
                    <div className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{post.replies} Replies</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar Widget Column */}
          <div className="space-y-6">
            {/* Top Traders Spotlight */}
            <Card className="p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                Monthly Top Redeemers
              </h4>
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((trader) => (
                  <div
                    key={trader.rank}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#091126] border border-slate-200/80 dark:border-[#14234b]/50 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-amber-500 dark:text-amber-400">#{trader.rank}</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{trader.name}</span>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{trader.points}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Rules */}
            <Card className="p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-2 text-xs shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                Community Guidelines
              </h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                PropNation is a respectful trader network. Share truthful reviews, respect prop firm disclosure rules, and help fellow traders pass evaluations safely.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Leaderboard */}
      {activeTab === 'LEADERBOARD' && (
        <Card className="p-6 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#14234b]/60">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All-Time Points Leaderboard</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Updated every 24 hours</span>
          </div>

          <div className="space-y-2">
            {leaderboard.map((trader) => (
              <div
                key={trader.rank}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#091126] border border-slate-200/80 dark:border-[#14234b]/50 hover:border-blue-500/30 transition-all text-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono text-sm font-black text-amber-500 dark:text-amber-400 w-6 text-center">
                    #{trader.rank}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{trader.name}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">{trader.badge} • {trader.challenges} verified purchases</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-blue-600 dark:text-blue-400 text-sm">{trader.points}</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Verified Trader ✓</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Wall of Wins */}
      {activeTab === 'WINS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { trader: 'Garv K.', prize: 'iPad Mini (Space Gray)', points: '60,000 PTS', date: 'Yesterday' },
            { trader: 'Liam O.', prize: 'Sony WH-1000XM5 Headphones', points: '20,000 PTS', date: '2 days ago' },
            { trader: 'Alex Thorne', prize: 'iPhone 16 Pro (Natural Ti)', points: '100,000 PTS', date: '3 days ago' },
            { trader: 'Sophie Lin', prize: 'Logitech MX Master 3S', points: '8,000 PTS', date: '5 days ago' },
            { trader: 'Elena R.', prize: '₹5,000 Amazon Voucher', points: '5,000 PTS', date: '6 days ago' },
            { trader: 'David M.', prize: 'Dell UltraSharp 32" 4K', points: '75,000 PTS', date: '1 week ago' },
          ].map((win, idx) => (
            <Card key={idx} className="p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <Badge variant="purple">Verified Claim</Badge>
                <span className="text-[11px] text-slate-500">{win.date}</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{win.prize}</h4>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{win.points} spent</div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-[#14234b]/40 flex items-center justify-between">
                <span>Winner: <strong className="text-slate-900 dark:text-white">{win.trader}</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Dispatched ✓</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
