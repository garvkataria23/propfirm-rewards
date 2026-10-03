'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import {
  DEFAULT_STAFF_TEAM,
  sendLiveChatMessage,
  setLiveTypingStatus,
  markTicketMessagesAsSeen,
  assignTicketStaff,
  updateTicketStatusLive,
  uploadChatAttachment,
  triggerDesktopChatNotification,
  onSnapshot,
  collection,
  query,
  orderBy,
  type LiveChatTicket,
  type LiveChatMessage,
  type ChatAttachment,
  type AssignedStaffInfo,
} from '@/lib/live-chat-service';
import {
  MessageSquare,
  Send,
  UserCheck,
  Search,
  RefreshCw,
  Lock,
  HelpCircle,
  FileText,
  Volume2,
  VolumeX,
  Paperclip,
  Image as ImageIcon,
  Video,
  Check,
  CheckCheck,
  Download,
  X,
  Loader2,
  Bell,
  Radio,
} from 'lucide-react';

export default function AdminSupportDeskPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<LiveChatTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [teamMembers] = useState<AssignedStaffInfo[]>(DEFAULT_STAFF_TEAM);
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filters
  const [filterTab, setFilterTab] = useState<'ALL' | 'MINE' | 'UNASSIGNED' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Chat Input & Attachment State
  const [inputMessage, setInputMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<{ title: string; body: string; ticketId: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevUnreadTotalRef = useRef<number>(0);
  const initializedTicketsRef = useRef<boolean>(false);

  const cannedResponses = [
    'Hello! I have reviewed your submission proof. The invoice details match our records.',
    'Your request is currently being escalated to our VIP billing desk. Expected turnaround: 2 hours.',
    'Thank you for contacting PropNation Support. Your ticket has been resolved!',
  ];

  // 1. Real-time Firestore WebSocket subscription to all support tickets
  useEffect(() => {
    const q = query(collection(db, 'supportTickets'), orderBy('lastMessageAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: LiveChatTicket[] = [];
        let totalUnread = 0;
        let newestTraderTicket: LiveChatTicket | null = null;

        snap.forEach((docSnap) => {
          const data = { id: docSnap.id, ...(docSnap.data() as Omit<LiveChatTicket, 'id'>) };
          list.push(data);
          totalUnread += data.unreadByAdmin || 0;
          if ((data.unreadByAdmin || 0) > 0 && !newestTraderTicket) {
            newestTraderTicket = data;
          }
        });

        // Notify Admin when a new message arrives from a trader
        if (initializedTicketsRef.current && totalUnread > prevUnreadTotalRef.current && newestTraderTicket) {
          const t = newestTraderTicket as LiveChatTicket;
          if (soundEnabled) {
            triggerDesktopChatNotification(
              `New Trader Message (${t.userName})`,
              t.lastMessagePreview || 'Sent a new message'
            );
          }
          setAdminToast({
            title: `New message from ${t.userName} (${t.ticketNumber})`,
            body: t.lastMessagePreview || 'Sent an attachment',
            ticketId: t.id,
          });
          setTimeout(() => setAdminToast(null), 6000);
        }

        prevUnreadTotalRef.current = totalUnread;
        initializedTicketsRef.current = true;
        setTickets(list);
        setIsLoading(false);

        if (!selectedTicketId && list.length > 0) {
          setSelectedTicketId(list[0].id);
        }
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, [selectedTicketId, soundEnabled]);

  // 2. Real-time Firestore WebSocket subscription to selected ticket's messages
  useEffect(() => {
    if (!selectedTicketId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'supportTickets', selectedTicketId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: LiveChatMessage[] = [];
      snap.forEach((d) => {
        list.push({ ...(d.data() as LiveChatMessage), id: d.id });
      });
      setMessages(list);
      markTicketMessagesAsSeen(selectedTicketId, 'ADMIN');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    });

    return () => unsub();
  }, [selectedTicketId]);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  // Check if trader is actively typing (within last 8 seconds)
  const isTraderTyping =
    activeTicket?.typingUser && Date.now() - (activeTicket.typingUser.updatedAt || 0) < 8000
      ? activeTicket.typingUser
      : null;

  const filteredTickets = tickets.filter((t) => {
    if (filterTab === 'MINE' && user) {
      const matchesMe =
        t.assignedToId === user.id ||
        t.assignedTo?.email?.toLowerCase() === user.email?.toLowerCase();
      if (!matchesMe) return false;
    } else if (filterTab === 'UNASSIGNED') {
      if (t.assignedToId) return false;
    } else if (filterTab === 'RESOLVED') {
      if (t.status !== 'RESOLVED' && t.status !== 'CLOSED') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.ticketNumber?.toLowerCase().includes(q) ||
        t.userName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    if (!selectedTicketId || !user) return;
    const senderName = activeTicket?.assignedTo?.name || user.name || 'Support Lead';

    setLiveTypingStatus({
      ticketId: selectedTicketId,
      userId: user.id,
      userName: senderName,
      userRole: user.role || 'ADMIN',
      isTyping: val.trim().length > 0,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setLiveTypingStatus({
        ticketId: selectedTicketId,
        userId: user.id,
        userName: senderName,
        userRole: user.role || 'ADMIN',
        isTyping: false,
      });
    }, 2500);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedTicketId) return;

    setUploadError(null);
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10 MB maximum limit. Please select a file under 10 MB.');
      e.target.value = '';
      return;
    }

    try {
      setUploadProgress(5);
      const uploaded = await uploadChatAttachment(file, selectedTicketId, (pct) => {
        setUploadProgress(pct);
      });
      setPendingAttachments((prev) => [...prev, uploaded]);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to attach file.');
    } finally {
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && pendingAttachments.length === 0) || !selectedTicketId || !user || isSending) {
      return;
    }

    const messageText = inputMessage.trim();
    const atts = [...pendingAttachments];
    const senderName = activeTicket?.assignedTo?.name || user.name || 'Support Specialist';

    setInputMessage('');
    setPendingAttachments([]);
    setUploadError(null);
    setIsSending(true);

    try {
      await sendLiveChatMessage({
        ticketId: selectedTicketId,
        senderId: user.id,
        senderName,
        senderRole: user.role || 'ADMIN',
        message: messageText,
        attachments: atts,
        isInternalNote,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
      setIsInternalNote(false);
    }
  };

  const handleAssignTicket = async (agentId: string) => {
    if (!selectedTicketId || !user) return;
    const found = teamMembers.find((tm) => tm.id === agentId) || null;
    await assignTicketStaff(selectedTicketId, found, user.name || 'Admin');
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicketId || !user) return;
    await updateTicketStatusLive(
      selectedTicketId,
      newStatus as LiveChatTicket['status'],
      user.name || 'Admin'
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-[10px]">Urgent</Badge>;
      case 'HIGH':
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px]">High</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-[10px]">Medium</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20 text-[10px]">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px]">Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 text-[10px]">In Progress</Badge>;
      case 'WAITING_TRADER':
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px]">Waiting Trader</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 text-[10px]">Resolved</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Admin Notification Banner */}
      {adminToast && (
        <div
          onClick={() => {
            setSelectedTicketId(adminToast.ticketId);
            setAdminToast(null);
          }}
          className="fixed top-5 right-5 z-[9999] max-w-sm cursor-pointer rounded-2xl border border-purple-500/40 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-in fade-in"
        >
          <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-400">
            <Bell className="h-4 w-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-purple-300 truncate">{adminToast.title}</div>
            <p className="text-xs text-slate-200 line-clamp-2 mt-0.5">{adminToast.body}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAdminToast(null);
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Support Desk &amp; Real-time Live Chat
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span>
              Live WebSocket stream active • Typing indicators, Delivered/Seen read receipts &amp; 10MB file/video sharing
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-xs gap-1.5"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-500" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
            {soundEnabled ? 'Sound Alerts On' : 'Muted'}
          </Button>
        </div>
      </div>

      {/* 3-Column Desk Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[750px]">
        {/* Column 1: Ticket Queue (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <Card className="p-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3 shadow-xs">
            {/* Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-semibold text-center">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  filterTab === 'ALL'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({tickets.length})
              </button>
              <button
                onClick={() => setFilterTab('MINE')}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  filterTab === 'MINE'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Assigned
              </button>
              <button
                onClick={() => setFilterTab('UNASSIGNED')}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  filterTab === 'UNASSIGNED'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Unassigned
              </button>
              <button
                onClick={() => setFilterTab('RESOLVED')}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  filterTab === 'RESOLVED'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Done
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, trader name or subject..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </Card>

          {/* Ticket List Scroll Container */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[660px] pr-1">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Connecting to live queue...</div>
            ) : filteredTickets.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
                <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active chats yet</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  When a trader opens the floating live chat or creates a ticket, it appears here instantly.
                </p>
              </Card>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicketId === t.id;
                const isTypingNow = t.typingUser && Date.now() - (t.typingUser.updatedAt || 0) < 8000;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">
                          {t.ticketNumber}
                        </span>
                        {(t.unreadByAdmin || 0) > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                            {t.unreadByAdmin} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(t.priority)}
                        {getStatusBadge(t.status)}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">
                      {t.subject}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">
                      {isTypingNow ? (
                        <span className="text-emerald-500 font-bold animate-pulse">
                          ✍️ {t.userName} is typing...
                        </span>
                      ) : (
                        t.lastMessagePreview || 'No messages yet'
                      )}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-850 pt-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {t.userName}
                      </span>
                      <span>
                        {t.assignedTo ? (
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">
                            👤 {t.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            ⚠️ Unassigned
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Live Chat & Reply Console (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="flex-1 flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs overflow-hidden">
            {activeTicket ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                        {activeTicket.ticketNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {activeTicket.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Trader: {activeTicket.userName}</span>
                      <span>•</span>
                      <span className="font-semibold uppercase tracking-wider">{activeTicket.department}</span>
                    </div>
                  </div>

                  {/* Actions: Assign Agent & Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={activeTicket.assignedToId || ''}
                      onChange={(e) => handleAssignTicket(e.target.value)}
                      className="text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((tm) => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name} ({tm.role.replace('_', ' ')})
                        </option>
                      ))}
                    </select>

                    <select
                      value={activeTicket.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING_TRADER">Waiting Trader</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[460px] max-h-[500px] bg-slate-50/20 dark:bg-black/10">
                  {messages.map((msg) => {
                    const isTrader = msg.senderRole === 'USER';
                    const isSystem = msg.senderRole === 'SYSTEM';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
                            {msg.message}
                          </span>
                        </div>
                      );
                    }

                    if (msg.isInternalNote) {
                      return (
                        <div
                          key={msg.id}
                          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs space-y-1 shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            <span className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              INTERNAL NOTE ({msg.senderName || 'Staff'})
                            </span>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed">{msg.message}</p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isTrader ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {isTrader ? activeTicket.userName : msg.senderName || 'Support Agent'}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs space-y-2 ${
                            isTrader
                              ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-xs'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs'
                          }`}
                        >
                          {msg.message && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-2 pt-1">
                              {msg.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className={`rounded-xl overflow-hidden border ${
                                    !isTrader
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

                        {/* Sent / Delivered / Seen Indicator for Admin messages */}
                        {!isTrader && (
                          <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px]">
                            {msg.status === 'SEEN' ? (
                              <span className="flex items-center gap-0.5 text-emerald-500 font-bold">
                                <CheckCheck className="h-3.5 w-3.5" /> Seen by Trader
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

                  {/* Typing Indicator */}
                  {isTraderTyping && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-500 font-semibold italic px-2 py-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      {isTraderTyping.name} is typing...
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Canned Quick Responses */}
                <div className="p-2 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                  <span className="font-semibold text-slate-400 shrink-0">Quick Replies:</span>
                  {cannedResponses.map((cr, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(cr)}
                      className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 truncate max-w-[200px] hover:border-purple-500 cursor-pointer"
                    >
                      {cr}
                    </button>
                  ))}
                </div>

                {/* Pending Attachments Strip */}
                {(pendingAttachments.length > 0 || uploadProgress !== null || uploadError) && (
                  <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-1.5">
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
                        <span>Uploading attachment ({uploadProgress}%)...</span>
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

                {/* Reply Form */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(false)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                          !isInternalNote
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Public Reply (To Trader)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(true)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                          isInternalNote
                            ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Lock className="h-3 w-3" />
                        Internal Staff Note
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400">Max 10 MB (Photo, Video, PDF)</span>
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
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
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-500 transition-colors cursor-pointer shrink-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>

                    <input
                      type="text"
                      value={inputMessage}
                      onChange={handleInputChange}
                      placeholder={
                        isInternalNote
                          ? 'Write internal note for staff team...'
                          : `Reply as ${activeTicket.assignedTo?.name || user?.name || 'Support'}...`
                      }
                      className={`flex-1 px-3 py-2 text-xs rounded-xl border transition-all focus:outline-none ${
                        isInternalNote
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/40 text-slate-900 dark:text-white placeholder:text-amber-700/50'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                      }`}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={(!inputMessage.trim() && pendingAttachments.length === 0) || isSending}
                      className={
                        isInternalNote
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <MessageSquare className="h-10 w-10 text-slate-400 mb-2 opacity-40" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select a conversation</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Pick a ticket from the left queue to start real-time assistance.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Column 3: Trader Profile & Assigned Agent Dossier (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {activeTicket ? (
            <>
              {/* Profile Card */}
              <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs space-y-3">
                <div className="text-center space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-850">
                  <div className="h-12 w-12 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-lg flex items-center justify-center mx-auto border border-purple-500/30">
                    {(activeTicket.userName || 'T').charAt(0)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeTicket.userName}</h3>
                  <p className="text-[10px] text-slate-500">{activeTicket.userEmail}</p>
                  <div className="flex justify-center gap-1.5 pt-1">
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[9px]">
                      Verified Trader
                    </Badge>
                    <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 text-[9px]">
                      {activeTicket.userCountry || 'Global'}
                    </Badge>
                  </div>
                </div>

                {/* Assigned Staff Details */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">
                      <span>Assigned Specialist</span>
                      <UserCheck className="h-3.5 w-3.5" />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {activeTicket.assignedTo?.name || 'Unassigned'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {activeTicket.assignedTo?.department || 'Select an agent from the header dropdown'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850">
                    <span className="text-[11px] text-slate-500">Read Receipts:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCheck className="h-3.5 w-3.5" /> Live Synced
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850">
                    <span className="text-[11px] text-slate-500">Media Limit:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                      Up to 10 MB
                    </span>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center text-xs text-slate-400">
              Select a conversation to see trader profile details and assigned specialist info.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
