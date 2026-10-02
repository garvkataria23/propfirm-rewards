'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare,
  Send,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Ticket,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  AlertCircle,
  Zap,
  User,
  Radio,
  ExternalLink,
  Phone,
  PhoneCall,
  Search,
  Check,
  Copy,
  Tag,
  ArrowRight,
  Calendar,
  Smartphone,
  Globe,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: string;
  message: string;
  isInternalNote: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  assignedToId?: string | null;
  subject: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_TRADER' | 'RESOLVED' | 'CLOSED';
  lastMessageAt: string;
  createdAt: string;
  assignedTo?: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  } | null;
  messages?: ChatMessage[];
}

type SupportChannel = 'LIVE_CHAT' | 'WHATSAPP' | 'CALL' | 'FAQ';

export default function LiveSupportPage() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && pathname === '/support/live') {
      router.replace('/dashboard/support');
    }
  }, [user, isLoading, pathname, router]);

  const [activeChannel, setActiveChannel] = useState<SupportChannel>('LIVE_CHAT');

  // Live Chat States
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [agentTyping, setAgentTyping] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // New Ticket Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDepartment, setNewDepartment] = useState('PURCHASE_PROOF');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newTrackingId, setNewTrackingId] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // WhatsApp States
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Phone Callback Form States
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTrackingId, setCallbackTrackingId] = useState('');
  const [callbackTime, setCallbackTime] = useState('IMMEDIATE');
  const [callbackNotes, setCallbackNotes] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  // FAQ Search State
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const quickPrompts = [
    'Expedite my purchase verification OCR review',
    'What is the turnaround time for USDT TRC20 cashout?',
    'How do I activate the Diamond Whale 2.0x points multiplier?',
    'I have an issue with my Funding Pips account ID',
  ];

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const fetchMyTickets = async () => {
    try {
      const res = await api.get<SupportTicket[]>('/support/my-tickets');
      setTickets(res || []);
      if (!activeTicketId && res && res.length > 0) {
        setActiveTicketId(res[0].id);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  useEffect(() => {
    if (!activeTicketId) return;

    api.get<SupportTicket>(`/support/tickets/${activeTicketId}`)
      .then((res) => {
        setActiveTicket(res);
        scrollToBottom();
      })
      .catch((err) => console.error('Error loading ticket details:', err));
  }, [activeTicketId]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setWsConnected(true);
      if (user) {
        socket.emit('authenticate', {
          userId: user.id,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        });
      }
    });

    socket.on('disconnect', () => {
      setWsConnected(false);
    });

    socket.on('new_message', (data: { ticketId: string; message: ChatMessage; ticket: any }) => {
      if (data.message.isInternalNote) return;

      setActiveTicket((prev) => {
        if (!prev || prev.id !== data.ticketId) return prev;
        const exists = prev.messages?.some((m) => m.id === data.message.id);
        if (exists) return prev;

        if (data.message.senderRole !== 'USER') {
          playChime();
        }

        return {
          ...prev,
          status: data.ticket.status,
          lastMessageAt: data.ticket.lastMessageAt,
          messages: [...(prev.messages || []), data.message],
        };
      });

      scrollToBottom();
    });

    socket.on('user_typing', (data: { ticketId: string; user: { id: string; name: string; role: string }; isTyping: boolean }) => {
      if (data.ticketId === activeTicketId && data.user.id !== user?.id) {
        if (data.isTyping) {
          const roleLabel = data.user.role.replace('_', ' ');
          setAgentTyping(`${data.user.name} (${roleLabel}) is typing...`);
        } else {
          setAgentTyping(null);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeTicketId]);

  useEffect(() => {
    if (!socketRef.current || !activeTicketId || !user) return;

    socketRef.current.emit('join_ticket', {
      ticketId: activeTicketId,
      user: { id: user.id, name: user.name, role: user.role },
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_ticket', {
          ticketId: activeTicketId,
          user: { id: user.id, name: user.name },
        });
      }
    };
  }, [activeTicketId, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (socketRef.current && activeTicketId && user) {
      socketRef.current.emit('typing_start', {
        ticketId: activeTicketId,
        user: { id: user.id, name: user.name, role: user.role },
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && activeTicketId && user) {
          socketRef.current.emit('typing_stop', {
            ticketId: activeTicketId,
            user: { id: user.id, name: user.name },
          });
        }
      }, 2500);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeTicketId || !user || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', {
          ticketId: activeTicketId,
          message: messageText,
          senderId: user.id,
          senderRole: 'USER',
        });
      } else {
        await api.post(`/support/tickets/${activeTicketId}/messages`, {
          message: messageText,
        });
        fetchMyTickets();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim()) return;

    setIsCreatingTicket(true);
    try {
      const subjectWithTracking = newTrackingId
        ? `[${newTrackingId.trim()}] ${newSubject.trim()}`
        : newSubject.trim();

      const created = await api.post<SupportTicket>('/support/tickets', {
        subject: subjectWithTracking,
        message: newInitialMsg.trim(),
        department: newDepartment,
        priority: newPriority,
      });

      setNewModalOpen(false);
      setNewSubject('');
      setNewTrackingId('');
      setNewInitialMsg('');
      await fetchMyTickets();
      setActiveTicketId(created.id);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleRequestCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;
    setCallbackSubmitted(true);
  };

  const faqs = [
    {
      q: 'How do I claim reward points using referral code NATION?',
      a: 'During checkout on any of our 5 partner prop firms (FundedSquad, Pipstone, FTMO, FundedNext, FundingPips), enter code "NATION" in the coupon/affiliate field. After payment, go to Dashboard -> Submit Purchase, upload your receipt screenshot/PDF, and our automated OCR system will verify and credit 10 reward points per $1 spent within minutes.',
      tag: 'Referral & Points',
    },
    {
      q: 'What is a Tracking Reference ID (e.g. PN-PUR-98214) and how do I use it?',
      a: 'Every time you submit a purchase, redemption, or payout, our platform issues an official Reference Tracking ID (e.g. PN-PUR-XXXXX). You can use this ID in Live Chat or WhatsApp to get instant priority support. Support agents and administrators can immediately inspect your full history, invoice, and approval status using this single ID.',
      tag: 'Tracking & IDs',
    },
    {
      q: 'How long does purchase receipt verification take?',
      a: 'Our AI OCR engine matches the order number, challenge tier, and referral code NATION in under 60 seconds. Manual staff audits for flagged or complex video receipts are typically processed in under 15 minutes during market hours.',
      tag: 'Verification',
    },
    {
      q: 'How do I cash out points for USDT or physical luxury goods?',
      a: 'Navigate to "Rewards Catalog" from your dashboard. Select any physical item (Nike, Apple iPhone, MacBook, G-Shock) or choose "Instant USDT Cashout". Enter your delivery address or TRC-20/ERC-20 crypto wallet address. Redemptions are dispatched within 24 hours.',
      tag: 'Payouts',
    },
    {
      q: 'Why was my purchase marked "MORE_INFO_REQUIRED" or rejected?',
      a: 'Common reasons include: (1) Order ID not clearly visible on screenshot, (2) Referral code NATION was missing at checkout, or (3) Duplicate order submission. Check your Dashboard Purchases page to view the exact admin reason and submit a clean screenshot or invoice PDF directly.',
      tag: 'Verification',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.tag.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070913] dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ======================================================== */}
        {/* TOP HERO BANNER */}
        {/* ======================================================== */}
        <div className="rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-gradient-to-r from-purple-950 via-[#0d0922] to-slate-950 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Radio className={`h-3 w-3 ${wsConnected ? 'animate-pulse text-purple-300' : 'text-slate-400'}`} />
                {wsConnected ? '24/7 Desk Online & Connected' : 'Connecting to Live Desk...'}
              </span>
              <span className="text-xs text-purple-200">Avg Response Time: &lt; 2 Minutes</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-[900] tracking-tight">
              PropNation Priority Support Center
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 max-w-2xl font-normal">
              Need help verifying a purchase, checking your tracking ID, or redeeming luxury rewards? Choose your preferred channel below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setNewModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-11 px-5 rounded-xl shadow-md shadow-purple-600/30 flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Support Ticket</span>
            </Button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4 MULTI-CHANNEL OPTIONS TABS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Option 1: Live Chat */}
          <button
            onClick={() => setActiveChannel('LIVE_CHAT')}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
              activeChannel === 'LIVE_CHAT'
                ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/25 scale-[1.02]'
                : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-purple-900/40 text-slate-800 dark:text-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                activeChannel === 'LIVE_CHAT' ? 'bg-white/20 text-white' : 'bg-purple-50 dark:bg-purple-950 text-purple-600'
              }`}>
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                activeChannel === 'LIVE_CHAT' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
              }`}>
                Instant
              </span>
            </div>
            <div>
              <div className="font-[900] text-sm sm:text-base">1. Live Chat</div>
              <div className={`text-xs ${activeChannel === 'LIVE_CHAT' ? 'text-purple-100' : 'text-slate-500'}`}>
                WebSocket Real-Time Chat
              </div>
            </div>
          </button>

          {/* Option 2: WhatsApp VIP Desk */}
          <button
            onClick={() => setActiveChannel('WHATSAPP')}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
              activeChannel === 'WHATSAPP'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25 scale-[1.02]'
                : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-purple-900/40 text-slate-800 dark:text-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                activeChannel === 'WHATSAPP' ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
              }`}>
                <Smartphone className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                activeChannel === 'WHATSAPP' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
              }`}>
                WhatsApp
              </span>
            </div>
            <div>
              <div className="font-[900] text-sm sm:text-base">2. WhatsApp Desk</div>
              <div className={`text-xs ${activeChannel === 'WHATSAPP' ? 'text-emerald-100' : 'text-slate-500'}`}>
                1-Click Direct Chat
              </div>
            </div>
          </button>

          {/* Option 3: Phone Call & Callback */}
          <button
            onClick={() => setActiveChannel('CALL')}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
              activeChannel === 'CALL'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25 scale-[1.02]'
                : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-purple-900/40 text-slate-800 dark:text-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                activeChannel === 'CALL' ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
              }`}>
                <PhoneCall className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                activeChannel === 'CALL' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
              }`}>
                Phone
              </span>
            </div>
            <div>
              <div className="font-[900] text-sm sm:text-base">3. Direct Call</div>
              <div className={`text-xs ${activeChannel === 'CALL' ? 'text-indigo-100' : 'text-slate-500'}`}>
                Hotline &amp; Callback
              </div>
            </div>
          </button>

          {/* Option 4: Help Center & FAQs */}
          <button
            onClick={() => setActiveChannel('FAQ')}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
              activeChannel === 'FAQ'
                ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/25 scale-[1.02]'
                : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-purple-900/40 text-slate-800 dark:text-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                activeChannel === 'FAQ' ? 'bg-white/20 text-white' : 'bg-purple-50 dark:bg-purple-950 text-purple-600'
              }`}>
                <HelpCircle className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                activeChannel === 'FAQ' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
              }`}>
                Self-Serve
              </span>
            </div>
            <div>
              <div className="font-[900] text-sm sm:text-base">4. Knowledge FAQ</div>
              <div className={`text-xs ${activeChannel === 'FAQ' ? 'text-purple-100' : 'text-slate-500'}`}>
                Instant Answers &amp; Guides
              </div>
            </div>
          </button>
        </div>

        {/* ======================================================== */}
        {/* CHANNEL VIEW 1: LIVE CHAT (WEBSOCKET & TICKETS) */}
        {/* ======================================================== */}
        {activeChannel === 'LIVE_CHAT' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
            {/* Left: Active Tickets Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-4 border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-950 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Ticket className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    My Active Tickets ({tickets.length})
                  </h3>
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {tickets.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-purple-100 dark:border-purple-900/40 rounded-2xl">
                      No active inquiry tickets. Click "Create Support Ticket" above to start live chat.
                    </div>
                  ) : (
                    tickets.map((t) => {
                      const isSelected = activeTicketId === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setActiveTicketId(t.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 shadow-xs'
                              : 'border-purple-100 dark:border-purple-900/30 bg-white dark:bg-slate-900/40 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">
                              {t.ticketNumber}
                            </span>
                            <Badge variant="purple" className="text-[9px]">{t.status}</Badge>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {t.subject}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                            <span className="uppercase tracking-wider font-semibold">{t.department}</span>
                            <span>
                              {t.assignedTo ? (
                                <span className="text-purple-600 font-medium">
                                  Agent: {t.assignedTo.name}
                                </span>
                              ) : (
                                'Waiting Agent...'
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>

              {/* Quick Inquiry Prompts */}
              <Card className="p-4 border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-950 shadow-xs space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  Suggested Inquiries
                </h4>
                <div className="space-y-1.5">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(prompt)}
                      className="w-full text-left p-2.5 rounded-xl bg-purple-50/40 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/40 text-[11px] text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-purple-700 transition-all cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Live Chat Window (8 cols) */}
            <div className="lg:col-span-8 flex flex-col">
              <Card className="flex-1 flex flex-col border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-950 shadow-xs overflow-hidden rounded-3xl">
                {activeTicket ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-purple-100 dark:border-purple-900/40 bg-purple-50/30 dark:bg-slate-900/50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                            {activeTicket.ticketNumber}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {activeTicket.subject}
                          </h3>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Department: <strong className="uppercase">{activeTicket.department}</strong> • Priority:{' '}
                          <strong className="text-purple-600">{activeTicket.priority}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="purple">{activeTicket.status}</Badge>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[440px] bg-slate-50/30 dark:bg-[#060814]">
                      {activeTicket.messages?.map((msg) => {
                        const isMe = msg.senderRole === 'USER';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-[10px] font-bold text-slate-500">
                                {isMe ? 'You' : msg.sender?.name || 'Support Desk'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div
                              className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                isMe
                                  ? 'bg-purple-600 text-white rounded-br-xs'
                                  : 'bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 text-slate-900 dark:text-white rounded-bl-xs'
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        );
                      })}

                      {agentTyping && (
                        <div className="flex items-center gap-2 text-xs text-purple-600 font-medium animate-pulse">
                          <span>{agentTyping}</span>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Box */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-3.5 border-t border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-950 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Type your message to support agent..."
                        value={inputMessage}
                        onChange={handleInputChange}
                        className="flex-1 bg-purple-50/40 dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/40 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                      <Button
                        type="submit"
                        disabled={isSending || !inputMessage.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                    <Headphones className="h-12 w-12 text-purple-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Welcome to PropNation Live Support
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Select an existing ticket on the left or create a new ticket to chat live with our verification and finance officers.
                    </p>
                    <Button
                      onClick={() => setNewModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                    >
                      Open New Inquiry Ticket
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CHANNEL VIEW 2: WHATSAPP VIP CONCIERGE DESK */}
        {/* ======================================================== */}
        {activeChannel === 'WHATSAPP' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Official PropNation VIP WhatsApp Desk</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white">
                Chat Directly on WhatsApp with Dedicated Verification Officers
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Prefer messaging on your phone? Connect immediately with our verified WhatsApp concierge. Send receipts, ask verification questions regarding your <strong>Tracking ID (PN-PUR-XXXXX)</strong>, and get instant answers in seconds.
              </p>

              <div className="space-y-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Quick Pre-filled Message (Optional)
                </div>
                <input
                  type="text"
                  placeholder="e.g. Please expedite verification for my Tracking ID: PN-PUR-98214"
                  value={customWhatsAppMsg}
                  onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`https://wa.me/15550192834?text=${encodeURIComponent(
                    customWhatsAppMsg || `Hello PropNation VIP Support, I need assistance with my account and purchase verification.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-12 px-7 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Launch WhatsApp Chat</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </a>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 p-6 shadow-xl space-y-5 text-center">
                <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold">
                  <Smartphone className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-[900] text-slate-900 dark:text-white">Official VIP Number</h3>
                  <div className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    +1 (555) 019-2834
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 block">Operating 24 Hours / 7 Days</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Instant OCR Verification</span>
                  </div>
                  <p>Send screenshot or PDF invoice directly in WhatsApp for quick approval.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CHANNEL VIEW 3: PHONE CALL & INSTANT CALLBACK */}
        {/* ======================================================== */}
        {activeChannel === 'CALL' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <PhoneCall className="h-4 w-4 text-indigo-600" />
                <span>Global Phone Hotlines &amp; Callback</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white">
                Speak Live with a Senior Account Officer
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Have a large challenge volume or urgent payout question? Dial our regional direct desks or request an immediate callback below.
              </p>

              {/* Regional Phone Numbers */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🇺🇸 United States &amp; International</span>
                      <Badge variant="purple" className="text-[9px]">Toll-Free</Badge>
                    </div>
                    <div className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      +1 (800) 845-9201
                    </div>
                  </div>
                  <a href="tel:+18008459201">
                    <Button variant="outline" size="sm" className="text-xs font-bold border-indigo-200">
                      Call Now
                    </Button>
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🇬🇧 United Kingdom &amp; Europe Desk</span>
                    </div>
                    <div className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      +44 20 7946 0912
                    </div>
                  </div>
                  <a href="tel:+442079460912">
                    <Button variant="outline" size="sm" className="text-xs font-bold border-indigo-200">
                      Call Now
                    </Button>
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🇮🇳 Asia &amp; India Regional Desk</span>
                    </div>
                    <div className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      +91 98765 43210
                    </div>
                  </div>
                  <a href="tel:+919876543210">
                    <Button variant="outline" size="sm" className="text-xs font-bold border-indigo-200">
                      Call Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Request Callback Form Card */}
            <div className="md:col-span-6">
              <Card className="rounded-3xl border-indigo-100 dark:border-indigo-900/40 p-6 sm:p-8 bg-white dark:bg-slate-900 shadow-xl space-y-5 text-left">
                <div className="space-y-1">
                  <h3 className="text-xl font-[900] text-slate-900 dark:text-white">Request Immediate Callback</h3>
                  <p className="text-xs text-slate-500">Our desk will dial your phone number directly within 5 minutes.</p>
                </div>

                {callbackSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Callback Request Confirmed!</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      A senior VIP concierge officer has received your ticket and is preparing to call <strong>{callbackPhone}</strong> shortly.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCallbackSubmitted(false)}
                      className="mt-2 text-xs"
                    >
                      Book Another Callback
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleRequestCallback} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Garv Kataria"
                        value={callbackName}
                        onChange={(e) => setCallbackName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number (with Country Code)</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210 or +1 (555) ..."
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tracking Reference ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. PN-PUR-98214"
                        value={callbackTrackingId}
                        onChange={(e) => setCallbackTrackingId(e.target.value)}
                        className="w-full font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Preferred Time</label>
                      <select
                        value={callbackTime}
                        onChange={(e) => setCallbackTime(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="IMMEDIATE">Immediately (within 5 minutes)</option>
                        <option value="15MIN">In 15 minutes</option>
                        <option value="1HOUR">In 1 hour</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-11 rounded-xl shadow-md shadow-indigo-600/25"
                    >
                      Confirm Callback Request
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CHANNEL VIEW 4: HELP CENTER & FAQS */}
        {/* ======================================================== */}
        {activeChannel === 'FAQ' && (
          <div className="space-y-8 text-left max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-[900] text-slate-900 dark:text-white">
                Frequently Asked Questions &amp; Knowledge Base
              </h2>
              <p className="text-sm text-slate-500 max-w-lg mx-auto">
                Instant answers regarding purchase verification, reference tracking IDs, and point redemptions.
              </p>

              {/* Search input */}
              <div className="relative max-w-md mx-auto pt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search keywords (e.g. NATION, Tracking ID, USDT, proof)..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 pl-11 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Badge variant="purple" className="text-[10px] shrink-0">{faq.tag}</Badge>
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-purple-500 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-purple-50 dark:border-purple-950/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NEW TICKET MODAL WITH TRACKING ID OPTION */}
        {/* ======================================================== */}
        {newModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <Card className="w-full max-w-lg rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-purple-600" />
                  Create Priority Inquiry Ticket
                </h3>
                <button
                  onClick={() => setNewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNewTicket} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Question regarding my FTMO evaluation proof"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-purple-50/40 dark:bg-slate-950 border border-purple-100 dark:border-purple-900/40 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Purchase Tracking ID (Optional, e.g. PN-PUR-98214)
                  </label>
                  <input
                    type="text"
                    placeholder="PN-PUR-XXXXX"
                    value={newTrackingId}
                    onChange={(e) => setNewTrackingId(e.target.value)}
                    className="w-full font-mono bg-purple-50/40 dark:bg-slate-950 border border-purple-100 dark:border-purple-900/40 rounded-xl px-4 py-2.5 text-xs text-purple-700 dark:text-purple-300 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full bg-purple-50/40 dark:bg-slate-950 border border-purple-100 dark:border-purple-900/40 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="PURCHASE_PROOF">Purchase Verification</option>
                      <option value="POINTS_PAYOUT">Points &amp; USDT Cashout</option>
                      <option value="REWARD_SHIPPING">Physical Reward Shipping</option>
                      <option value="TECHNICAL">Technical &amp; Account</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full bg-purple-50/40 dark:bg-slate-950 border border-purple-100 dark:border-purple-900/40 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent (VIP)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry or order details..."
                    value={newInitialMsg}
                    onChange={(e) => setNewInitialMsg(e.target.value)}
                    className="w-full bg-purple-50/40 dark:bg-slate-950 border border-purple-100 dark:border-purple-900/40 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isCreatingTicket}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    {isCreatingTicket ? 'Connecting...' : 'Start Live Chat'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
