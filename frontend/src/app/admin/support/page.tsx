'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare,
  Send,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  FileText,
  User,
  ExternalLink,
  Volume2,
} from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatarUrl?: string;
}

interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: string;
  message: string;
  isInternalNote: boolean;
  attachments?: string;
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
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    country?: string;
    createdAt?: string;
    pointsLedger?: { balanceAfter: number }[];
    submissions?: { id: string; submissionCode: string; status: string; purchaseAmountUsd: number }[];
  };
  assignedTo?: StaffUser | null;
  messages?: ChatMessage[];
  _count?: { messages: number };
}

export default function AdminSupportDeskPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [teamMembers, setTeamMembers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filterTab, setFilterTab] = useState<'ALL' | 'MINE' | 'UNASSIGNED' | 'RESOLVED'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Chat Input & State
  const [inputMessage, setInputMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [traderTyping, setTraderTyping] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Canned Responses
  const cannedResponses = [
    'Hello! I have reviewed your submission proof. The invoice details match our records.',
    'Your request is currently being escalated to our VIP billing desk. Expected turnaround: 2 hours.',
    'Thank you for contacting PropNation Support. Your ticket has been resolved!',
  ];

  // Load team members
  useEffect(() => {
    api.get<StaffUser[]>('/support/admin/team')
      .then((res) => setTeamMembers(res || []))
      .catch((err) => console.error('Failed to load team members:', err));
  }, []);

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      setIsRefreshing(true);
      const query: any = {};
      if (statusFilter !== 'ALL') query.status = statusFilter;
      if (deptFilter !== 'ALL') query.department = deptFilter;
      if (searchQuery.trim()) query.search = searchQuery.trim();

      if (filterTab === 'MINE' && user?.id) {
        query.assignedToId = user.id;
      } else if (filterTab === 'UNASSIGNED') {
        query.unassigned = 'true';
      } else if (filterTab === 'RESOLVED') {
        query.status = 'RESOLVED';
      }

      const res = await api.get<SupportTicket[]>('/support/admin/tickets', query);
      setTickets(res || []);
      if (!selectedTicketId && res && res.length > 0) {
        setSelectedTicketId(res[0].id);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterTab, statusFilter, deptFilter, searchQuery]);

  // Load Active Ticket Details
  useEffect(() => {
    if (!selectedTicketId) return;

    api.get<SupportTicket>(`/support/tickets/${selectedTicketId}`)
      .then((res) => {
        setActiveTicket(res);
        scrollToBottom();
      })
      .catch((err) => console.error('Error loading ticket details:', err));
  }, [selectedTicketId]);

  // WebSocket Connection
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (user) {
        socket.emit('authenticate', {
          userId: user.id,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        });
      }
    });

    // Handle new message
    socket.on('new_message', (data: { ticketId: string; message: ChatMessage; ticket: any }) => {
      // Update active ticket if matches
      setActiveTicket((prev) => {
        if (!prev || prev.id !== data.ticketId) return prev;
        const exists = prev.messages?.some((m) => m.id === data.message.id);
        if (exists) return prev;
        return {
          ...prev,
          status: data.ticket.status,
          lastMessageAt: data.ticket.lastMessageAt,
          messages: [...(prev.messages || []), data.message],
        };
      });

      // Update tickets list counter/status
      setTickets((prev) =>
        prev.map((t) =>
          t.id === data.ticketId
            ? { ...t, status: data.ticket.status, lastMessageAt: data.ticket.lastMessageAt }
            : t
        )
      );

      scrollToBottom();
    });

    // Handle typing events
    socket.on('user_typing', (data: { ticketId: string; user: { id: string; name: string }; isTyping: boolean }) => {
      if (data.ticketId === selectedTicketId && data.user.id !== user?.id) {
        if (data.isTyping) {
          setTraderTyping(`${data.user.name} is typing...`);
        } else {
          setTraderTyping(null);
        }
      }
    });

    // Handle ticket assigned
    socket.on('ticket_assigned', (data: { ticketId: string; assignedTo: any; status: any }) => {
      setActiveTicket((prev) => (prev?.id === data.ticketId ? { ...prev, assignedTo: data.assignedTo, status: data.status } : prev));
      setTickets((prev) =>
        prev.map((t) => (t.id === data.ticketId ? { ...t, assignedTo: data.assignedTo, status: data.status } : t))
      );
    });

    // Handle status update
    socket.on('status_updated', (data: { ticketId: string; status: any }) => {
      setActiveTicket((prev) => (prev?.id === data.ticketId ? { ...prev, status: data.status } : prev));
      setTickets((prev) => prev.map((t) => (t.id === data.ticketId ? { ...t, status: data.status } : t)));
    });

    return () => {
      socket.disconnect();
    };
  }, [user, selectedTicketId]);

  // Join ticket room when selected
  useEffect(() => {
    if (!socketRef.current || !selectedTicketId || !user) return;

    socketRef.current.emit('join_ticket', {
      ticketId: selectedTicketId,
      user: { id: user.id, name: user.name, role: user.role },
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_ticket', {
          ticketId: selectedTicketId,
          user: { id: user.id, name: user.name },
        });
      }
    };
  }, [selectedTicketId, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle Input Typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    if (socketRef.current && selectedTicketId && user) {
      socketRef.current.emit('typing_start', {
        ticketId: selectedTicketId,
        user: { id: user.id, name: user.name, role: user.role },
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && selectedTicketId && user) {
          socketRef.current.emit('typing_stop', {
            ticketId: selectedTicketId,
            user: { id: user.id, name: user.name },
          });
        }
      }, 2500);
    }
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !selectedTicketId || !user || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', {
          ticketId: selectedTicketId,
          message: messageText,
          senderId: user.id,
          senderRole: user.role,
          isInternalNote: isInternalNote,
        });
      } else {
        // Fallback to REST
        await api.post(`/support/tickets/${selectedTicketId}/messages`, {
          message: messageText,
          isInternalNote: isInternalNote,
        });
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
      setIsInternalNote(false);
    }
  };

  // Assign Ticket
  const handleAssignTicket = async (agentId: string) => {
    if (!selectedTicketId || !user) return;
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('assign_ticket', {
          ticketId: selectedTicketId,
          assignedToId: agentId || null,
          adminUser: { id: user.id, name: user.name },
        });
      } else {
        await api.patch(`/support/admin/tickets/${selectedTicketId}/assign`, {
          assignedToId: agentId || null,
        });
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to assign ticket:', err);
    }
  };

  // Update Status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicketId || !user) return;
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('update_status', {
          ticketId: selectedTicketId,
          status: newStatus,
          adminUser: { id: user.id, name: user.name },
        });
      } else {
        await api.patch(`/support/admin/tickets/${selectedTicketId}/status`, {
          status: newStatus,
        });
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Support Desk & Real-time Live Chat
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            WebSocket live bidirectional conversations, instant agent reassignment, and internal staff notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchTickets}
            disabled={isRefreshing}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Queue
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
                All
              </button>
              <button
                onClick={() => setFilterTab('MINE')}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  filterTab === 'MINE'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Mine
              </button>
              <button
                onClick={() => setFilterTab('UNASSIGNED')}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  filterTab === 'UNASSIGNED'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Open
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
              <div className="p-8 text-center text-xs text-slate-500">Loading queue...</div>
            ) : tickets.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
                <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No tickets found</p>
                <p className="text-[10px] text-slate-500 mt-1">Queue is clear or no matches for your current filter.</p>
              </Card>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicketId === t.id;
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
                      <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        {t.ticketNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(t.priority)}
                        {getStatusBadge(t.status)}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">
                      {t.subject}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">
                      {t.messages?.[0]?.message || 'No messages yet'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-850 pt-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {t.user?.name}
                      </span>
                      <span>
                        {t.assignedTo ? (
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
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
                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                        {activeTicket.ticketNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {activeTicket.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Trader: {activeTicket.user.name}</span>
                      <span>•</span>
                      <span className="font-semibold uppercase tracking-wider">{activeTicket.department}</span>
                    </div>
                  </div>

                  {/* Actions: Assign Agent & Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={activeTicket.assignedToId || ''}
                      onChange={(e) => handleAssignTicket(e.target.value)}
                      className="text-[11px] font-semibold bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
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
                      className="text-[11px] font-semibold bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
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
                  {activeTicket.messages?.map((msg) => {
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
                              INTERNAL NOTE ({msg.sender?.name || 'Staff'})
                            </span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                            {isTrader ? activeTicket.user.name : msg.sender?.name || 'Support Agent'}
                          </span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                            isTrader
                              ? 'bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-xs'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {traderTyping && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 italic px-2 py-1">
                      <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                      {traderTyping}
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
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={handleInputChange}
                      placeholder={isInternalNote ? 'Write internal note for staff team...' : 'Type message to trader...'}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl border transition-all focus:outline-none ${
                        isInternalNote
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/40 text-slate-900 dark:text-white placeholder:text-amber-700/50'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                      }`}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!inputMessage.trim() || isSending}
                      className={isInternalNote ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}
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
                <p className="text-[10px] text-slate-500 mt-1">Pick a ticket from the left queue to start real-time assistance.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Column 3: Trader Profile Dossier (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {activeTicket ? (
            <>
              {/* Profile Card */}
              <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs space-y-3">
                <div className="text-center space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-850">
                  <div className="h-12 w-12 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-lg flex items-center justify-center mx-auto border border-purple-500/30">
                    {activeTicket.user.name.charAt(0)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeTicket.user.name}</h3>
                  <p className="text-[10px] text-slate-500">{activeTicket.user.email}</p>
                  <div className="flex justify-center gap-1.5 pt-1">
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[9px]">
                      Verified Trader
                    </Badge>
                    <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 text-[9px]">
                      {activeTicket.user.country || 'Global'}
                    </Badge>
                  </div>
                </div>

                {/* Account Metrics */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850">
                    <span className="text-[11px] text-slate-500">Active Balance:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {(activeTicket.user.pointsLedger?.[0]?.balanceAfter || 13000).toLocaleString()} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850">
                    <span className="text-[11px] text-slate-500">USD Valuation:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${(((activeTicket.user.pointsLedger?.[0]?.balanceAfter || 13000) * 0.01).toFixed(2))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850">
                    <span className="text-[11px] text-slate-500">Assigned Agent:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {activeTicket.assignedTo?.name || 'None'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Recent Proof Submissions */}
              <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Submissions
                </h4>
                {activeTicket.user.submissions && activeTicket.user.submissions.length > 0 ? (
                  <div className="space-y-2">
                    {activeTicket.user.submissions.map((s) => (
                      <div
                        key={s.id}
                        className="p-2 rounded-lg border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                            {s.submissionCode}
                          </span>
                          <span className="text-[10px] text-slate-500">${s.purchaseAmountUsd}</span>
                        </div>
                        <Badge className="text-[9px]">{s.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">No submissions on file.</p>
                )}
              </Card>
            </>
          ) : (
            <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center text-xs text-slate-400">
              Select a conversation to see trader profile details and submission history.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
