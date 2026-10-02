'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LifeBuoy,
  Search,
  BookOpen,
  ShieldCheck,
  Coins,
  Truck,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
}

const ARTICLES: Article[] = [
  {
    id: 'art-1',
    category: 'GETTING STARTED',
    title: 'How to correctly apply affiliate codes during prop firm checkout',
    excerpt: 'Step-by-step instructions on making sure the referral discount binds to your account on checkout so your purchase is eligible for points.',
    readTime: '3 min read',
  },
  {
    id: 'art-2',
    category: 'VERIFICATION',
    title: 'Acceptable proof of purchase: official invoice vs dashboard screenshots',
    excerpt: 'Detailed checklist of mandatory information: Order ID, buyer email, date of transaction, and total USD price.',
    readTime: '4 min read',
  },
  {
    id: 'art-3',
    category: 'POINTS SYSTEM',
    title: 'How points are calculated and when they reflect in your balance',
    excerpt: 'Explanation of tier offers ($50K = 1,000 PTS, $100K = 2,500 PTS) and automated ledger safety checks.',
    readTime: '3 min read',
  },
  {
    id: 'art-4',
    category: 'SHIPPING & LOGISTICS',
    title: 'Worldwide reward shipping, customs clearance, and courier tracking',
    excerpt: 'Everything you need to know about DHL Express and FedEx dispatch, tracking notifications, and delivery timelines.',
    readTime: '5 min read',
  },
  {
    id: 'art-5',
    category: 'SECURITY',
    title: 'Anti-fraud safeguards and duplicate submission prevention',
    excerpt: 'Why Order IDs can only be claimed once and how our system protects trader reward allocations.',
    readTime: '2 min read',
  },
];

export default function HelpCenterPage() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && pathname === '/help-center') {
      router.replace('/dashboard/help-center');
    }
  }, [user, isLoading, pathname, router]);

  const [search, setSearch] = useState('');

  const filteredArticles = ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header Banner */}
      <div className="text-center space-y-4 py-6">
        <Badge variant="purple">Documentation & Knowledge Base</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          How can we help you?
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Explore comprehensive guides on prop firm affiliate verification, points rewards, and fast courier fulfillment.
        </p>

        {/* Big Search Bar */}
        <div className="max-w-xl mx-auto relative pt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles, verification rules, or shipping..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070e20] pl-12 pr-4 py-3.5 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none shadow-sm dark:shadow-xl"
          />
        </div>
      </div>

      {/* 4 Topic Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Getting Started', desc: 'Account setup & codes', icon: BookOpen, color: 'text-blue-500 dark:text-blue-400' },
          { title: 'Verification', desc: 'Proof audits & rules', icon: ShieldCheck, color: 'text-emerald-500 dark:text-emerald-400' },
          { title: 'Points & Rewards', desc: 'Ledger & redemptions', icon: Coins, color: 'text-amber-500 dark:text-amber-400' },
          { title: 'Delivery', desc: 'Courier dispatch & tracking', icon: Truck, color: 'text-purple-500 dark:text-purple-400' },
        ].map((cat, i) => {
          const Icon = cat.icon;
          return (
            <Card
              key={i}
              className="p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm"
            >
              <Icon className={`h-7 w-7 ${cat.color} group-hover:scale-110 transition-transform`} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">{cat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cat.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* Featured Articles List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Popular Help Guides</h2>

        <div className="space-y-3">
          {filteredArticles.map((art) => (
            <Card
              key={art.id}
              className="p-5 bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 hover:border-blue-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{art.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">{art.excerpt}</p>
              </div>

              <div className="shrink-0 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                Read Guide
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Still need help CTA */}
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-[#09122c] border border-slate-200 dark:border-[#14234b] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm dark:shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Need personal assistance with an order?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Our support desk is online 24/7. Reach out via Live Chat or view our Frequently Asked Questions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/faq">
            <Button variant="outline" size="sm">
              <HelpCircle className="h-4 w-4 mr-1.5" />
              Read FAQ
            </Button>
          </Link>
          <Link href="/support/live">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
              <LifeBuoy className="h-4 w-4 mr-1.5" />
              Live Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
