'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  MessageSquare,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'verification',
    priority: 'medium',
    orderId: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate reliable ticket creation with generated ID
    setTimeout(() => {
      const generatedId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(generatedId);
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <LifeBuoy className="h-3.5 w-3.5" />
          <span>24/7 Priority Trader Support Desk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          How Can We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Help You</span> Today?
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Need assistance verifying your prop firm purchase, tracking a reward shipment, or inquiring about partner cashback rates? Our specialized verification team responds in under 2 hours.
        </p>
      </div>

      {/* 3 Quick Help Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">Direct Verification Desk</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Send proofs, invoices, or escalation questions directly to our manual auditing team.
          </p>
          <a
            href="mailto:support@propnation.com"
            className="inline-flex items-center text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            support@propnation.com
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">Live Telegram Support</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Connect with our verified support reps on Telegram for instantaneous ticket tracking.
          </p>
          <a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            Join @PropNationSupport
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">Guaranteed Response SLA</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All purchase proofs and ticket queries are audited within 24 hours maximum (usually under 2 hrs).
          </p>
          <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Support Desk: Active & Online</span>
          </div>
        </div>
      </div>

      {/* Contact Form & Side Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Ticket Form */}
        <div className="lg:col-span-8">
          <Card className="p-6 sm:p-8 border-slate-800 bg-slate-900/80">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-white">Ticket Submitted Successfully!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Your request has been routed to our verification & customer success desk under Ticket Reference ID:
                </p>
                <div className="inline-block px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-base font-bold text-emerald-400">
                  #{ticketId}
                </div>
                <p className="text-xs text-slate-400">
                  A confirmation email has been dispatched to <span className="text-white font-medium">{formData.email}</span>. A representative will contact you shortly.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        category: 'verification',
                        priority: 'medium',
                        orderId: '',
                        subject: '',
                        message: '',
                      });
                    }}
                    variant="outline"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Create Support Ticket</h2>
                  <p className="text-xs text-slate-400">
                    Fill out the form below. Please provide exact Order IDs or Prop Firm names for fastest handling.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alexander Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@trader.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Inquiry Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="verification">Purchase Verification Proof</option>
                      <option value="points">Points Balance & Ledger Inquiry</option>
                      <option value="redemption">Reward Shipment & Tracking</option>
                      <option value="wallet">Wallet Cashout / Payout</option>
                      <option value="partnership">Prop Firm Partnership Desk</option>
                      <option value="other">Other General Support</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Urgency Level *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="low">Standard / Non-Urgent</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority (Purchase Expiring / Issue)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Prop Firm Order / Account ID <span className="text-slate-500 font-normal">(Optional, if regarding a purchase)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FTMO-982314 or FN-88219"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description of your query"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Detailed Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please include full details including prop firm purchased, date, and any specific error message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3 text-base shadow-lg shadow-blue-500/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Creating Ticket...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" />
                      Dispatch Ticket to Verification Team
                    </span>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Side Panel: FAQs and Office Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              <span>Frequent Inquiries</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="font-bold text-slate-200">How long does proof audit take?</span>
                <p className="text-slate-400">
                  Most purchases are verified automatically or manually within 12 to 24 hours.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="font-bold text-slate-200">Can I claim points from old purchases?</span>
                <p className="text-slate-400">
                  Purchases made within 30 days of registration using our affiliate link or coupon are eligible.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="font-bold text-slate-200">How do reward deliveries work?</span>
                <p className="text-slate-400">
                  Digital challenge accounts & vouchers deliver in &lt;1 hour. Physical hardware ships worldwide via DHL Express.
                </p>
              </div>
            </div>

            <Link href="/faq" className="block pt-1 text-center">
              <span className="text-xs font-bold text-blue-400 hover:text-blue-300">
                Browse Complete FAQ Directory →
              </span>
            </Link>
          </div>

          {/* Security & Verification Guarantee */}
          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Anti-Fraud & Security Shield</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All tickets and transaction submissions are end-to-end encrypted. We never ask for your broker account passwords or trading credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
