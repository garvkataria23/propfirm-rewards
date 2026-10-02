'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
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
}

export default function WhatsAppDashboardPage() {
  const { user } = useAuth();

  // WhatsApp connection state
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+91 98765 43210');
  const [countryCode, setCountryCode] = useState('+91');
  const [rawPhone, setRawPhone] = useState('9876543210');
  const [isConnected, setIsConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Test Message Simulator State
  const [selectedTemplate, setSelectedTemplate] = useState<'verification' | 'points' | 'shipment' | 'deal'>('verification');
  const [testSending, setTestSending] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // Notification triggers list
  const [triggers, setTriggers] = useState<NotificationTrigger[]>([
    {
      id: 'verification_updates',
      title: 'Purchase Proof Verification Status',
      description: 'Receive an instant ping when your invoice is received, approved, or if more info is needed.',
      icon: CheckCircle2,
      enabled: true,
      category: 'AUDIT',
    },
    {
      id: 'points_credited',
      title: 'Reward Points Credited Alert',
      description: 'Get notified the exact second cashback points hit your wallet ledger (e.g. +4,500 PTS).',
      icon: Coins,
      enabled: true,
      category: 'WALLET',
    },
    {
      id: 'shipment_tracking',
      title: 'Reward Dispatch & Live Courier Tracking',
      description: 'Receive your FedEx/DHL live tracking code and delivery updates directly on WhatsApp.',
      icon: Package,
      enabled: true,
      category: 'REWARDS',
    },
    {
      id: 'flash_deals',
      title: 'Flash Prop Firm Discount Codes & Free Passes',
      description: 'Be the first to receive 20%-30% partner promo coupons before they expire.',
      icon: Sparkles,
      enabled: true,
      category: 'PROMO',
    },
    {
      id: 'deadline_reminders',
      title: '14-Day Submission Deadline Reminders',
      description: '3-day reminder ping before your prop firm purchase eligibility window closes.',
      icon: Clock,
      enabled: true,
      category: 'REMINDER',
    },
    {
      id: 'security_alerts',
      title: 'Account Security & New Login Alerts',
      description: 'Instant WhatsApp message if an unrecognized IP or device logs into your trader account.',
      icon: ShieldCheck,
      enabled: true,
      category: 'SECURITY',
    },
  ]);

  // Sample dispatch log
  const [logs, setLogs] = useState<WhatsAppLog[]>([
    {
      id: 'WA-88412',
      type: 'VERIFICATION_APPROVED',
      message: '✅ Success! Your Funding Pips $100K challenge purchase (ORD-8921) has been verified. +4,500 PTS credited.',
      recipient: '+91 98765 43210',
      sentAt: 'Today, 11:42 AM',
      status: 'READ',
    },
    {
      id: 'WA-88409',
      type: 'POINTS_LEDGER',
      message: '💰 Cashback Alert: Your Available Balance is now 15,700 PTS (≈ $157.00 USD). Ready for cashout or rewards.',
      recipient: '+91 98765 43210',
      sentAt: 'Yesterday, 04:15 PM',
      status: 'READ',
    },
    {
      id: 'WA-88390',
      type: 'PROMO_ALERT',
      message: '⚡ Flash Sale: Use code PIPSREWARDS for 10% off Funding Pips + double cashback points this weekend.',
      recipient: '+91 98765 43210',
      sentAt: 'Oct 01, 09:30 AM',
      status: 'DELIVERED',
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
        return `✅ *PROPREWARDS AUDIT UPDATE*\n\nHello ${user?.name || 'Trader'}! Your purchase proof for *Funding Pips $100K 2-Step* (Order #FP-98214) has been *VERIFIED & APPROVED*.\n\n🎉 *+4,500 Reward Points* have been credited to your wallet ledger.\n\nCheck balance: https://propnation.com/dashboard/wallet`;
      case 'points':
        return `💰 *CASHBACK LEDGER CREDITED*\n\nYour wallet balance has updated!\n• Credited: *+4,500 PTS*\n• New Balance: *15,700 PTS (≈ $157.00 USD)*\n\nYou are now eligible to redeem Apple iPad Air or request USDT cashout.\n\nRedeem now: https://propnation.com/rewards`;
      case 'shipment':
        return `📦 *REWARD ORDER DISPATCHED*\n\nGreat news! Your redeemed *Apple AirPods Pro (2nd Gen)* is on its way via *DHL Express*.\n\n• Courier: DHL Express\n• Tracking #: *DHL-882941029*\n• Estimated Delivery: 2-3 Business Days\n\nTrack parcel: https://propnation.com/dashboard/redemptions`;
      case 'deal':
        return `⚡ *VIP PROMO ALERT: 20% OFF*\n\nExclusive weekend promo for verified traders:\nGet 20% discount on all *Funding Pips & FTMO* evaluations.\n\nCode: *PIPSREWARDS*\nClaim here: https://propnation.com/prop-firms`;
    }
  };

  const handleSendTestPing = () => {
    setTestSending(true);
    setTestSuccess(false);

    setTimeout(() => {
      setTestSending(false);
      setTestSuccess(true);

      // Add to log
      const newEntry: WhatsAppLog = {
        id: `WA-${Math.floor(10000 + Math.random() * 90000)}`,
        type: selectedTemplate.toUpperCase(),
        message: getPreviewText().slice(0, 100) + '...',
        recipient: phoneNumber,
        sentAt: 'Just now',
        status: 'DELIVERED',
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              WhatsApp Reminders &amp; Instant Alerts
            </h1>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated WhatsApp reminders for verified purchases, points clearance, and luxury reward courier dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/?text=Hello%20PropFirm%20Rewards%20Support"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Chat With Human Agent
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </a>
        </div>
      </div>

      {/* Grid: Phone Configuration (Left 6) + Live WhatsApp Preview Simulator (Right 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Number Setup & Automated Rules */}
        <div className="lg:col-span-6 space-y-6">
          {/* WhatsApp Connection Card */}
          <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Connected WhatsApp Phone Number
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified &amp; Connected
              </span>
            </div>

            <form onSubmit={handleSavePhone} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number (with WhatsApp active)
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
                  <span>WhatsApp alert phone number updated successfully!</span>
                </div>
              )}
            </form>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>End-to-End Privacy:</strong> We use official Meta WhatsApp Cloud API. Your phone number is strictly used for your account reminders and is never sold or shared.
              </span>
            </div>
          </div>

          {/* Automated Notification Trigger Toggles */}
          <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Automated Reminder Triggers
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which automated alerts you want delivered to your WhatsApp.
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
                    <span>12:45 PM</span>
                    <CheckCheck className="h-3 w-3 text-blue-500 dark:text-sky-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Send Trigger Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                onClick={handleSendTestPing}
                isLoading={testSending}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
              >
                <Send className="h-4 w-4 mr-2" />
                Dispatch Test WhatsApp Ping
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenWhatsAppDirect}
                className="w-full sm:w-auto h-11 border-slate-300 dark:border-slate-700"
              >
                <ExternalLink className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                Open In WhatsApp Web
              </Button>
            </div>

            {testSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCheck className="h-4 w-4 shrink-0" />
                <span>Test message queued and dispatched to {phoneNumber}! Check your WhatsApp.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Dispatch Activity Log */}
      <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Recent WhatsApp Alert Dispatch Logs
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {logs.length} Messages Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Message ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Content Preview</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{log.id}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                      {log.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{log.recipient}</td>
                  <td className="py-3 px-3 max-w-xs truncate text-slate-700 dark:text-slate-300">{log.message}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{log.sentAt}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
