'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Send,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Ticket,
  MessageCircle,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'BOT' | 'USER';
  text: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  orderId?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  createdAt: string;
}

export default function LiveSupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'BOT',
      text: 'Hello trader! Welcome to PropNation Live Support Desk. I am your 24/7 AI Desk Assistant. How can I assist you with your prop firm verification, points balance, or reward delivery today?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Ticket states
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('VERIFICATION');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Saved tickets list
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-8812',
      subject: 'Funding Pips $100K 2-Step Invoice Verification',
      category: 'VERIFICATION',
      orderId: 'FP-ORD-98214',
      status: 'RESOLVED',
      createdAt: 'Today, 10:30 AM',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userQuery = input.toLowerCase();
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Thank you for contacting us! Our team has received your query. You can check real-time updates directly in your Trader Wallet and Verification Hub.";

      if (userQuery.includes('points') || userQuery.includes('balance') || userQuery.includes('cashback')) {
        reply = "💰 Points are credited to your Trader Wallet upon invoice verification (typically within 35 minutes). 100 PTS = $1.00 USD cashout value. You can withdraw via USDT (TRC20) or claim Apple gadgets in the Rewards Store.";
      } else if (userQuery.includes('tracking') || userQuery.includes('courier') || userQuery.includes('dhl') || userQuery.includes('fedex') || userQuery.includes('reward')) {
        reply = "📦 All physical tech rewards (AirPods, iPads, iPhones) are dispatched via insured DHL Express or FedEx Priority. You can view your live waybill radar and tracking number under 'Reward Redemptions'.";
      } else if (userQuery.includes('verify') || userQuery.includes('proof') || userQuery.includes('invoice') || userQuery.includes('submit')) {
        reply = "✅ When submitting a challenge purchase proof, make sure the screenshot shows the Order ID, date, and amount paid. Our new AI OCR engine will automatically scan and fill the details for you!";
      } else if (userQuery.includes('human') || userQuery.includes('agent') || userQuery.includes('whatsapp') || userQuery.includes('phone')) {
        reply = "📞 For VIP 1-on-1 human assistance, you can click the 'Priority WhatsApp Desk' button at the top of this page to connect directly with our fulfillment lead.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject,
      category: ticketCategory,
      orderId: ticketOrderId || undefined,
      status: 'OPEN',
      createdAt: 'Just now',
    };

    setTickets([newTicket, ...tickets]);
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
      setTicketModalOpen(false);
      setTicketSubject('');
      setTicketOrderId('');
      setTicketDescription('');
    }, 1800);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Desk Status: Live 24/7</Badge>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Avg reply: &lt; 2 mins</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <MessageSquare className="h-7 w-7 text-blue-500" />
            PropNation Trader Support Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time chat with our AI concierge, priority WhatsApp escalation, and formal inquiry ticket desk.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://wa.me/?text=Hello%20PropNation%20Support%2C%20I%20need%20assistance%20with%20my%20prop%20firm%20reward%20order"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-bold">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Priority WhatsApp
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </a>

          <Button
            size="sm"
            onClick={() => setTicketModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            <Ticket className="h-4 w-4 mr-1.5" />
            Open Support Ticket
          </Button>
        </div>
      </div>

      {/* Main Grid: Live AI Desk Chat (Left 7) + Quick FAQs & Open Tickets (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chat Container (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-[540px] bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden shadow-xs">
            {/* Chat Header Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>PropNation Concierge Desk</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-slate-500">24/7 Automated Verification Assistant</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Online
              </span>
            </div>

            {/* Message Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'USER' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      m.sender === 'USER'
                        ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{m.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  Agent is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Pills */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {[
                'How do I earn points?',
                'Track my DHL parcel',
                'Verification timeline',
                'USDT cashout limits',
              ].map((query, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInput(query)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask about points, invoices, courier tracking, or prop firms..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Support Tickets & Knowledge Base (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Support Tickets */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Your Support Tickets
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{tickets.length} Registered</span>
            </div>

            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{t.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">{t.subject}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Category: {t.category}</span>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick FAQ Knowledge Cards */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Frequently Asked Inquiries
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  ⚡ How long does invoice verification take?
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  Under 45 minutes on average. Our AI OCR engine automatically extracts invoice parameters to expedite auditor approval.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  📦 When will my physical reward arrive?
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  Physical Apple gadgets ship via DHL Express Worldwide or FedEx Priority. Deliveries typically arrive in 2–4 business days with signature confirmation.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  💰 Can I convert points directly to Crypto?
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  Yes. Go to Trader Wallet $\rightarrow$ Request Cashout. We support USDT (TRC20), ERC20, and direct bank wire with 2FA WhatsApp verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Open Support Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Submit Formal Inquiry Ticket
              </h3>
              <button
                onClick={() => setTicketModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {ticketSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Ticket Submitted Successfully!</h4>
                <p className="text-xs text-slate-500">
                  Ticket #{tickets[0]?.id || 'TCK-8812'} has been routed to our verification lead. Check back soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="VERIFICATION">Invoice Proof Verification</option>
                      <option value="POINTS_DELAY">Points Credit Inquiries</option>
                      <option value="REWARD_TRACKING">Reward Courier Shipment</option>
                      <option value="AFFILIATE">Affiliate Partnership</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Order ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. FP-ORD-98214"
                      value={ticketOrderId}
                      onChange={(e) => setTicketOrderId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ticket Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description of your issue"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Detailed Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide relevant details about your challenge purchase, firm name, or tracking code..."
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTicketModalOpen(false)}
                    className="w-1/3 border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    Submit Support Ticket
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
