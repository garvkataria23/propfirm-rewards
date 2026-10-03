'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import {
  getOrCreateActiveUserTicket,
  sendLiveChatMessage,
  setLiveTypingStatus,
  markTicketMessagesAsSeen,
  uploadChatAttachment,
  triggerDesktopChatNotification,
  onSnapshot,
  collection,
  doc,
  query,
  orderBy,
  type LiveChatTicket,
  type LiveChatMessage,
  type ChatAttachment,
} from '@/lib/live-chat-service';
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileText,
  Check,
  CheckCheck,
  Minimize2,
  Maximize2,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  Loader2,
  Download,
  UserCheck,
  Radio,
} from 'lucide-react';

export function FloatingLiveChat() {
  const { user } = useAuth();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [ticket, setTicket] = useState<LiveChatTicket | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // In-app toast notification state when new message arrives
  const [toastAlert, setToastAlert] = useState<{
    title: string;
    body: string;
    senderName?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMsgCountRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);

  // Listen for custom global notifications
  useEffect(() => {
    const handleToast = (e: any) => {
      if (e?.detail) {
        setToastAlert({
          title: e.detail.title,
          body: e.detail.body,
        });
        setTimeout(() => {
          setToastAlert(null);
        }, 5500);
      }
    };
    window.addEventListener('propnation-chat-notification', handleToast);
    return () => window.removeEventListener('propnation-chat-notification', handleToast);
  }, []);

  // Initialize user's live chat ticket & subscribe via Firestore real-time WebSocket stream
  useEffect(() => {
    if (!user) {
      setTicket(null);
      setMessages([]);
      initializedRef.current = false;
      return;
    }

    let unsubTicket: (() => void) | null = null;
    let unsubMessages: (() => void) | null = null;

    getOrCreateActiveUserTicket({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      country: user.country,
    }).then((activeTicket) => {
      setTicket(activeTicket);

      // 1. Real-time listener on ticket metadata (assigned agent, typing indicator, status, unread count)
      unsubTicket = onSnapshot(doc(db, 'supportTickets', activeTicket.id), (snap) => {
        if (snap.exists()) {
          setTicket({ id: snap.id, ...(snap.data() as Omit<LiveChatTicket, 'id'>) });
        }
      });

      // 2. Real-time listener on messages subcollection
      const msgsQuery = query(
        collection(db, 'supportTickets', activeTicket.id, 'messages'),
        orderBy('createdAt', 'asc')
      );
      unsubMessages = onSnapshot(msgsQuery, (snap) => {
        const list: LiveChatMessage[] = [];
        snap.forEach((d) => {
          const data = d.data() as LiveChatMessage;
          if (!data.isInternalNote) {
            list.push({ ...data, id: d.id });
          }
        });

        // Check if a new message arrived from Admin/Support Agent
        if (initializedRef.current && list.length > prevMsgCountRef.current) {
          const newest = list[list.length - 1];
          if (newest && newest.senderRole !== 'USER' && newest.senderRole !== 'SYSTEM') {
            if (soundEnabled) {
              triggerDesktopChatNotification(
                `New message from ${newest.senderName || 'PropNation Support'}`,
                newest.message || '📎 Sent an attachment'
              );
            }
          }
        }

        prevMsgCountRef.current = list.length;
        initializedRef.current = true;
        setMessages(list);
      });
    });

    return () => {
      if (unsubTicket) unsubTicket();
      if (unsubMessages) unsubMessages();
    };
  }, [user, soundEnabled]);

  // Whenever widget is open and messages change, mark admin messages as SEEN
  useEffect(() => {
    if (isOpen && ticket && messages.length > 0) {
      markTicketMessagesAsSeen(ticket.id, 'USER');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [isOpen, ticket?.id, messages.length]);

  // Do not show floating trader widget on /admin routes (Admin has its own live notification & desk)
  if (!user || pathname?.startsWith('/admin')) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (!ticket) return;
    setLiveTypingStatus({
      ticketId: ticket.id,
      userId: user.id,
      userName: user.name,
      userRole: 'USER',
      isTyping: val.trim().length > 0,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setLiveTypingStatus({
        ticketId: ticket.id,
        userId: user.id,
        userName: user.name,
        userRole: 'USER',
        isTyping: false,
      });
    }, 2500);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !ticket) return;

    setUploadError(null);
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10 MB maximum limit. Please select a file under 10 MB.');
      e.target.value = '';
      return;
    }

    try {
      setUploadProgress(5);
      const uploaded = await uploadChatAttachment(file, ticket.id, (pct) => {
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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && pendingAttachments.length === 0) || !ticket || isSending) return;

    const text = inputText.trim();
    const atts = [...pendingAttachments];
    setInputText('');
    setPendingAttachments([]);
    setUploadError(null);
    setIsSending(true);

    try {
      await sendLiveChatMessage({
        ticketId: ticket.id,
        senderId: user.id,
        senderName: user.name,
        senderRole: 'USER',
        message: text,
        attachments: atts,
      });
    } catch {
      setUploadError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Check if assigned admin is actively typing (within last 6 seconds)
  const isAdminTyping =
    ticket?.typingAdmin && Date.now() - (ticket.typingAdmin.updatedAt || 0) < 8000
      ? ticket.typingAdmin
      : null;

  const unreadCount = ticket?.unreadByUser || 0;
  const assignedStaff = ticket?.assignedTo;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <>
      {/* Real-time Incoming Message Toast Banner */}
      {toastAlert && !isOpen && (
        <div
          onClick={() => {
            setIsOpen(true);
            setToastAlert(null);
          }}
          className="fixed bottom-24 right-6 z-[9999] max-w-sm cursor-pointer rounded-2xl border border-emerald-500/40 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <Bell className="h-4 w-4 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-emerald-400 truncate">
                {toastAlert.title}
              </div>
              <p className="text-xs text-slate-200 line-clamp-2 mt-0.5">{toastAlert.body}</p>
              <span className="text-[10px] text-emerald-400/80 font-semibold mt-1 inline-block">
                Click to reply live &rarr;
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToastAlert(null);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setToastAlert(null);
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
              Notification.requestPermission().catch(() => {});
            }
          }}
          className="fixed bottom-6 right-6 z-[9998] group flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-3.5 sm:px-5 sm:py-3.5 text-white shadow-2xl shadow-emerald-600/30 hover:scale-105 hover:shadow-emerald-500/40 transition-all cursor-pointer border border-white/20"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-300 animate-ping" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-black tracking-tight flex items-center gap-1.5">
              Live Specialist Chat
              {assignedStaff && (
                <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.2 rounded-full">
                  {assignedStaff.name.split(' ')[0]}
                </span>
              )}
            </span>
            <span className="text-[10px] text-emerald-100 font-medium">
              {isAdminTyping ? `${isAdminTyping.name} is typing...` : 'Online • Instant Reply'}
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white shadow-md animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Live Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-[9999] flex flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080f20] shadow-2xl transition-all duration-200 ${
            isExpanded
              ? 'bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[540px] h-[82vh] max-h-[760px]'
              : 'bottom-5 right-5 w-[calc(100vw-2.5rem)] sm:w-[400px] h-[580px] max-h-[82vh]'
          }`}
        >
          {/* Top Header with Assigned Admin Info */}
          <div className="bg-gradient-to-r from-[#07132c] via-[#0c1f42] to-[#062420] p-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-sm shadow-md shrink-0">
                {assignedStaff ? assignedStaff.name.charAt(0) : 'P'}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#07132c]"
                  title="Online via WebSocket Stream"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black truncate">
                    {assignedStaff ? assignedStaff.name : 'PropNation Concierge'}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-bold text-emerald-300 shrink-0">
                    <UserCheck className="h-2.5 w-2.5" /> Assigned
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 truncate flex items-center gap-1.5">
                  <Radio className="h-2.5 w-2.5 text-emerald-400 animate-pulse shrink-0" />
                  {isAdminTyping ? (
                    <span className="text-emerald-300 font-bold animate-pulse">
                      {isAdminTyping.name} is typing...
                    </span>
                  ) : (
                    <span>{assignedStaff?.department || 'VIP Verification & Rewards Desk'}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Compact size' : 'Expand window'}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:inline-flex"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sub-bar showing Ticket # & 10MB Media Support */}
          <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {ticket?.ticketNumber || 'LIVE-STREAM'}
            </span>
            <span>Photos, Videos &amp; Files up to 10 MB • Read Receipts Active</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 dark:bg-[#060b18]">
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
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {isMe ? 'You' : msg.senderName || assignedStaff?.name || 'Support Specialist'}
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
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs space-y-2 ${
                      isMe
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    {msg.message && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}

                    {/* Render Attachments (Photo, Video, Document) */}
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
                                  className="max-h-48 w-full object-cover hover:opacity-95 transition-opacity"
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
                                  className="max-h-48 w-full rounded-lg bg-black"
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

                  {/* Delivery / Read Seen Status Indicator for Sender */}
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

            {/* Live Typing Bubble from Assigned Admin */}
            {isAdminTyping && (
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-2xl shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 ml-1.5">
                    {isAdminTyping.name} is typing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Pending Attachments Preview Strip */}
          {(pendingAttachments.length > 0 || uploadProgress !== null || uploadError) && (
            <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-1.5 shrink-0">
              {uploadError && (
                <div className="text-[11px] text-rose-500 font-semibold flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button onClick={() => setUploadError(null)} className="text-xs underline">
                    Dismiss
                  </button>
                </div>
              )}

              {uploadProgress !== null && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
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
                      <span className="truncate max-w-[120px] font-medium">{att.name}</span>
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

          {/* Input Bar with File/Photo/Video Upload (up to 10MB) */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080f20] flex items-center gap-2 shrink-0"
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
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={`Message ${assignedStaff ? assignedStaff.name.split(' ')[0] : 'Support'}...`}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && pendingAttachments.length === 0)}
              className="h-9 w-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
