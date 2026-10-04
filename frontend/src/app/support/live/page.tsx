'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import {
  getOrCreateActiveUserTicket,
  getOrCreateGuestVisitor,
  createNewLiveChatTicket,
  sendLiveChatMessage,
  setLiveTypingStatus,
  markTicketMessagesAsSeen,
  uploadChatAttachment,
  triggerDesktopChatNotification,
  subscribeToAllTicketsLive,
  subscribeToTicketMessagesLive,
  type LiveChatTicket,
  type LiveChatMessage,
  type ChatAttachment,
} from '@/lib/live-chat-service';
import {
  MessageSquare,
  Send,
  Headphones,
  CheckCircle2,
  Sparkles,
  Ticket,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  Radio,
  ExternalLink,
  PhoneCall,
  Search,
  Check,
  CheckCheck,
  Smartphone,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  X,
  Loader2,
  UserCheck,
} from 'lucide-react';

type SupportChannel = 'LIVE_CHAT' | 'WHATSAPP' | 'CALL' | 'FAQ';

export default function LiveSupportPage() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [guestVisitor, setGuestVisitor] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      setGuestVisitor(getOrCreateGuestVisitor());
    }
  }, [user]);

  const activeChatUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        country: user.country,
      }
    : guestVisitor
    ? {
        id: guestVisitor.id,
        name: guestVisitor.name,
        email: guestVisitor.email,
        avatarUrl: '',
        country: 'Website Visitor',
      }
    : null;

  useEffect(() => {
    if (!isLoading && user && pathname === '/support/live') {
      router.replace('/dashboard/support');
    }
  }, [user, isLoading, pathname, router]);

  const [activeChannel, setActiveChannel] = useState<SupportChannel>('LIVE_CHAT');

  // Live Chat States
  const [tickets, setTickets] = useState<LiveChatTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(true);

  // New Ticket Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDepartment, setNewDepartment] = useState('PURCHASE_PROOF');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newTrackingId, setNewTrackingId] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // WhatsApp States
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');

  // Phone Callback Form States
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTrackingId, setCallbackTrackingId] = useState('');
  const [callbackTime, setCallbackTime] = useState('IMMEDIATE');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  // FAQ Search State
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMsgCountRef = useRef<number>(0);
  const initializedMsgsRef = useRef<boolean>(false);

  const quickPrompts = [
    'Expedite my purchase verification OCR review',
    'What is the turnaround time for USDT TRC20 cashout?',
    'How do I activate the Diamond Whale 2.0x points multiplier?',
    'I have an issue with my Funding Pips account ID',
  ];

  // Subscribe to user's tickets in real-time (Fail-Safe)
  useEffect(() => {
    const identity =
      activeChatUser ||
      (() => {
        const g = getOrCreateGuestVisitor();
        return {
          id: g.id,
          name: g.name,
          email: g.email,
          avatarUrl: '',
          country: 'Website Visitor',
        };
      })();

    let unsubTickets: (() => void) | null = null;

    getOrCreateActiveUserTicket({
      id: identity.id,
      name: identity.name,
      email: identity.email,
      avatarUrl: identity.avatarUrl,
      country: identity.country,
    }).then((defaultTicket) => {
      setActiveTicketId((prev) => prev || defaultTicket.id);
      setWsConnected(true);

      unsubTickets = subscribeToAllTicketsLive((list) => {
        setWsConnected(true);
        setTickets(list);
        if (!activeTicketId && list.length > 0) {
          setActiveTicketId(list[0].id);
        }
      }, identity.id);
    });

    return () => {
      if (unsubTickets) unsubTickets();
    };
  }, [activeChatUser?.id]);

  // Subscribe to active ticket's messages in real-time (Fail-Safe)
  useEffect(() => {
    if (!activeTicketId) {
      setMessages([]);
      initializedMsgsRef.current = false;
      return;
    }

    const unsub = subscribeToTicketMessagesLive(
      activeTicketId,
      (list) => {
        if (initializedMsgsRef.current && list.length > prevMsgCountRef.current) {
          const newest = list[list.length - 1];
          if (newest && newest.senderRole !== 'USER' && newest.senderRole !== 'SYSTEM') {
            triggerDesktopChatNotification(
              `New reply from ${newest.senderName || 'Support Specialist'}`,
              newest.message || '📎 Sent an attachment'
            );
          }
        }

        prevMsgCountRef.current = list.length;
        initializedMsgsRef.current = true;
        setMessages(list);
        markTicketMessagesAsSeen(activeTicketId, 'USER');
        scrollToBottom();
      },
      false
    );

    return () => unsub();
  }, [activeTicketId]);

  const activeTicket = tickets.find((t) => t.id === activeTicketId) || null;
  const agentTyping =
    activeTicket?.typingAdmin && Date.now() - (activeTicket.typingAdmin.updatedAt || 0) < 8000
      ? `${activeTicket.typingAdmin.name} is typing...`
      : null;

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    if (activeTicketId && activeChatUser) {
      setLiveTypingStatus({
        ticketId: activeTicketId,
        userId: activeChatUser.id,
        userName: activeChatUser.name,
        userRole: 'USER',
        isTyping: val.trim().length > 0,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (activeTicketId && activeChatUser) {
          setLiveTypingStatus({
            ticketId: activeTicketId,
            userId: activeChatUser.id,
            userName: activeChatUser.name,
            userRole: 'USER',
            isTyping: false,
          });
        }
      }, 2500);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeTicketId) return;

    setUploadError(null);
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10 MB maximum limit. Please choose a file under 10 MB.');
      e.target.value = '';
      return;
    }

    try {
      setUploadProgress(5);
      const uploaded = await uploadChatAttachment(file, activeTicketId, (pct) => {
        setUploadProgress(pct);
      });
      setPendingAttachments((prev) => [...prev, uploaded]);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload attachment.');
    } finally {
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && pendingAttachments.length === 0) || !activeTicketId || !activeChatUser || isSending) return;

    const messageText = inputMessage.trim();
    const atts = [...pendingAttachments];
    setInputMessage('');
    setPendingAttachments([]);
    setUploadError(null);
    setIsSending(true);

    try {
      await sendLiveChatMessage({
        ticketId: activeTicketId,
        senderId: activeChatUser.id,
        senderName: activeChatUser.name,
        senderRole: 'USER',
        message: messageText,
        attachments: atts,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim() || !activeChatUser) return;

    setIsCreatingTicket(true);
    try {
      const subjectWithTracking = newTrackingId
        ? `[${newTrackingId.trim()}] ${newSubject.trim()}`
        : newSubject.trim();

      const created = await createNewLiveChatTicket(
        {
          id: activeChatUser.id,
          name: activeChatUser.name,
          email: activeChatUser.email,
          avatarUrl: activeChatUser.avatarUrl,
          country: activeChatUser.country,
        },
        {
          subject: subjectWithTracking,
          department: newDepartment,
          priority: newPriority,
          initialMessage: newInitialMsg.trim(),
        }
      );

      setNewModalOpen(false);
      setNewSubject('');
      setNewTrackingId('');
      setNewInitialMsg('');
      setActiveTicketId(created.id);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
    <div className="w-full text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full space-y-8">
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
                      No active inquiry tickets. Click &quot;Create Support Ticket&quot; above to start live chat.
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
                    <div className="p-4 border-b border-purple-100 dark:border-purple-900/40 bg-purple-50/30 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                            {activeTicket.ticketNumber}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {activeTicket.subject}
                          </h3>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>
                            Department: <strong className="uppercase">{activeTicket.department}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Assigned Specialist:{' '}
                            <strong className="text-emerald-600 dark:text-emerald-400">
                              {activeTicket.assignedTo?.name || 'Arjun Mehta'}
                            </strong>
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeTicket.assignedTo && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <UserCheck className="h-3 w-3" /> {activeTicket.assignedTo.name}
                          </span>
                        )}
                        <Badge variant="purple">{activeTicket.status}</Badge>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[440px] bg-slate-50/30 dark:bg-[#060814]">
                      {messages.map((msg) => {
                        const isMe = msg.senderRole === 'USER';
                        const isSystem = msg.senderRole === 'SYSTEM';

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="text-center my-2">
                              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {msg.message}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-[10px] font-bold text-slate-500">
                                {isMe ? 'You' : msg.senderName || activeTicket.assignedTo?.name || 'Support Desk'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div
                              className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs space-y-2 ${
                                isMe
                                  ? 'bg-purple-600 text-white rounded-br-xs'
                                  : 'bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 text-slate-900 dark:text-white rounded-bl-xs'
                              }`}
                            >
                              {msg.message && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}

                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="space-y-2 pt-1">
                                  {msg.attachments.map((att) => (
                                    <div
                                      key={att.id}
                                      className={`rounded-xl overflow-hidden border ${
                                        isMe
                                          ? 'border-white/20 bg-black/20'
                                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                                      }`}
                                    >
                                      {att.kind === 'image' ? (
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                                          <img
                                            src={att.url}
                                            alt={att.name}
                                            className="max-h-52 w-full object-cover hover:opacity-95"
                                          />
                                          <div className="px-2.5 py-1 text-[10px] flex items-center justify-between opacity-85">
                                            <span className="truncate max-w-[180px]">{att.name}</span>
                                            <span>{formatFileSize(att.size)}</span>
                                          </div>
                                        </a>
                                      ) : att.kind === 'video' ? (
                                        <div className="p-1.5 space-y-1">
                                          <video
                                            src={att.url}
                                            controls
                                            preload="metadata"
                                            className="max-h-52 w-full rounded-lg bg-black"
                                          />
                                          <div className="px-1.5 text-[10px] flex items-center justify-between opacity-85">
                                            <span className="truncate max-w-[180px]">{att.name}</span>
                                            <span>{formatFileSize(att.size)}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <a
                                          href={att.url}
                                          download={att.name}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-between gap-2.5 p-2.5 text-xs hover:underline"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="h-4 w-4 shrink-0" />
                                            <div className="min-w-0">
                                              <div className="font-semibold truncate">{att.name}</div>
                                              <div className="text-[10px] opacity-75">{formatFileSize(att.size)}</div>
                                            </div>
                                          </div>
                                          <Download className="h-4 w-4 shrink-0" />
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {isMe && (
                              <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px]">
                                {msg.status === 'SEEN' ? (
                                  <span className="flex items-center gap-0.5 text-emerald-500 font-bold">
                                    <CheckCheck className="h-3.5 w-3.5" /> Seen
                                  </span>
                                ) : msg.status === 'DELIVERED' ? (
                                  <span className="flex items-center gap-0.5 text-slate-400 font-medium">
                                    <CheckCheck className="h-3.5 w-3.5" /> Delivered
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-0.5 text-slate-400">
                                    <Check className="h-3 w-3" /> Sent
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {agentTyping && (
                        <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>{agentTyping}</span>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Pending Attachments Strip */}
                    {(pendingAttachments.length > 0 || uploadProgress !== null || uploadError) && (
                      <div className="px-4 py-2 border-t border-purple-100 dark:border-purple-900/40 bg-slate-50 dark:bg-slate-900/90 space-y-1.5">
                        {uploadError && (
                          <div className="text-[11px] text-rose-500 font-semibold flex items-center justify-between">
                            <span>{uploadError}</span>
                            <button onClick={() => setUploadError(null)} className="text-xs underline">
                              Dismiss
                            </button>
                          </div>
                        )}
                        {uploadProgress !== null && (
                          <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Uploading media ({uploadProgress}%)...</span>
                          </div>
                        )}
                        {pendingAttachments.length > 0 && (
                          <div className="flex items-center gap-2 overflow-x-auto py-1">
                            {pendingAttachments.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] shrink-0"
                              >
                                {att.kind === 'image' ? (
                                  <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                                ) : att.kind === 'video' ? (
                                  <Video className="h-3.5 w-3.5 text-purple-500" />
                                ) : (
                                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                                )}
                                <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingAttachments((prev) => prev.filter((p) => p.id !== att.id))
                                  }
                                  className="text-slate-400 hover:text-rose-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Input Box */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-3.5 border-t border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-950 flex items-center gap-2"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.zip"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadProgress !== null}
                        title="Attach Photo, Video, or File (Max 10 MB)"
                        className="p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-900 hover:text-purple-600 transition-colors cursor-pointer shrink-0"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>

                      <input
                        type="text"
                        placeholder="Type message or attach photo/video/PDF (up to 10 MB)..."
                        value={inputMessage}
                        onChange={handleInputChange}
                        className="flex-1 bg-purple-50/40 dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/40 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                      <Button
                        type="submit"
                        disabled={isSending || (!inputMessage.trim() && pendingAttachments.length === 0)}
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
          <div className="space-y-8 text-left w-full">
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
                      onChange={(e) => setNewPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')}
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
