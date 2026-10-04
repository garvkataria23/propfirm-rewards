'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import {
  DEFAULT_STAFF_TEAM,
  getOrCreateActiveUserTicket,
  getOrCreateGuestVisitor,
  updateGuestVisitorIdentity,
  sendLiveChatMessage,
  setLiveTypingStatus,
  markTicketMessagesAsSeen,
  assignTicketStaff,
  updateTicketStatusLive,
  uploadChatAttachment,
  triggerDesktopChatNotification,
  subscribeToTicketLive,
  subscribeToTicketMessagesLive,
  subscribeToAllTicketsLive,
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
  Volume2,
  VolumeX,
  Bell,
  Loader2,
  Download,
  UserCheck,
  Radio,
  ShieldCheck,
  Users,
  Search,
  ChevronLeft,
  Lock,
  ExternalLink,
  Sparkles,
  UserCircle2,
  Smartphone,
} from 'lucide-react';

const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'];

const VISITOR_QUICK_QUESTIONS = [
  'How do I claim 10x points using code NATION?',
  'I want to verify my prop firm purchase receipt',
  'Which prop firm has the highest discount right now?',
  'How fast are USDT & physical reward payouts?',
];

const ADMIN_CANNED_REPLIES = [
  'Hello! I am online now. Please share your order receipt or tracking ID so I can verify it immediately.',
  'Your purchase proof has been verified and reward points have been credited to your wallet!',
  'Use partner promo code NATION at checkout on any participating prop firm to unlock 10x reward points.',
  'Your request has been escalated to our VIP Payout Desk. Expected completion: under 2 hours.',
];

export function FloatingLiveChat() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isOnAdminRoute = Boolean(pathname?.startsWith('/admin'));
  const isStaffUser = Boolean(user && STAFF_ROLES.includes(user.role));

  // Widget open/expand/sound states
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mode: 'ADMIN' (multi-ticket live support console) or 'USER' (visitor/trader live chat)
  const [widgetMode, setWidgetMode] = useState<'USER' | 'ADMIN'>('USER');

  // Automatically default to ADMIN console when on /admin routes or when staff logs in on /admin
  useEffect(() => {
    if (isOnAdminRoute && isStaffUser) {
      setWidgetMode('ADMIN');
    } else if (!isStaffUser) {
      setWidgetMode('USER');
    }
  }, [isOnAdminRoute, isStaffUser]);

  // Listen for custom global open event (e.g. from Navbar or Hero buttons)
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e?.detail?.mode && isStaffUser) {
        setWidgetMode(e.detail.mode);
      }
    };
    window.addEventListener('propnation-open-live-chat', handleOpenChat);
    return () => window.removeEventListener('propnation-open-live-chat', handleOpenChat);
  }, [isStaffUser]);

  // ============================================================================
  // 1. VISITOR / TRADER STATE (Works for both Logged-in Traders & Website Guests)
  // ============================================================================
  const [guestProfile, setGuestProfile] = useState<{
    id: string;
    name: string;
    email: string;
    isGuest: boolean;
  } | null>(null);
  const [showGuestIdentityForm, setShowGuestIdentityForm] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [guestEmailInput, setGuestEmailInput] = useState('');
  const [guestIdentitySaved, setGuestIdentitySaved] = useState(false);

  const [userTicket, setUserTicket] = useState<LiveChatTicket | null>(null);
  const [userMessages, setUserMessages] = useState<LiveChatMessage[]>([]);
  const [userInputText, setUserInputText] = useState('');
  const [userPendingAttachments, setUserPendingAttachments] = useState<ChatAttachment[]>([]);

  // ============================================================================
  // 2. ADMIN FLOATING CONSOLE STATE (All Active Tickets & Real-Time Replies)
  // ============================================================================
  const [adminTickets, setAdminTickets] = useState<LiveChatTicket[]>([]);
  const [selectedAdminTicketId, setSelectedAdminTicketId] = useState<string | null>(null);
  const [adminViewStep, setAdminViewStep] = useState<'LIST' | 'CHAT'>('LIST');
  const [adminFilter, setAdminFilter] = useState<'ALL' | 'UNREAD' | 'GUESTS'>('ALL');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminMessages, setAdminMessages] = useState<LiveChatMessage[]>([]);
  const [adminInputText, setAdminInputText] = useState('');
  const [adminInternalNote, setAdminInternalNote] = useState(false);
  const [adminPendingAttachments, setAdminPendingAttachments] = useState<ChatAttachment[]>([]);

  // Shared upload / send / notification state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [toastAlert, setToastAlert] = useState<{
    title: string;
    body: string;
    ticketId?: string;
    forAdmin?: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevUserMsgCountRef = useRef<number>(0);
  const initializedUserRef = useRef<boolean>(false);
  const prevAdminUnreadRef = useRef<number>(0);
  const initializedAdminRef = useRef<boolean>(false);

  // Initialize Guest Visitor profile on mount if not logged in
  useEffect(() => {
    if (!user) {
      const guest = getOrCreateGuestVisitor();
      setGuestProfile(guest);
      setGuestNameInput(guest.name.startsWith('Visitor #') ? '' : guest.name);
      setGuestEmailInput(guest.email.endsWith('@guest.propnation.app') ? '' : guest.email);
    } else {
      setGuestProfile(null);
    }
  }, [user]);

  // Active identity for USER mode (either logged-in user or persistent website guest)
  const activeTraderIdentity = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        country: user.country,
        isGuest: false,
      }
    : guestProfile
    ? {
        id: guestProfile.id,
        name: guestProfile.name,
        email: guestProfile.email,
        avatarUrl: '',
        country: 'Website Visitor',
        isGuest: true,
      }
    : null;

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

  // ============================================================================
  // SUBSCRIBE TO USER / WEBSITE VISITOR TICKET & MESSAGES (FAIL-SAFE)
  // ============================================================================
  useEffect(() => {
    const identity =
      activeTraderIdentity ||
      (() => {
        const g = getOrCreateGuestVisitor();
        return {
          id: g.id,
          name: g.name,
          email: g.email,
          avatarUrl: '',
          country: 'Website Visitor',
          isGuest: true,
        };
      })();

    let unsubTicket: (() => void) | null = null;
    let unsubMessages: (() => void) | null = null;

    getOrCreateActiveUserTicket({
      id: identity.id,
      name: identity.name,
      email: identity.email,
      avatarUrl: identity.avatarUrl,
      country: identity.country,
    }).then((activeTicket) => {
      setUserTicket(activeTicket);

      unsubTicket = subscribeToTicketLive(activeTicket.id, (updatedTicket) => {
        setUserTicket(updatedTicket);
      });

      unsubMessages = subscribeToTicketMessagesLive(
        activeTicket.id,
        (list) => {
          if (initializedUserRef.current && list.length > prevUserMsgCountRef.current) {
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

          prevUserMsgCountRef.current = list.length;
          initializedUserRef.current = true;
          setUserMessages(list);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        },
        false
      );
    });

    return () => {
      if (unsubTicket) unsubTicket();
      if (unsubMessages) unsubMessages();
    };
  }, [activeTraderIdentity?.id, soundEnabled]);

  // Mark user messages as SEEN when user chat is open
  useEffect(() => {
    if (isOpen && widgetMode === 'USER' && userTicket && userMessages.length > 0) {
      markTicketMessagesAsSeen(userTicket.id, 'USER');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [isOpen, widgetMode, userTicket?.id, userMessages.length]);

  // ============================================================================
  // SUBSCRIBE TO ADMIN ALL TICKETS QUEUE & SELECTED CONVERSATION (FAIL-SAFE)
  // ============================================================================
  useEffect(() => {
    if (!isStaffUser) {
      setAdminTickets([]);
      return;
    }

    const unsub = subscribeToAllTicketsLive((list) => {
      let totalUnread = 0;
      let newestUnreadTicket: LiveChatTicket | null = null;

      list.forEach((data) => {
        totalUnread += data.unreadByAdmin || 0;
        if ((data.unreadByAdmin || 0) > 0 && !newestUnreadTicket) {
          newestUnreadTicket = data;
        }
      });

      if (
        initializedAdminRef.current &&
        totalUnread > prevAdminUnreadRef.current &&
        newestUnreadTicket
      ) {
        const t = newestUnreadTicket as LiveChatTicket;
        if (soundEnabled) {
          triggerDesktopChatNotification(
            `Live Support: ${t.userName}`,
            t.lastMessagePreview || 'Sent a new message'
          );
        }
        setToastAlert({
          title: `New message from ${t.userName} (${t.ticketNumber})`,
          body: t.lastMessagePreview || '📎 Sent an attachment',
          ticketId: t.id,
          forAdmin: true,
        });
        setTimeout(() => setToastAlert(null), 6000);
      }

      prevAdminUnreadRef.current = totalUnread;
      initializedAdminRef.current = true;
      setAdminTickets(list);

      if (!selectedAdminTicketId && list.length > 0) {
        setSelectedAdminTicketId(list[0].id);
      }
    });

    return () => unsub();
  }, [isStaffUser, selectedAdminTicketId, soundEnabled]);

  // Subscribe to selected Admin ticket's messages
  useEffect(() => {
    if (!isStaffUser || !selectedAdminTicketId) {
      setAdminMessages([]);
      return;
    }

    const unsub = subscribeToTicketMessagesLive(
      selectedAdminTicketId,
      (list) => {
        setAdminMessages(list);
        if (isOpen && widgetMode === 'ADMIN' && (adminViewStep === 'CHAT' || isExpanded)) {
          markTicketMessagesAsSeen(selectedAdminTicketId, 'ADMIN');
        }
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      },
      true
    );

    return () => unsub();
  }, [isStaffUser, selectedAdminTicketId, isOpen, widgetMode, adminViewStep, isExpanded]);

  // ============================================================================
  // HANDLERS FOR USER / GUEST VISITOR MODE
  // ============================================================================
  const handleSaveGuestIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTicket || !guestNameInput.trim()) return;
    const cleanName = guestNameInput.trim();
    const cleanEmail = guestEmailInput.trim() || guestProfile?.email || 'visitor@propnation.app';
    await updateGuestVisitorIdentity(userTicket.id, cleanName, cleanEmail);
    setGuestProfile((prev) =>
      prev ? { ...prev, name: cleanName, email: cleanEmail } : null
    );
    setGuestIdentitySaved(true);
    setShowGuestIdentityForm(false);
    setTimeout(() => setGuestIdentitySaved(false), 3000);
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInputText(val);

    if (!userTicket || !activeTraderIdentity) return;
    setLiveTypingStatus({
      ticketId: userTicket.id,
      userId: activeTraderIdentity.id,
      userName: activeTraderIdentity.name,
      userRole: 'USER',
      isTyping: val.trim().length > 0,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setLiveTypingStatus({
        ticketId: userTicket.id,
        userId: activeTraderIdentity.id,
        userName: activeTraderIdentity.name,
        userRole: 'USER',
        isTyping: false,
      });
    }, 2500);
  };

  const handleUserSend = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const text = (overrideText !== undefined ? overrideText : userInputText).trim();
    if ((!text && userPendingAttachments.length === 0) || isSending) {
      return;
    }

    const atts = [...userPendingAttachments];
    if (overrideText === undefined) setUserInputText('');
    setUserPendingAttachments([]);
    setUploadError(null);
    setIsSending(true);

    try {
      const identity =
        activeTraderIdentity ||
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

      const activeTkt =
        userTicket ||
        (await getOrCreateActiveUserTicket({
          id: identity.id,
          name: identity.name,
          email: identity.email,
          avatarUrl: identity.avatarUrl,
          country: identity.country,
        }));

      if (!userTicket) {
        setUserTicket(activeTkt);
      }

      await sendLiveChatMessage({
        ticketId: activeTkt.id,
        senderId: identity.id,
        senderName: identity.name,
        senderRole: 'USER',
        message: text,
        attachments: atts,
      });
    } catch {
      // Never show an error — sendLiveChatMessage is fail-safe
    } finally {
      setIsSending(false);
    }
  };

  // ============================================================================
  // HANDLERS FOR ADMIN FLOATING CONSOLE MODE
  // ============================================================================
  const activeAdminTicket = adminTickets.find((t) => t.id === selectedAdminTicketId) || null;

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAdminInputText(val);

    if (!selectedAdminTicketId || !user) return;
    const senderName = activeAdminTicket?.assignedTo?.name || user.name || 'Support Lead';

    setLiveTypingStatus({
      ticketId: selectedAdminTicketId,
      userId: user.id,
      userName: senderName,
      userRole: user.role || 'ADMIN',
      isTyping: val.trim().length > 0,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setLiveTypingStatus({
        ticketId: selectedAdminTicketId,
        userId: user.id,
        userName: senderName,
        userRole: user.role || 'ADMIN',
        isTyping: false,
      });
    }, 2500);
  };

  const handleAdminSend = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const text = (overrideText !== undefined ? overrideText : adminInputText).trim();
    if ((!text && adminPendingAttachments.length === 0) || !selectedAdminTicketId || !user || isSending) {
      return;
    }

    const atts = [...adminPendingAttachments];
    const senderName = activeAdminTicket?.assignedTo?.name || user.name || 'Support Specialist';
    if (overrideText === undefined) setAdminInputText('');
    setAdminPendingAttachments([]);
    setUploadError(null);
    setIsSending(true);

    try {
      await sendLiveChatMessage({
        ticketId: selectedAdminTicketId,
        senderId: user.id,
        senderName,
        senderRole: user.role || 'ADMIN',
        message: text,
        attachments: atts,
        isInternalNote: adminInternalNote,
      });
    } catch {
      setUploadError('Failed to send admin reply.');
    } finally {
      setIsSending(false);
      setAdminInternalNote(false);
    }
  };

  // Shared File Attachment Upload Handler (works for both USER and ADMIN modes)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const targetTicketId = widgetMode === 'ADMIN' ? selectedAdminTicketId : userTicket?.id;
    if (!files || files.length === 0 || !targetTicketId) return;

    setUploadError(null);
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10 MB maximum limit. Please select a file under 10 MB.');
      e.target.value = '';
      return;
    }

    try {
      setUploadProgress(5);
      const uploaded = await uploadChatAttachment(file, targetTicketId, (pct) => {
        setUploadProgress(pct);
      });
      if (widgetMode === 'ADMIN') {
        setAdminPendingAttachments((prev) => [...prev, uploaded]);
      } else {
        setUserPendingAttachments((prev) => [...prev, uploaded]);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to attach file.');
    } finally {
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  // Computed Indicators
  const isAdminTypingToUser =
    userTicket?.typingAdmin && Date.now() - (userTicket.typingAdmin.updatedAt || 0) < 8000
      ? userTicket.typingAdmin
      : null;

  const isTraderTypingToAdmin =
    activeAdminTicket?.typingUser && Date.now() - (activeAdminTicket.typingUser.updatedAt || 0) < 8000
      ? activeAdminTicket.typingUser
      : null;

  const anyTraderTypingInQueue = adminTickets.find(
    (t) => t.typingUser && Date.now() - (t.typingUser.updatedAt || 0) < 8000
  );

  const userUnreadCount = userTicket?.unreadByUser || 0;
  const adminTotalUnreadCount = adminTickets.reduce((sum, t) => sum + (t.unreadByAdmin || 0), 0);
  const assignedStaff = userTicket?.assignedTo;

  const filteredAdminTickets = adminTickets.filter((t) => {
    if (adminFilter === 'UNREAD' && !(t.unreadByAdmin && t.unreadByAdmin > 0)) return false;
    if (adminFilter === 'GUESTS' && !t.userId?.startsWith('guest_')) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      return (
        t.userName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.ticketNumber?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const activeBadgeCount = widgetMode === 'ADMIN' ? adminTotalUnreadCount : userUnreadCount;

  return (
    <>
      {/* Real-time Incoming Message Toast Banner */}
      {toastAlert && !isOpen && (
        <div
          onClick={() => {
            setIsOpen(true);
            if (toastAlert.forAdmin && isStaffUser) {
              setWidgetMode('ADMIN');
              if (toastAlert.ticketId) {
                setSelectedAdminTicketId(toastAlert.ticketId);
                setAdminViewStep('CHAT');
              }
            }
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
                Click to open live chat &rarr;
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

      {/* ==================================================================== */}
      {/* FLOATING LAUNCHER BUTTON (Visible on Website, Dashboard & Admin!)     */}
      {/* ==================================================================== */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setToastAlert(null);
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'default'
            ) {
              Notification.requestPermission().catch(() => {});
            }
          }}
          className={`fixed bottom-6 right-6 z-[9998] group flex items-center gap-3 rounded-full p-3.5 sm:px-5 sm:py-3.5 text-white shadow-2xl hover:scale-105 transition-all cursor-pointer border border-white/20 ${
            widgetMode === 'ADMIN'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 shadow-purple-600/30 hover:shadow-purple-500/40'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 shadow-emerald-600/30 hover:shadow-emerald-500/40'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-300 animate-ping" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col text-left leading-tight">
            {widgetMode === 'ADMIN' ? (
              <>
                <span className="text-xs font-black tracking-tight flex items-center gap-1.5">
                  Admin Live Chat
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {adminTickets.length} Chats
                  </span>
                </span>
                <span className="text-[10px] text-purple-100 font-medium">
                  {anyTraderTypingInQueue
                    ? `✍️ ${anyTraderTypingInQueue.userName} is typing...`
                    : adminTotalUnreadCount > 0
                    ? `${adminTotalUnreadCount} unread trader messages`
                    : 'Live Support Stream Ready'}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-black tracking-tight flex items-center gap-1.5">
                  Live Support Chat
                  {assignedStaff && (
                    <span className="hidden sm:inline-block text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                      {assignedStaff.name.split(' ')[0]}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-emerald-100 font-medium">
                  {isAdminTypingToUser
                    ? `${isAdminTypingToUser.name} is typing...`
                    : '24/7 Online • Instant Reply'}
                </span>
              </>
            )}
          </div>

          {activeBadgeCount > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white shadow-md animate-pulse">
              {activeBadgeCount}
            </span>
          )}
        </button>
      )}

      {/* ==================================================================== */}
      {/* FLOATING CHAT POPUP WINDOW                                           */}
      {/* ==================================================================== */}
      {isOpen && (
        <div
          className={`fixed z-[9999] flex flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080f20] shadow-2xl transition-all duration-200 ${
            isExpanded
              ? 'bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[680px] h-[85vh] max-h-[800px]'
              : 'bottom-5 right-5 w-[calc(100vw-2rem)] sm:w-[420px] h-[620px] max-h-[85vh]'
          }`}
        >
          {/* ================================================================ */}
          {/* TOP HEADER BAR                                                   */}
          {/* ================================================================ */}
          <div
            className={`p-4 text-white flex items-center justify-between border-b border-white/10 shrink-0 ${
              widgetMode === 'ADMIN'
                ? 'bg-gradient-to-r from-[#140b2e] via-[#1e1145] to-[#082026]'
                : 'bg-gradient-to-r from-[#07132c] via-[#0c1f42] to-[#062420]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {widgetMode === 'ADMIN' && adminViewStep === 'CHAT' && !isExpanded && (
                <button
                  type="button"
                  onClick={() => setAdminViewStep('LIST')}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                  title="Back to All Chats"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              <div
                className={`relative h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md shrink-0 ${
                  widgetMode === 'ADMIN'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}
              >
                {widgetMode === 'ADMIN' ? (
                  <ShieldCheck className="h-5 w-5 text-white" />
                ) : assignedStaff ? (
                  assignedStaff.name.charAt(0)
                ) : (
                  'P'
                )}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#07132c]"
                  title="Online via WebSocket Stream"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black truncate">
                    {widgetMode === 'ADMIN'
                      ? activeAdminTicket && (adminViewStep === 'CHAT' || isExpanded)
                        ? `${activeAdminTicket.userName}`
                        : 'Admin Live Chat Console'
                      : assignedStaff
                      ? assignedStaff.name
                      : 'PropNation Live Support'}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-bold text-emerald-300 shrink-0">
                    <UserCheck className="h-2.5 w-2.5" />
                    {widgetMode === 'ADMIN' ? `${adminTickets.length} Active` : 'Online'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 truncate flex items-center gap-1.5">
                  <Radio className="h-2.5 w-2.5 text-emerald-400 animate-pulse shrink-0" />
                  {widgetMode === 'ADMIN' ? (
                    isTraderTypingToAdmin ? (
                      <span className="text-emerald-300 font-bold animate-pulse">
                        {isTraderTypingToAdmin.name} is typing...
                      </span>
                    ) : (
                      <span>
                        {adminTotalUnreadCount > 0
                          ? `${adminTotalUnreadCount} Unread Messages`
                          : 'Real-time Trader & Website Support'}
                      </span>
                    )
                  ) : isAdminTypingToUser ? (
                    <span className="text-emerald-300 font-bold animate-pulse">
                      {isAdminTypingToUser.name} is typing...
                    </span>
                  ) : (
                    <span>{assignedStaff?.department || '24/7 Prop Firm & Rewards Concierge'}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Staff Mode Switcher: Admin Console <-> User View */}
              {isStaffUser && (
                <button
                  type="button"
                  onClick={() =>
                    setWidgetMode((prev) => (prev === 'ADMIN' ? 'USER' : 'ADMIN'))
                  }
                  title="Switch between Admin Console and Trader Chat View"
                  className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white transition-colors cursor-pointer mr-1"
                >
                  {widgetMode === 'ADMIN' ? 'Trader View' : 'Admin Desk'}
                </button>
              )}

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

          {/* ================================================================ */}
          {/* MODE A: ADMIN FLOATING LIVE CHAT CONSOLE                         */}
          {/* ================================================================ */}
          {widgetMode === 'ADMIN' && isStaffUser ? (
            <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-50 dark:bg-[#060b18]">
              {/* Left / Queue Pane (Visible when in LIST step or when Expanded) */}
              {(adminViewStep === 'LIST' || isExpanded) && (
                <div
                  className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080f20] ${
                    isExpanded ? 'w-64 shrink-0' : 'w-full'
                  }`}
                >
                  {/* Filter & Full Desk Link Bar */}
                  <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setAdminFilter('ALL')}
                          className={`px-2 py-1 rounded-md cursor-pointer transition-all ${
                            adminFilter === 'ALL'
                              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs'
                              : 'text-slate-500'
                          }`}
                        >
                          All ({adminTickets.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminFilter('UNREAD')}
                          className={`px-2 py-1 rounded-md cursor-pointer transition-all ${
                            adminFilter === 'UNREAD'
                              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-2xs'
                              : 'text-slate-500'
                          }`}
                        >
                          Unread ({adminTotalUnreadCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminFilter('GUESTS')}
                          className={`px-2 py-1 rounded-md cursor-pointer transition-all ${
                            adminFilter === 'GUESTS'
                              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                              : 'text-slate-500'
                          }`}
                        >
                          Guests
                        </button>
                      </div>

                      <Link
                        href="/admin/support"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline px-1.5 py-1"
                        title="Open Full Support Desk"
                      >
                        <span>Full Desk</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search trader or ticket #..."
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Conversation List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filteredAdminTickets.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                        <Users className="h-6 w-6 mx-auto opacity-40 mb-1" />
                        <p className="font-semibold text-slate-600 dark:text-slate-300">
                          No matching chats
                        </p>
                        <p className="text-[10px]">
                          New website visitor and trader chats appear here live.
                        </p>
                      </div>
                    ) : (
                      filteredAdminTickets.map((t) => {
                        const isSelected = selectedAdminTicketId === t.id;
                        const isTyping =
                          t.typingUser && Date.now() - (t.typingUser.updatedAt || 0) < 8000;
                        const isGuest = t.userId?.startsWith('guest_');

                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedAdminTicketId(t.id);
                              setAdminViewStep('CHAT');
                              markTicketMessagesAsSeen(t.id, 'ADMIN');
                            }}
                            className={`p-3 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-purple-50/70 dark:bg-purple-950/30'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {t.userName}
                                </span>
                                {isGuest && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] font-bold shrink-0">
                                    Visitor
                                  </span>
                                )}
                              </div>
                              {(t.unreadByAdmin || 0) > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black shrink-0">
                                  {t.unreadByAdmin}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {isTyping ? (
                                <span className="text-emerald-500 font-bold animate-pulse">
                                  ✍️ Typing now...
                                </span>
                              ) : (
                                t.lastMessagePreview || 'Started a conversation'
                              )}
                            </p>

                            <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-400">
                              <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                                {t.ticketNumber}
                              </span>
                              <span>
                                {new Date(t.lastMessageAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Right / Active Chat Thread in Admin Floating Console */}
              {(adminViewStep === 'CHAT' || isExpanded) && (
                <div className="flex-1 flex flex-col min-w-0 h-full">
                  {activeAdminTicket ? (
                    <>
                      {/* Ticket Action Subheader */}
                      <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-[10px] shrink-0">
                        <div className="truncate">
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400 mr-1.5">
                            {activeAdminTicket.ticketNumber}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">
                            {activeAdminTicket.userEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <select
                            value={activeAdminTicket.assignedToId || ''}
                            onChange={(e) => {
                              const found =
                                DEFAULT_STAFF_TEAM.find((s) => s.id === e.target.value) || null;
                              assignTicketStaff(
                                activeAdminTicket.id,
                                found,
                                user?.name || 'Admin'
                              );
                            }}
                            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                          >
                            <option value="">Unassigned</option>
                            {DEFAULT_STAFF_TEAM.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name.split(' ')[0]}
                              </option>
                            ))}
                          </select>
                          <select
                            value={activeAdminTicket.status}
                            onChange={(e) =>
                              updateTicketStatusLive(
                                activeAdminTicket.id,
                                e.target.value as LiveChatTicket['status'],
                                user?.name || 'Admin'
                              )
                            }
                            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                          >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="WAITING_TRADER">Waiting</option>
                            <option value="RESOLVED">Resolved</option>
                          </select>
                        </div>
                      </div>

                      {/* Messages Stream */}
                      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/60 dark:bg-[#060b18]">
                        {adminMessages.map((msg) => {
                          const isTrader = msg.senderRole === 'USER';
                          const isSystem = msg.senderRole === 'SYSTEM';

                          if (isSystem) {
                            return (
                              <div key={msg.id} className="text-center my-1.5">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {msg.message}
                                </span>
                              </div>
                            );
                          }

                          if (msg.isInternalNote) {
                            return (
                              <div
                                key={msg.id}
                                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px]"
                              >
                                <div className="flex items-center gap-1 font-bold text-[9px] text-amber-600 dark:text-amber-400 mb-0.5">
                                  <Lock className="h-2.5 w-2.5" /> INTERNAL NOTE ({msg.senderName})
                                </div>
                                <p>{msg.message}</p>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isTrader ? 'items-start' : 'items-end'}`}
                            >
                              <div className="flex items-center gap-1 mb-0.5 px-1 text-[9px] text-slate-400">
                                <span className="font-bold text-slate-600 dark:text-slate-300">
                                  {isTrader ? activeAdminTicket.userName : msg.senderName || 'Admin'}
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
                                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs space-y-2 ${
                                  isTrader
                                    ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs'
                                }`}
                              >
                                {msg.message && (
                                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                )}

                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    {msg.attachments.map((att) => (
                                      <div
                                        key={att.id}
                                        className="rounded-xl overflow-hidden border border-white/20 bg-black/20"
                                      >
                                        {att.kind === 'image' ? (
                                          <a
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                          >
                                            <img
                                              src={att.url}
                                              alt={att.name}
                                              className="max-h-40 w-full object-cover"
                                            />
                                          </a>
                                        ) : att.kind === 'video' ? (
                                          <video
                                            src={att.url}
                                            controls
                                            className="max-h-40 w-full bg-black"
                                          />
                                        ) : (
                                          <a
                                            href={att.url}
                                            download={att.name}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between gap-2 p-2 text-[11px] hover:underline"
                                          >
                                            <span className="truncate">{att.name}</span>
                                            <Download className="h-3.5 w-3.5 shrink-0" />
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {!isTrader && (
                                <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px]">
                                  {msg.status === 'SEEN' ? (
                                    <span className="flex items-center gap-0.5 text-emerald-500 font-bold">
                                      <CheckCheck className="h-3 w-3" /> Seen
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5 text-slate-400">
                                      <CheckCheck className="h-3 w-3" /> Delivered
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Quick Canned Replies Strip */}
                      <div className="px-2.5 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
                        <span className="font-bold text-purple-600 dark:text-purple-400 shrink-0">
                          Quick:
                        </span>
                        {ADMIN_CANNED_REPLIES.map((reply, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAdminSend(undefined, reply)}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 truncate max-w-[150px] hover:border-purple-500 cursor-pointer shrink-0"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>

                      {/* Admin Reply Input */}
                      <form
                        onSubmit={handleAdminSend}
                        className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080f20] flex items-center gap-1.5 shrink-0"
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
                          title="Attach file (Max 10MB)"
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-purple-500 transition-colors cursor-pointer shrink-0"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminInternalNote(!adminInternalNote)}
                          title="Toggle Internal Staff Note"
                          className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                            adminInternalNote
                              ? 'border-amber-500 bg-amber-500/15 text-amber-500'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500'
                          }`}
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="text"
                          value={adminInputText}
                          onChange={handleAdminInputChange}
                          placeholder={
                            adminInternalNote
                              ? 'Write internal staff note...'
                              : `Reply to ${activeAdminTicket.userName}...`
                          }
                          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={
                            isSending ||
                            (!adminInputText.trim() && adminPendingAttachments.length === 0)
                          }
                          className="h-8 w-8 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer shrink-0"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-slate-400">
                      Select a conversation from the queue to reply live.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ================================================================ */
            /* MODE B: WEBSITE VISITOR & TRADER LIVE CHAT                       */
            /* ================================================================ */
            <>
              {/* Sub-bar showing Ticket #, Guest Profile Option & WhatsApp Direct */}
              <div className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-[10px] text-slate-600 dark:text-slate-400 shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {userTicket?.ticketNumber || 'LIVE-CHAT'}
                  </span>
                  {!user && (
                    <button
                      type="button"
                      onClick={() => setShowGuestIdentityForm(!showGuestIdentityForm)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-bold hover:bg-emerald-500/20 cursor-pointer"
                    >
                      <UserCircle2 className="h-3 w-3" />
                      <span>
                        {guestIdentitySaved
                          ? 'Saved!'
                          : guestProfile?.name && !guestProfile.name.startsWith('Visitor #')
                          ? guestProfile.name
                          : 'Add Name / Email'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="https://wa.me/919876543210?text=Hi%20PropNation%20Support%2C%20I%20need%20help%20with%20prop%20firm%20rewards"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <Smartphone className="h-2.5 w-2.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Optional Collapsible Guest Name/Email Bar for Website Visitors */}
              {!user && showGuestIdentityForm && (
                <form
                  onSubmit={handleSaveGuestIdentity}
                  className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-500/30 space-y-2 shrink-0"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                    <span>Enter your details so our team can follow up:</span>
                    <button
                      type="button"
                      onClick={() => setShowGuestIdentityForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={guestNameInput}
                      onChange={(e) => setGuestNameInput(e.target.value)}
                      placeholder="Your Name *"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="email"
                      value={guestEmailInput}
                      onChange={(e) => setGuestEmailInput(e.target.value)}
                      placeholder="Your Email (optional)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Save Contact Details
                  </button>
                </form>
              )}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 dark:bg-[#060b18]">
                {userMessages.map((msg) => {
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
                          {isMe
                            ? 'You'
                            : msg.senderName || assignedStaff?.name || 'Support Specialist'}
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
                        {msg.message && (
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        )}

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
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
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
                                        <div className="text-[10px] opacity-75">
                                          {formatFileSize(att.size)}
                                        </div>
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

                {/* Quick Starter Questions for Website Visitors & Traders */}
                {userMessages.length <= 2 && (
                  <div className="pt-2 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 px-1">
                      <Sparkles className="h-3 w-3 text-emerald-500" />
                      <span>Tap a quick question to ask live:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {VISITOR_QUICK_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleUserSend(undefined, q)}
                          className="text-left text-[11px] font-medium px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer shadow-2xs"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isAdminTypingToUser && (
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-2xl shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 ml-1.5">
                        {isAdminTypingToUser.name} is typing...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Pending Attachments Preview Strip */}
              {(userPendingAttachments.length > 0 || uploadProgress !== null || uploadError) && (
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

                  {userPendingAttachments.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {userPendingAttachments.map((att) => (
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
                              setUserPendingAttachments((prev) =>
                                prev.filter((p) => p.id !== att.id)
                              )
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
                onSubmit={handleUserSend}
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
                  value={userInputText}
                  onChange={handleUserInputChange}
                  placeholder={`Message ${
                    assignedStaff ? assignedStaff.name.split(' ')[0] : 'Live Support'
                  }...`}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={
                    isSending || (!userInputText.trim() && userPendingAttachments.length === 0)
                  }
                  className="h-9 w-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
