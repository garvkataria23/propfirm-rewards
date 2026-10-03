'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Phone,
  CheckCircle2,
  CheckCheck,
  Send,
  Bell,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Clock,
  Coins,
  Package,
  AlertTriangle,
  Smartphone,
  Save,
  Check,
  Copy,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Activity,
  FileText,
  RefreshCw,
  ArrowUpRight,
  Zap,
  Search,
  Radio,
  Server,
  Lock,
} from 'lucide-react';

interface NotificationTrigger {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  category: string;
}

interface WhatsAppLog {
  id: string;
  type: string;
  message: string;
  recipient: string;
  sentAt: string;
  status: 'DELIVERED' | 'READ' | 'QUEUED';
  latency: string;
}

interface DeliveryDayData {
  day: string;
  date: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  rate: number;
}

export default function AdminWhatsAppPage() {
  const { user } = useAuth();

  // Admin WhatsApp Test Number state
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+91 98765 43210');
  const [countryCode, setCountryCode] = useState('+91');
  const [rawPhone, setRawPhone] = useState('9876543210');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Timeframe for Graph Analytics
  const [analyticsRange, setAnalyticsRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(6);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter for dispatch logs table
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READ' | 'DELIVERED' | 'QUEUED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Test Message Simulator State
  const [selectedTemplate, setSelectedTemplate] = useState<'verification' | 'points' | 'shipment' | 'deal'>('verification');
  const [testSending, setTestSending] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // Notification triggers list
  const [triggers, setTriggers] = useState<NotificationTrigger[]>([
    {
      id: 'verification_updates',
      title: 'Purchase Proof Verification Status',
      description: 'Receive an instant ping when trader invoice is received, approved, or if more info is needed.',
      icon: CheckCircle2,
      enabled: true,
      category: 'AUDIT',
    },
    {
      id: 'points_credited',
      title: 'Reward Points Credited Alert',
      description: 'Notify trader the exact second cashback points hit wallet ledger (e.g. +4,500 PTS).',
      icon: Coins,
      enabled: true,
      category: 'WALLET',
    },
    {
      id: 'shipment_tracking',
      title: 'Reward Dispatch & Live Courier Tracking',
      description: 'Dispatch FedEx/DHL live tracking code and delivery updates directly on WhatsApp.',
      icon: Package,
      enabled: true,
      category: 'REWARDS',
    },
    {
      id: 'flash_deals',
      title: 'Flash Prop Firm Discount Codes & Free Passes',
      description: 'Broadcast exclusive partner promo coupons and discounts to active traders.',
      icon: Sparkles,
      enabled: true,
      category: 'PROMO',
    },
    {
      id: 'deadline_reminders',
      title: '14-Day Submission Deadline Reminders',
      description: 'Automated reminder ping before prop firm purchase eligibility window closes.',
      icon: Clock,
      enabled: true,
      category: 'REMINDER',
    },
    {
      id: 'security_alerts',
      title: 'Account Security & New Login Alerts',
      description: 'Instant WhatsApp message if an unrecognized IP or device logs into a trader account.',
      icon: ShieldCheck,
      enabled: true,
      category: 'SECURITY',
    },
  ]);

  // Delivery Volume Data for 7, 14, and 30 Days
  const deliveryDataSets: Record<'7d' | '14d' | '30d', DeliveryDayData[]> = {
    '7d': [
      { day: 'Fri', date: 'Sep 26', sent: 142, delivered: 140, read: 131, failed: 2, rate: 98.6 },
      { day: 'Sat', date: 'Sep 27', sent: 185, delivered: 183, read: 174, failed: 2, rate: 98.9 },
      { day: 'Sun', date: 'Sep 28', sent: 160, delivered: 158, read: 149, failed: 2, rate: 98.7 },
      { day: 'Mon', date: 'Sep 29', sent: 210, delivered: 208, read: 196, failed: 2, rate: 99.0 },
      { day: 'Tue', date: 'Sep 30', sent: 245, delivered: 242, read: 228, failed: 3, rate: 98.8 },
      { day: 'Wed', date: 'Oct 01', sent: 218, delivered: 215, read: 201, failed: 3, rate: 98.6 },
      { day: 'Thu (Today)', date: 'Oct 02', sent: 268, delivered: 264, read: 245, failed: 4, rate: 98.5 },
    ],
    '14d': [
      { day: '19 Sep', date: 'Sep 19', sent: 120, delivered: 118, read: 110, failed: 2, rate: 98.3 },
      { day: '20 Sep', date: 'Sep 20', sent: 135, delivered: 133, read: 125, failed: 2, rate: 98.5 },
      { day: '21 Sep', date: 'Sep 21', sent: 110, delivered: 108, read: 101, failed: 2, rate: 98.2 },
      { day: '22 Sep', date: 'Sep 22', sent: 170, delivered: 168, read: 158, failed: 2, rate: 98.8 },
      { day: '23 Sep', date: 'Sep 23', sent: 195, delivered: 193, read: 182, failed: 2, rate: 99.0 },
      { day: '24 Sep', date: 'Sep 24', sent: 180, delivered: 177, read: 167, failed: 3, rate: 98.3 },
      { day: '25 Sep', date: 'Sep 25', sent: 205, delivered: 202, read: 191, failed: 3, rate: 98.5 },
      { day: '26 Sep', date: 'Sep 26', sent: 142, delivered: 140, read: 131, failed: 2, rate: 98.6 },
      { day: '27 Sep', date: 'Sep 27', sent: 185, delivered: 183, read: 174, failed: 2, rate: 98.9 },
      { day: '28 Sep', date: 'Sep 28', sent: 160, delivered: 158, read: 149, failed: 2, rate: 98.7 },
      { day: '29 Sep', date: 'Sep 29', sent: 210, delivered: 208, read: 196, failed: 2, rate: 99.0 },
      { day: '30 Sep', date: 'Sep 30', sent: 245, delivered: 242, read: 228, failed: 3, rate: 98.8 },
      { day: '01 Oct', date: 'Oct 01', sent: 218, delivered: 215, read: 201, failed: 3, rate: 98.6 },
      { day: 'Today', date: 'Oct 02', sent: 268, delivered: 264, read: 245, failed: 4, rate: 98.5 },
    ],
    '30d': [
      { day: 'Wk 1', date: 'Sep 03 - Sep 09', sent: 980, delivered: 968, read: 905, failed: 12, rate: 98.7 },
      { day: 'Wk 2', date: 'Sep 10 - Sep 16', sent: 1140, delivered: 1125, read: 1056, failed: 15, rate: 98.6 },
      { day: 'Wk 3', date: 'Sep 17 - Sep 23', sent: 1290, delivered: 1276, read: 1198, failed: 14, rate: 98.9 },
      { day: 'Wk 4', date: 'Sep 24 - Sep 30', sent: 1460, delivered: 1441, read: 1355, failed: 19, rate: 98.7 },
      { day: 'Current', date: 'Oct 01 - Oct 02', sent: 486, delivered: 479, read: 446, failed: 7, rate: 98.5 },
    ],
  };

  const currentChartData = deliveryDataSets[analyticsRange];
  const maxVolume = Math.max(...currentChartData.map((d) => d.sent), 1);

  // Totals for current range
  const totalSent = currentChartData.reduce((acc, d) => acc + d.sent, 0);
  const totalDelivered = currentChartData.reduce((acc, d) => acc + d.delivered, 0);
  const totalRead = currentChartData.reduce((acc, d) => acc + d.read, 0);
  const totalFailed = currentChartData.reduce((acc, d) => acc + d.failed, 0);
  const overallDeliveryRate = ((totalDelivered / (totalSent || 1)) * 100).toFixed(1);
  const overallReadRate = ((totalRead / (totalDelivered || 1)) * 100).toFixed(1);

  // Active inspected day
  const activeDay = hoveredBarIndex !== null && currentChartData[hoveredBarIndex]
    ? currentChartData[hoveredBarIndex]
    : currentChartData[currentChartData.length - 1];

  // Category breakdown distribution
  const categoriesBreakdown = [
    {
      category: 'Purchase Audits & Verification',
      share: 46,
      count: Math.round(totalSent * 0.46),
      rate: '99.4%',
      badgeColor: 'bg-emerald-500',
    },
    {
      category: 'Reward Points Ledger Credit',
      share: 28,
      count: Math.round(totalSent * 0.28),
      rate: '98.9%',
      badgeColor: 'bg-blue-500',
    },
    {
      category: 'Courier & Live Tracking (FedEx/DHL)',
      share: 16,
      count: Math.round(totalSent * 0.16),
      rate: '99.7%',
      badgeColor: 'bg-purple-500',
    },
    {
      category: 'VIP Flash Promos & Reminders',
      share: 10,
      count: Math.round(totalSent * 0.10),
      rate: '96.2%',
      badgeColor: 'bg-amber-500',
    },
  ];

  // Dispatch logs
  const [logs, setLogs] = useState<WhatsAppLog[]>([
    {
      id: 'WA-88412',
      type: 'VERIFICATION_APPROVED',
      message: '✅ Success! Your Funding Pips $100K challenge purchase (ORD-8921) has been verified. +4,500 PTS credited.',
      recipient: '+91 98765 43210',
      sentAt: 'Today, 11:42 AM',
      status: 'READ',
      latency: '0.8s',
    },
    {
      id: 'WA-88409',
      type: 'POINTS_LEDGER',
      message: '💰 Cashback Alert: Your Available Balance is now 15,700 PTS (≈ $157.00 USD). Ready for cashout or rewards.',
      recipient: '+91 98765 43210',
      sentAt: 'Today, 09:15 AM',
      status: 'READ',
      latency: '1.1s',
    },
    {
      id: 'WA-88401',
      type: 'TRACKING_UPDATE',
      message: '📦 Reward Dispatch: Apple AirPods Pro (2nd Gen) package picked up by DHL Express. Tracking #DHL-882941029.',
      recipient: '+91 98765 43210',
      sentAt: 'Yesterday, 04:30 PM',
      status: 'READ',
      latency: '0.9s',
    },
    {
      id: 'WA-88390',
      type: 'PROMO_ALERT',
      message: '⚡ Flash Sale: Use code PIPSREWARDS for 10% off Funding Pips + double cashback points this weekend.',
      recipient: '+91 98765 43210',
      sentAt: 'Oct 01, 09:30 AM',
      status: 'DELIVERED',
      latency: '1.4s',
    },
    {
      id: 'WA-88375',
      type: 'DEADLINE_PING',
      message: '⏰ 3-Day Reminder: Complete your invoice verification for FTMO Challenge within 72 hours to secure +6,000 PTS.',
      recipient: '+91 98765 43210',
      sentAt: 'Sep 30, 02:15 PM',
      status: 'READ',
      latency: '1.0s',
    },
    {
      id: 'WA-88350',
      type: 'SECURITY_ALERT',
      message: '🛡️ New Login Detected: Trader account accessed from IP 104.28.142.1 (Mumbai, India). If this was you, ignore.',
      recipient: '+91 98765 43210',
      sentAt: 'Sep 29, 08:04 PM',
      status: 'DELIVERED',
      latency: '0.7s',
    },
  ]);

  const toggleTrigger = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const full = `${countryCode} ${rawPhone.trim()}`;
      setPhoneNumber(full);
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  // Preview message generator
  const getPreviewText = () => {
    switch (selectedTemplate) {
      case 'verification':
        return `✅ *PROPREWARDS AUDIT UPDATE*\n\nHello Trader! Your purchase proof for *Funding Pips $100K 2-Step* (Order #FP-98214) has been *VERIFIED & APPROVED*.\n\n🎉 *+3,990 Reward Points* have been credited to your wallet ledger.\n\nCheck balance: https://propnation.com/dashboard/wallet`;
      case 'points':
        return `💰 *CASHBACK LEDGER CREDITED*\n\nYour wallet balance has updated!\n• Credited: *+3,990 PTS*\n• New Balance: *15,700 PTS (≈ $1,570.00 USD)*\n\nYou are now eligible to redeem Apple iPhone 18 Pro, MacBook Pro, Nike sneakers, or request USDT cashout.\n\nRedeem now: https://propnation.com/rewards`;
      case 'shipment':
        return `📦 *REWARD ORDER DISPATCHED*\n\nGreat news! Your redeemed *Casio G-Shock Watch* is on its way via *DHL Express*.\n\n• Courier: DHL Express\n• Tracking #: *DHL-882941029*\n• Estimated Delivery: 2-3 Business Days\n\nTrack parcel: https://propnation.com/dashboard/redemptions`;
      case 'deal':
        return `⚡ *VIP PROMO ALERT: EXCLUSIVE PARTNER OFFER*\n\nExclusive promo for verified traders:\nGet verified rewards on all *FundedSquad, Pipstone Capital, FTMO, FundedNext & Funding Pips* evaluations.\n\nUniversal Partner Code: *NATION*\nClaim here: https://propnation.com/prop-firms`;
    }
  };

  const handleSendTestPing = () => {
    setTestSending(true);
    setTestSuccess(false);

    setTimeout(() => {
      setTestSending(false);
      setTestSuccess(true);

      const newEntry: WhatsAppLog = {
        id: `WA-${Math.floor(10000 + Math.random() * 90000)}`,
        type: selectedTemplate.toUpperCase(),
        message: getPreviewText().slice(0, 100) + '...',
        recipient: phoneNumber,
        sentAt: 'Just now',
        status: 'DELIVERED',
        latency: '0.8s',
      };
      setLogs([newEntry, ...logs]);

      setTimeout(() => setTestSuccess(false), 4000);
    }, 800);
  };

  const handleOpenWhatsAppDirect = () => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(getPreviewText());
    window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`, '_blank');
  };

  // CSV Report Generator
  const handleExportCSV = () => {
    const headers = ['Message ID', 'Notification Type', 'Recipient', 'Message Content', 'Timestamp', 'Status', 'SLA Latency'];
    const rows = logs.map((l) => [
      l.id,
      l.type,
      l.recipient,
      `"${l.message.replace(/"/g, '""')}"`,
      l.sentAt,
      l.status,
      l.latency,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whatsapp_delivery_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Refresh Analytics simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              WhatsApp Automation &amp; Delivery Control
            </h1>
            <Badge variant="success" className="gap-1 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Meta Cloud API Live
            </Badge>
            <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-bold">
              ADMIN ONLY
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Administrative delivery graphs, SLA statistics, Meta Cloud Webhook triggers, and automated notification controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
          >
            <Download className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            Export CSV Report
          </Button>

          <Button
            size="sm"
            onClick={handleOpenWhatsAppDirect}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            Direct Test Chat
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* 4 Performance KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sent */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Dispatched
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalSent.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        {/* Delivered Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Delivered Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{overallDeliveryRate}%</span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              ({totalDelivered.toLocaleString()})
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{totalFailed} queued/retried</span>
          </div>
        </div>

        {/* Read Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Read / Opened Rate
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <CheckCheck className="h-4 w-4 text-blue-500 dark:text-sky-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{overallReadRate}%</span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              ({totalRead.toLocaleString()})
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
            Avg open speed: <strong className="text-slate-700 dark:text-slate-300">2.8 minutes</strong>
          </div>
        </div>

        {/* Latency / API SLA */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Meta Cloud SLA
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            0.98s
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>99.98% Gateway Uptime</span>
          </div>
        </div>
      </div>

      {/* GRAPH & ANALYTICS REPORT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left (8 Cols): Interactive Daily Delivery Volume Bar Graph */}
        <div className="lg:col-span-8 min-w-0 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 transition-colors flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Message Delivery &amp; Open Rate Graph
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hover or click any bar below to view daily volume, delivered count, and read rate breakdown.
              </p>
            </div>

            {/* Timeframe selector pill tabs */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                {(['7d', '14d', '30d'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setAnalyticsRange(range);
                      setHoveredBarIndex(deliveryDataSets[range].length - 1);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      analyticsRange === range
                        ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs font-black'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '14d' ? '14 Days' : '30 Days'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefresh}
                title="Refresh metrics"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Interactive Inspection Ribbon */}
          {activeDay && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Selected Date</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{activeDay.day} ({activeDay.date})</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sent Messages</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{activeDay.sent} alerts</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Delivered (✓✓)</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {activeDay.delivered} ({activeDay.rate}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Read / Opened</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                  {activeDay.read} ({((activeDay.read / activeDay.delivered) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          )}

          {/* Responsive Bar Graph Visual */}
          <div className="pt-6 pb-2 w-full min-w-0">
            <div
              className={`h-56 flex items-end justify-between border-b border-slate-200 dark:border-slate-800 px-1 sm:px-2 w-full ${
                analyticsRange === '14d'
                  ? 'gap-1 sm:gap-1.5 md:gap-2'
                  : analyticsRange === '30d'
                  ? 'gap-4 sm:gap-8'
                  : 'gap-2 sm:gap-4 md:gap-6'
              }`}
            >
              {currentChartData.map((d, index) => {
                const heightPercent = Math.max((d.sent / maxVolume) * 100, 12);
                const deliveredHeightPercent = Math.max((d.delivered / d.sent) * 100, 10);
                const readHeightPercent = Math.max((d.read / d.sent) * 100, 8);
                const isSelected = hoveredBarIndex === index;

                return (
                  <div
                    key={`${d.day}-${index}`}
                    className="flex-1 min-w-0 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onClick={() => setHoveredBarIndex(index)}
                  >
                    {/* Hover count pill */}
                    <div
                      className={`absolute -top-7 z-30 text-[10px] font-mono font-bold py-0.5 px-1.5 rounded transition-all pointer-events-none whitespace-nowrap shadow-sm ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 opacity-100 scale-105'
                          : 'opacity-0 group-hover:opacity-100 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      }`}
                    >
                      {d.delivered}/{d.sent}
                    </div>

                    {/* Bar container */}
                    <div
                      className={`w-full max-w-[26px] sm:max-w-[32px] md:max-w-[40px] rounded-t-md sm:rounded-t-lg transition-all flex flex-col justify-end overflow-hidden ${
                        isSelected
                          ? 'ring-2 ring-emerald-500 shadow-md scale-[1.03]'
                          : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex flex-col justify-end">
                        <div
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 relative"
                          style={{ height: `${deliveredHeightPercent}%` }}
                        >
                          <div
                            className="w-full bg-blue-500/80 dark:bg-sky-400/80"
                            style={{ height: `${readHeightPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] sm:text-[10px] md:text-[11px] mt-2.5 truncate font-medium transition-colors max-w-full text-center block ${
                        isSelected
                          ? 'font-bold text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                      title={`${d.day} (${d.date})`}
                    >
                      {analyticsRange === '14d' ? (
                        <>
                          <span className="sm:hidden">{d.day.split(' ')[0]}</span>
                          <span className="hidden sm:inline">{d.day}</span>
                        </>
                      ) : (
                        d.day
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Graph Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-xs bg-emerald-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Delivered Messages</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-xs bg-blue-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Read Receipts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-xs bg-slate-200 dark:bg-slate-800" />
                  <span>Pending / Queued</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                Peak Time: 11:30 AM – 3:30 PM UTC
              </div>
            </div>
          </div>
        </div>

        {/* Right (4 Cols): Message Category Distribution & Breakdown */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 transition-colors flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Alert Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Breakdown of automated notifications triggered by category.
            </p>
          </div>

          <div className="space-y-4">
            {categoriesBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {cat.category}
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    {cat.rate}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{cat.count.toLocaleString()} messages</span>
                  <span>{cat.share}% total</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.badgeColor}`}
                    style={{ width: `${cat.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick SLA info badge */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Direct WhatsApp Cloud API Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Every message has TLS 1.3 encryption and automated retry policies in case of mobile network drops.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Staff Phone & Trigger Settings (Left 6) + Live WhatsApp Preview Simulator (Right 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Number Setup & Automated Rules */}
        <div className="lg:col-span-6 space-y-6">
          {/* WhatsApp Connection Card */}
          <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Admin Test Recipient Phone Number
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Gateway Online
              </span>
            </div>

            <form onSubmit={handleSavePhone} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Number for Test Dispatches
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="+91">🇮🇳 +91 (IN)</option>
                    <option value="+1">🇺🇸 +1 (US)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+49">🇩🇪 +49 (DE)</option>
                    <option value="+33">🇫🇷 +33 (FR)</option>
                    <option value="+61">🇦🇺 +61 (AU)</option>
                    <option value="+65">🇸🇬 +65 (SG)</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={rawPhone}
                    onChange={(e) => setRawPhone(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <Button type="submit" size="sm" isLoading={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    <Save className="h-4 w-4 mr-1.5" />
                    Save
                  </Button>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Admin test phone number updated successfully!</span>
                </div>
              )}
            </form>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Admin Security Notice:</strong> This target number is used by administrators to test broadcast messages, inspect live template delivery, and verify Meta Cloud API Webhook latency.
              </span>
            </div>
          </div>

          {/* Automated Notification Trigger Toggles */}
          <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Automated Platform Trigger Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Global toggle for automated webhook notifications sent to registered traders.
                </p>
              </div>
              <Badge variant="purple">{triggers.filter((t) => t.enabled).length} Enabled</Badge>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-1">
              {triggers.map((trigger) => {
                const Icon = trigger.icon;
                return (
                  <div
                    key={trigger.id}
                    className="py-3 flex items-start justify-between gap-4 cursor-pointer"
                    onClick={() => toggleTrigger(trigger.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {trigger.title}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {trigger.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        trigger.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          trigger.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive WhatsApp Device Simulator */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Interactive WhatsApp Alert Preview
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Live Simulator</span>
            </div>

            {/* Template Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose Sample Notification Template:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'verification', label: 'Proof Verified' },
                  { key: 'points', label: 'Points Credited' },
                  { key: 'shipment', label: 'Reward Shipped' },
                  { key: 'deal', label: 'VIP Flash Sale' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedTemplate(item.key as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTemplate === item.key
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Phone Mockup Visual */}
            <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-[#e5ddd5] dark:bg-[#0b141a] overflow-hidden shadow-inner flex flex-col min-h-[300px]">
              {/* WhatsApp App Top Bar */}
              <div className="bg-[#075e54] dark:bg-[#202c33] text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs border border-white/20">
                    PR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">PropFirm Rewards Bot</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                    </div>
                    <span className="text-[10px] text-emerald-200 block">Official Business Account</span>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-100 font-mono">24/7 Verified</div>
              </div>

              {/* Message Bubble Area */}
              <div className="p-4 flex-1 flex flex-col justify-end space-y-3">
                {/* Date stamp */}
                <div className="text-center">
                  <span className="text-[10px] font-semibold bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded shadow-xs">
                    TODAY
                  </span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="max-w-[85%] bg-white dark:bg-[#005c4b] text-slate-900 dark:text-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm space-y-2 text-xs leading-relaxed self-start">
                  <div className="whitespace-pre-line font-sans">
                    {getPreviewText()}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 dark:text-emerald-200">
                    <span>11:42 AM</span>
                    <CheckCheck className="h-3.5 w-3.5 text-blue-500 dark:text-sky-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                onClick={handleSendTestPing}
                isLoading={testSending}
                className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <Send className="h-4 w-4 mr-2" />
                Dispatch Test Message
              </Button>

              <Button
                variant="outline"
                onClick={handleOpenWhatsAppDirect}
                className="w-full sm:w-auto border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
              >
                <ExternalLink className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                Open In WhatsApp
              </Button>
            </div>

            {testSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-emerald-500" />
                  <span>
                    <strong>Dispatched!</strong> WhatsApp notification successfully queued to {phoneNumber}.
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-200">
                  HTTP 200 OK
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISPATCH AUDIT LOGS & META DELIVERY LEDGER TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Live Dispatch Audit Logs &amp; Meta Delivery Ledger
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete historical trace of notifications transmitted via Meta Cloud API.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient, type, or ID..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 w-52 sm:w-64"
              />
            </div>

            {/* Filter pills */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              {(['ALL', 'READ', 'DELIVERED', 'QUEUED'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs font-black'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4">Message ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Message Preview</th>
                <th className="p-4">Sent At</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">SLA Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No dispatch records matching &quot;{searchQuery}&quot; found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {log.id}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.type}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                      {log.recipient}
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {log.message}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {log.sentAt}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {log.status === 'READ' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                          <CheckCheck className="h-3 w-3" /> READ
                        </span>
                      ) : log.status === 'DELIVERED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          <Check className="h-3 w-3" /> DELIVERED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> QUEUED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {log.latency}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
