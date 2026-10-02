'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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

export default function LiveSupportPage() {
  const { user } = useAuth();
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
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const quickPrompts = [
    'Expedite my purchase verification OCR review',
    'What is the turnaround time for USDT TRC20 cashout?',
    'How do I activate the Diamond Whale 2.0x points multiplier?',
    'I have an issue with my Funding Pips account ID',
  ];

  // Play a gentle notification sound
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  // Fetch Trader Tickets
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

  // Fetch Active Ticket details & chat history
  useEffect(() => {
    if (!activeTicketId) return;

    api.get<SupportTicket>(`/support/tickets/${activeTicketId}`)
      .then((res) => {
        setActiveTicket(res);
        scrollToBottom();
      })
      .catch((err) => console.error('Error loading ticket details:', err));
  }, [activeTicketId]);

  // Connect WebSocket
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

    // Handle new message
    socket.on('new_message', (data: { ticketId: string; message: ChatMessage; ticket: any }) => {
      if (data.message.isInternalNote) return; // Hide internal staff notes from trader!

      setActiveTicket((prev) => {
        if (!prev || prev.id !== data.ticketId) return prev;
        const exists = prev.messages?.some((m) => m.id === data.message.id);
        if (exists) return prev;

        // Play chime if message came from support agent
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

    // Handle typing events from staff
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

    // Handle agent assignment
    socket.on('ticket_assigned', (data: { ticketId: string; assignedTo: any; status: any }) => {
      setActiveTicket((prev) => (prev?.id === data.ticketId ? { ...prev, assignedTo: data.assignedTo, status: data.status } : prev));
    });

    // Handle status update
    socket.on('status_updated', (data: { ticketId: string; status: any }) => {
      setActiveTicket((prev) => (prev?.id === data.ticketId ? { ...prev, status: data.status } : prev));
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeTicketId]);

  // Join ticket room
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

  // Handle typing broadcast
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

  // Send message
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

  // Create new ticket
  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim()) return;

    setIsCreatingTicket(true);
    try {
      const created = await api.post<SupportTicket>('/support/tickets', {
        subject: newSubject.trim(),
        message: newInitialMsg.trim(),
        department: newDepartment,
        priority: newPriority,
      });

      setNewModalOpen(false);
      setNewSubject('');
      setNewInitialMsg('');
      await fetchMyTickets();
      setActiveTicketId(created.id);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070a12] dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/10 to-transparent border border-purple-500/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <Radio className={`h-3 w-3 ${wsConnected ? 'animate-pulse text-emerald-500' : 'text-slate-400'}`} />
                {wsConnected ? 'WebSocket Live Connected' : 'Connecting to Desk...'}
              </span>
              <span className="text-xs text-slate-500">Avg reply time: <strong>&lt; 2 minutes</strong></span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Headphones className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              24/7 Priority Live Support Desk
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Real-time WebSocket chat directly with dedicated verification officers and VIP concierge leads.
            </p>
          </div>

          <Button
            onClick={() => setNewModalOpen(true)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2 font-bold cursor-pointer shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            Open New Inquiry Ticket
          </Button>
        </div>

        {/* Support Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
          {/* Left: Active Tickets Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  My Support Tickets ({tickets.length})
                </h3>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {tickets.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No active tickets. Click "Open New Inquiry Ticket" above to start live chat.
                  </div>
                ) : (
                  tickets.map((t) => {
                    const isSelected = activeTicketId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setActiveTicketId(t.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">
                            {t.ticketNumber}
                          </span>
                          <Badge className="text-[9px]">{t.status}</Badge>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {t.subject}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                          <span className="uppercase tracking-wider font-semibold">{t.department}</span>
                          <span>
                            {t.assignedTo ? (
                              <span className="text-purple-600 dark:text-purple-400 font-medium">
                                Agent: {t.assignedTo.name}
                              </span>
                            ) : (
                              'Queueing...'
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
            <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Suggested Inquiries
              </h4>
              <div className="space-y-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(prompt)}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Live Chat Window (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <Card className="flex-1 flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs overflow-hidden">
              {activeTicket ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
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
                        <strong className="uppercase">{activeTicket.priority}</strong>
                      </p>
                    </div>

                    {/* Assigned Agent Badge */}
                    <div className="text-right">
                      {activeTicket.assignedTo ? (
                        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
                          <div className="h-7 w-7 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center">
                            {activeTicket.assignedTo.name.charAt(0)}
                          </div>
                          <div className="text-left text-[11px]">
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {activeTicket.assignedTo.name}
                            </p>
                            <p className="text-[9px] text-purple-600 dark:text-purple-400 uppercase font-semibold">
                              {activeTicket.assignedTo.role.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-[10px]">
                          Pending Staff Assignment
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-[460px] max-h-[520px] bg-slate-50/20 dark:bg-black/10">
                    {activeTicket.messages?.map((msg) => {
                      const isMe = msg.senderRole === 'USER';
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

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {isMe ? 'You' : msg.sender?.name || 'Support Agent'}
                            </span>
                            <span>•</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs'
                                : 'bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-xs'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}

                    {/* Agent Live Typing Indicator */}
                    {agentTyping && (
                      <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 italic px-2 py-1">
                        <div className="flex space-x-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" />
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-100" />
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-200" />
                        </div>
                        <span>{agentTyping}</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={handleInputChange}
                      placeholder="Type your message to support..."
                      className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || isSending}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-5 text-xs font-bold gap-2 cursor-pointer shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Headphones className="h-12 w-12 text-slate-400 mb-2 opacity-40" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Welcome to Live Support</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Select an inquiry from the left or create a new ticket to chat with a dedicated support lead.
                  </p>
                  <Button
                    onClick={() => setNewModalOpen(true)}
                    size="sm"
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-xs cursor-pointer"
                  >
                    Start a New Ticket
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Open Live Support Inquiry
              </h3>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">
                  Subject / Summary:
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Funding Pips 100K challenge purchase proof verification"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1">
                    Department:
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="PURCHASE_PROOF">Purchase Proof & OCR</option>
                    <option value="CASHOUT_PAYOUT">Cashouts & Payouts</option>
                    <option value="ACCOUNT_VERIFICATION">KYC & Account</option>
                    <option value="VIP">VIP Concierge Desk</option>
                    <option value="GENERAL">General Inquiries</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-1">
                    Priority:
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent Challenge)</option>
                    <option value="URGENT">Urgent (VIP Trader)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 dark:text-white block mb-1">
                  Initial Message / Inquiry Details:
                </label>
                <textarea
                  required
                  rows={4}
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
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
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {isCreatingTicket ? 'Submitting...' : 'Connect to Live Desk'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
