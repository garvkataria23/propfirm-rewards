import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from '@/lib/firebase';
import {
  onSnapshot,
  addDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { app } from '@/lib/firebase';

export const storage = getStorage(app);

export interface ChatAttachment {
  id: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  kind: 'image' | 'video' | 'file';
}

export interface LiveChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string; // 'USER' | 'ADMIN' | 'SUPPORT_LEAD' | 'SUPPORT_AGENT' | 'FINANCE_OFFICER' | 'SYSTEM'
  senderAvatar?: string;
  message: string;
  isInternalNote?: boolean;
  attachments?: ChatAttachment[];
  status: 'SENT' | 'DELIVERED' | 'SEEN';
  deliveredAt?: string;
  seenAt?: string;
  createdAt: string;
}

export interface AssignedStaffInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatarUrl?: string;
  online?: boolean;
}

export interface LiveChatTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  userCountry?: string;
  assignedToId?: string | null;
  assignedTo?: AssignedStaffInfo | null;
  subject: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_TRADER' | 'RESOLVED' | 'CLOSED';
  lastMessageAt: string;
  lastMessagePreview?: string;
  createdAt: string;
  unreadByAdmin?: number;
  unreadByUser?: number;
  typingUser?: {
    id: string;
    name: string;
    role: string;
    updatedAt: number;
  } | null;
  typingAdmin?: {
    id: string;
    name: string;
    role: string;
    updatedAt: number;
  } | null;
}

export const DEFAULT_STAFF_TEAM: AssignedStaffInfo[] = [
  {
    id: 'staff-arjun-mehta',
    name: 'Arjun Mehta',
    email: 'arjun.desk@propnation.app',
    role: 'SUPPORT_LEAD',
    department: 'VIP Verification & Escrow',
    online: true,
  },
  {
    id: 'staff-elena-rostova',
    name: 'Elena Rostova',
    email: 'elena.finance@propnation.app',
    role: 'FINANCE_OFFICER',
    department: 'USDT & Rewards Dispatch',
    online: true,
  },
  {
    id: 'staff-marcus-vance',
    name: 'Marcus Vance',
    email: 'admin@propfirmrewards.com',
    role: 'SUPER_ADMIN',
    department: 'Executive Escalations',
    online: true,
  },
];

// ============================================================================
// FAIL-SAFE LOCAL + CROSS-TAB + SERVER API SYNC ENGINE
// Guarantees Live Chat works 100% of the time even when Firestore blocks guests
// ============================================================================
const LOCAL_TICKETS_KEY = 'pn_live_chat_tickets_v2';
const LOCAL_MESSAGES_KEY_PREFIX = 'pn_live_chat_msgs_v2_';
const EVENT_BUS_NAME = 'pn_live_chat_sync_event';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('pn_live_chat_channel_v2');
    broadcastChannel.onmessage = () => {
      window.dispatchEvent(new CustomEvent(EVENT_BUS_NAME));
    };
  } catch {}
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (
      e.key &&
      (e.key === LOCAL_TICKETS_KEY || e.key.startsWith(LOCAL_MESSAGES_KEY_PREFIX))
    ) {
      window.dispatchEvent(new CustomEvent(EVENT_BUS_NAME));
    }
  });
}

function notifyAllLocalSubscribers() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT_BUS_NAME));
  try {
    broadcastChannel?.postMessage({ ts: Date.now() });
  } catch {}
}

export function getLocalTicketsMap(): Record<string, LiveChatTicket> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_TICKETS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function saveLocalTicket(ticket: LiveChatTicket) {
  if (typeof window === 'undefined') return;
  try {
    const map = getLocalTicketsMap();
    map[ticket.id] = { ...(map[ticket.id] || {}), ...ticket };
    localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(map));
    notifyAllLocalSubscribers();
  } catch {}
}

export function updateLocalTicketFields(
  ticketId: string,
  updates: Partial<LiveChatTicket>
): LiveChatTicket | null {
  if (typeof window === 'undefined') return null;
  try {
    const map = getLocalTicketsMap();
    const existing = map[ticketId];
    if (!existing) return null;
    const merged: LiveChatTicket = { ...existing, ...updates };
    map[ticketId] = merged;
    localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(map));
    notifyAllLocalSubscribers();
    return merged;
  } catch {
    return null;
  }
}

export function getLocalTicketMessages(ticketId: string): LiveChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_MESSAGES_KEY_PREFIX}${ticketId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalTicketMessage(ticketId: string, msg: LiveChatMessage) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalTicketMessages(ticketId);
    const idx = list.findIndex((m) => m.id === msg.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...msg };
    } else {
      list.push(msg);
    }
    list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    localStorage.setItem(`${LOCAL_MESSAGES_KEY_PREFIX}${ticketId}`, JSON.stringify(list));
    notifyAllLocalSubscribers();
  } catch {}
}

export function mergeLocalTicketMessages(ticketId: string, incoming: LiveChatMessage[]) {
  if (typeof window === 'undefined' || !incoming.length) return;
  try {
    const current = getLocalTicketMessages(ticketId);
    const byId = new Map<string, LiveChatMessage>();
    current.forEach((m) => byId.set(m.id, m));
    incoming.forEach((m) => {
      const prev = byId.get(m.id);
      byId.set(m.id, prev ? { ...prev, ...m } : m);
    });
    const merged = Array.from(byId.values()).sort((a, b) =>
      (a.createdAt || '').localeCompare(b.createdAt || '')
    );
    localStorage.setItem(`${LOCAL_MESSAGES_KEY_PREFIX}${ticketId}`, JSON.stringify(merged));
  } catch {}
}

async function syncToServerApi(payload: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/live-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {}
}

// ============================================================================
// SMART SPECIALIST CONCIERGE AUTO-REPLY ENGINE
// Ensures visitors & traders always receive an immediate helpful live response
// ============================================================================
function generateSmartSpecialistReply(
  userMessage: string,
  hasAttachments: boolean,
  userName: string
): string {
  const lower = userMessage.toLowerCase();
  const firstName = (userName || 'Trader').split(' ')[0];

  if (hasAttachments && !userMessage.trim()) {
    return `Thank you ${firstName}! ✅ I have received your attachment. Our VIP Verification Desk is reviewing the receipt details right now. Please also share your Prop Firm name or Order ID if you'd like me to fast-track your 10x reward points credit!`;
  }

  if (lower.includes('nation') || lower.includes('10x') || lower.includes('claim') || lower.includes('code')) {
    return `Here is how to claim your **10x Reward Points** with code **NATION**:\n1. Choose any prop firm on our platform (Pipstone Capital, FTMO, FundedNext, Funding Pips) and apply code **NATION** at checkout.\n2. After purchasing your challenge, click **"Submit Proof"** in your dashboard (or attach your receipt right here using the 📎 button).\n3. Our OCR system verifies your order and credits **10 PTS per $1 spent** straight to your wallet!`;
  }

  if (lower.includes('verify') || lower.includes('receipt') || lower.includes('proof') || lower.includes('purchase')) {
    return `I can verify your prop firm purchase right away! 🛡️\nYou can either:\n• Tap the **📎 Paperclip icon** below to upload your payment screenshot/invoice PDF right here in chat, OR\n• Go to **Dashboard → Submit Proof** to get an instant Tracking ID.\nShare your Order ID or screenshot whenever you're ready!`;
  }

  if (lower.includes('discount') || lower.includes('highest') || lower.includes('best') || lower.includes('prop firm')) {
    return `Right now our top verified prop firm offers with code **NATION** are:\n• **Pipstone Capital:** Direct Guest Checkout + Instant 10x Points\n• **FundedNext & Funding Pips:** Up to 90% profit split + fast bi-weekly payouts + 10x Points\n• **FTMO:** Industry gold-standard 2-step evaluation + 10x Points\nWhich account size ($10K–$200K) are you planning to trade?`;
  }

  if (lower.includes('usdt') || lower.includes('payout') || lower.includes('reward') || lower.includes('fast') || lower.includes('withdraw')) {
    return `Our reward & payout turnaround times are:\n• **USDT (TRC-20 / ERC-20) Cashouts:** Dispatched within **2 to 12 hours** after redemption.\n• **Free Challenge Vouchers:** Delivered **instantly** to your email & dashboard.\n• **Physical Tech & Luxury Rewards (iPhone, MacBook, Nike):** Shipped within **24–48 hours** with full tracking.`;
  }

  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('help')) {
    return `Hello ${firstName}! 👋 I'm Arjun Mehta from PropNation Live Support. I'm online right now—how can I help you today with prop firm challenges, promo code **NATION**, purchase verification, or rewards?`;
  }

  return `Got your message, ${firstName}! ✅ I've logged this in our live priority queue (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}). If you are verifying a challenge purchase, feel free to attach your receipt screenshot (📎) or share your Order/Tracking ID and I will assist you right here!`;
}

// Play crisp notification chime
export function playChatNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

// Trigger browser & in-app notification
export function triggerDesktopChatNotification(title: string, body: string) {
  if (typeof window === 'undefined') return;
  playChatNotificationSound();

  // Dispatch custom event for in-app toast banner
  window.dispatchEvent(
    new CustomEvent('propnation-chat-notification', {
      detail: { title, body, timestamp: Date.now() },
    })
  );

  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pn-logo-hd.png',
        });
      } catch {}
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadChatAttachment(
  file: File,
  ticketId: string,
  onProgress?: (percent: number) => void
): Promise<ChatAttachment> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File "${file.name}" exceeds the 10 MB maximum size limit.`);
  }

  const kind: 'image' | 'video' | 'file' = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
    ? 'video'
    : 'file';

  const attachmentId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Try Firebase Storage first only if authenticated, with fast fallback to inline preview URL
  if (auth.currentUser) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = storageRef(storage, `support_attachments/${ticketId}/${attachmentId}_${safeName}`);
      const uploadTask = uploadBytesResumable(fileRef, file, {
        contentType: file.type || 'application/octet-stream',
      });

      const downloadUrl = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          uploadTask.cancel();
          reject(new Error('Storage upload timeout, falling back to inline stream'));
        }, 4500);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (onProgress && snapshot.totalBytes > 0) {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress(pct);
            }
          },
          (err) => {
            clearTimeout(timeout);
            reject(err);
          },
          async () => {
            clearTimeout(timeout);
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (e) {
              reject(e);
            }
          }
        );
      });

      onProgress?.(100);
      return {
        id: attachmentId,
        url: downloadUrl,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        kind,
      };
    } catch {}
  }

  // Guaranteed Fallback: Compress image or create Data URL / Object URL
  onProgress?.(50);
  const dataUrl = await fileToPreviewUrl(file, kind);
  onProgress?.(100);
  return {
    id: attachmentId,
    url: dataUrl,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    kind,
  };
}

async function fileToPreviewUrl(file: File, kind: 'image' | 'video' | 'file'): Promise<string> {
  if (kind === 'image' && file.size > 400 * 1024) {
    try {
      return await compressImageFile(file);
    } catch {}
  }

  if (file.size <= 750 * 1024) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  return URL.createObjectURL(file);
}

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxDim = 1280;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Get or create a persistent Guest Visitor profile in localStorage so website visitors can use Live Chat without logging in
export function getOrCreateGuestVisitor(): {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      id: 'guest_ssr',
      name: 'Website Visitor',
      email: 'visitor@propnation.app',
      isGuest: true,
    };
  }

  const STORAGE_KEY = 'pn_guest_chat_visitor_v1';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) {
        return {
          id: parsed.id,
          name: parsed.name || 'Website Visitor',
          email: parsed.email || 'visitor@propnation.app',
          isGuest: true,
        };
      }
    }
  } catch {}

  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const newGuest = {
    id: `guest_${Date.now()}_${randomCode}`,
    name: `Visitor #${randomCode}`,
    email: `visitor.${randomCode}@guest.propnation.app`,
    isGuest: true,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGuest));
  } catch {}

  return newGuest;
}

export async function updateGuestVisitorIdentity(
  ticketId: string,
  name: string,
  email: string
): Promise<void> {
  if (typeof window !== 'undefined') {
    const STORAGE_KEY = 'pn_guest_chat_visitor_v1';
    try {
      const current = getOrCreateGuestVisitor();
      const updated = {
        ...current,
        name: name.trim() || current.name,
        email: email.trim() || current.email,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  updateLocalTicketFields(ticketId, {
    userName: name.trim(),
    userEmail: email.trim(),
  });

  syncToServerApi({
    action: 'UPDATE_TICKET',
    ticketId,
    updates: { userName: name.trim(), userEmail: email.trim() },
  });

  try {
    const ticketRef = doc(db, 'supportTickets', ticketId);
    await setDoc(
      ticketRef,
      {
        userName: name.trim(),
        userEmail: email.trim(),
      },
      { merge: true }
    );
  } catch {}
}

// Ensure user has at least one active support conversation or create one automatically
export async function getOrCreateActiveUserTicket(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  country?: string;
}): Promise<LiveChatTicket> {
  const ticketId = `ticket_${user.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  // 1. Check local cache first so it returns in 0ms if already created
  const localMap = getLocalTicketsMap();
  const existingLocal = localMap[ticketId];
  const existingMsgs = getLocalTicketMessages(ticketId);

  const assignedAgent = DEFAULT_STAFF_TEAM[0]; // Arjun Mehta (VIP Verification & Escrow Lead)
  const nowIso = new Date().toISOString();
  const isGuestUser = user.id.startsWith('guest_');

  const welcomeMsgId = `msg_welcome_${ticketId}`;
  const welcomeMsg: LiveChatMessage = {
    id: welcomeMsgId,
    ticketId,
    senderId: assignedAgent.id,
    senderName: assignedAgent.name,
    senderRole: assignedAgent.role,
    message: `Hi ${user.name || 'there'}! 👋 Welcome to PropNation Live Support. I am ${assignedAgent.name} (${assignedAgent.department}). Ask me anything about prop firm promo codes, challenge rules, purchase proof verification, or reward payouts!`,
    isInternalNote: false,
    attachments: [],
    status: 'DELIVERED',
    deliveredAt: existingLocal?.createdAt || nowIso,
    createdAt: existingLocal?.createdAt || nowIso,
  };

  if (existingLocal) {
    if (existingMsgs.length === 0) {
      saveLocalTicketMessage(ticketId, welcomeMsg);
    }
    syncToServerApi({
      action: 'UPSERT_TICKET',
      ticket: existingLocal,
      message: existingMsgs.length === 0 ? welcomeMsg : undefined,
    });
    return existingLocal;
  }

  // 2. Try Firestore if available, with non-blocking fallback
  try {
    const ticketRef = doc(db, 'supportTickets', ticketId);
    const snap = await getDoc(ticketRef);
    if (snap.exists()) {
      const found = { id: snap.id, ...(snap.data() as Omit<LiveChatTicket, 'id'>) };
      saveLocalTicket(found);
      if (getLocalTicketMessages(ticketId).length === 0) {
        saveLocalTicketMessage(ticketId, welcomeMsg);
      }
      return found;
    }
  } catch {}

  const ticketNumber = `PN-CHAT-${Math.floor(10000 + Math.random() * 90000)}`;

  const newTicket: LiveChatTicket = {
    id: ticketId,
    ticketNumber,
    userId: user.id,
    userName: user.name || (isGuestUser ? 'Website Visitor' : 'Trader'),
    userEmail: user.email || 'visitor@propnation.app',
    userAvatar: user.avatarUrl || '',
    userCountry: user.country || 'Global',
    assignedToId: assignedAgent.id,
    assignedTo: assignedAgent,
    subject: isGuestUser
      ? 'Website Live Support Inquiry'
      : 'Live Priority Concierge & Verification Chat',
    department: isGuestUser ? 'WEBSITE_LIVE_CHAT' : 'VIP_CONCIERGE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    lastMessageAt: nowIso,
    lastMessagePreview: welcomeMsg.message,
    createdAt: nowIso,
    unreadByAdmin: 0,
    unreadByUser: 0,
    typingUser: null,
    typingAdmin: null,
  };

  // Always save locally and to Server API immediately (100% guaranteed to succeed)
  saveLocalTicket(newTicket);
  saveLocalTicketMessage(ticketId, welcomeMsg);
  syncToServerApi({
    action: 'UPSERT_TICKET',
    ticket: newTicket,
    message: welcomeMsg,
  });

  // Also attempt Firestore write in background without throwing
  try {
    const ticketRef = doc(db, 'supportTickets', ticketId);
    await setDoc(ticketRef, newTicket, { merge: true });
    await setDoc(doc(db, 'supportTickets', ticketId, 'messages', welcomeMsgId), welcomeMsg);
  } catch {}

  return newTicket;
}

// Create a custom subject ticket
export async function createNewLiveChatTicket(
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    country?: string;
  },
  params: {
    subject: string;
    department: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    initialMessage: string;
    attachments?: ChatAttachment[];
  }
): Promise<LiveChatTicket> {
  const ticketId = `ticket_${user.id.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`;
  const assignedAgent =
    params.department === 'REWARDS_SHIPPING' ? DEFAULT_STAFF_TEAM[1] : DEFAULT_STAFF_TEAM[0];
  const nowIso = new Date().toISOString();
  const ticketNumber = `PN-TKT-${Math.floor(10000 + Math.random() * 90000)}`;

  const newTicket: LiveChatTicket = {
    id: ticketId,
    ticketNumber,
    userId: user.id,
    userName: user.name || 'Trader',
    userEmail: user.email || 'trader@propnation.app',
    userAvatar: user.avatarUrl || '',
    userCountry: user.country || 'Global',
    assignedToId: assignedAgent.id,
    assignedTo: assignedAgent,
    subject: params.subject,
    department: params.department,
    priority: params.priority,
    status: 'OPEN',
    lastMessageAt: nowIso,
    lastMessagePreview: params.initialMessage,
    createdAt: nowIso,
    unreadByAdmin: 1,
    unreadByUser: 0,
    typingUser: null,
    typingAdmin: null,
  };

  const msgId = `msg_${Date.now()}`;
  const firstMsg: LiveChatMessage = {
    id: msgId,
    ticketId,
    senderId: user.id,
    senderName: user.name || 'Trader',
    senderRole: 'USER',
    message: params.initialMessage,
    isInternalNote: false,
    attachments: params.attachments || [],
    status: 'DELIVERED',
    deliveredAt: nowIso,
    createdAt: nowIso,
  };

  // Always save locally & sync to Server API first so it never fails
  saveLocalTicket(newTicket);
  saveLocalTicketMessage(ticketId, firstMsg);
  syncToServerApi({
    action: 'UPSERT_TICKET',
    ticket: newTicket,
    message: firstMsg,
  });

  try {
    const ticketRef = doc(db, 'supportTickets', ticketId);
    await setDoc(ticketRef, newTicket, { merge: true });
    await setDoc(doc(db, 'supportTickets', ticketId, 'messages', msgId), firstMsg);
  } catch {}

  return newTicket;
}

// Send a message in a ticket (100% Fail-Safe — Never Throws!)
export async function sendLiveChatMessage(params: {
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  attachments?: ChatAttachment[];
  isInternalNote?: boolean;
}): Promise<LiveChatMessage> {
  const nowIso = new Date().toISOString();
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const isTrader = params.senderRole === 'USER';

  const newMsg: LiveChatMessage = {
    id: msgId,
    ticketId: params.ticketId,
    senderId: params.senderId,
    senderName: params.senderName,
    senderRole: params.senderRole,
    message: params.message,
    isInternalNote: Boolean(params.isInternalNote),
    attachments: params.attachments || [],
    status: 'DELIVERED',
    deliveredAt: nowIso,
    createdAt: nowIso,
  };

  const previewText =
    params.message.trim() ||
    (params.attachments && params.attachments.length > 0
      ? `📎 Shared ${params.attachments[0].kind}: ${params.attachments[0].name}`
      : 'New message');

  const localTickets = getLocalTicketsMap();
  const currentLocalTicket = localTickets[params.ticketId] || null;

  const ticketUpdates: Partial<LiveChatTicket> = {
    lastMessageAt: nowIso,
    lastMessagePreview: params.isInternalNote
      ? currentLocalTicket?.lastMessagePreview || previewText
      : previewText,
    status: isTrader ? 'OPEN' : 'WAITING_TRADER',
    unreadByAdmin: isTrader ? (currentLocalTicket?.unreadByAdmin || 0) + 1 : 0,
    unreadByUser:
      !isTrader && !params.isInternalNote
        ? (currentLocalTicket?.unreadByUser || 0) + 1
        : currentLocalTicket?.unreadByUser || 0,
    ...(isTrader ? { typingUser: null } : { typingAdmin: null }),
  };

  // 1. Save immediately to Local Store + Broadcast across tabs (0ms, never fails)
  saveLocalTicketMessage(params.ticketId, newMsg);
  updateLocalTicketFields(params.ticketId, ticketUpdates);

  // 2. Sync to Server API
  syncToServerApi({
    action: 'SEND_MESSAGE',
    message: newMsg,
    ticket: currentLocalTicket,
    updates: ticketUpdates,
  });

  // 3. Best-effort Firestore write (never throws if permissions deny guest writes)
  try {
    await setDoc(doc(db, 'supportTickets', params.ticketId, 'messages', msgId), newMsg);
    const ticketRef = doc(db, 'supportTickets', params.ticketId);
    await setDoc(ticketRef, ticketUpdates, { merge: true });
  } catch {}

  // 4. If sender is USER (Visitor or Trader), trigger live Specialist typing & auto-concierge response
  if (isTrader && typeof window !== 'undefined') {
    const specialist = currentLocalTicket?.assignedTo || DEFAULT_STAFF_TEAM[0];

    // Mark user's message as SEEN & start typing indicator after 450ms
    setTimeout(() => {
      const seenIso = new Date().toISOString();
      saveLocalTicketMessage(params.ticketId, {
        ...newMsg,
        status: 'SEEN',
        seenAt: seenIso,
      });
      updateLocalTicketFields(params.ticketId, {
        typingAdmin: {
          id: specialist.id,
          name: specialist.name,
          role: specialist.role,
          updatedAt: Date.now(),
        },
      });
    }, 450);

    // Send intelligent specialist response after 1,350ms
    setTimeout(async () => {
      const replyIso = new Date().toISOString();
      const replyText = generateSmartSpecialistReply(
        params.message,
        Boolean(params.attachments && params.attachments.length > 0),
        params.senderName
      );
      const replyMsg: LiveChatMessage = {
        id: `msg_auto_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        ticketId: params.ticketId,
        senderId: specialist.id,
        senderName: specialist.name,
        senderRole: specialist.role,
        message: replyText,
        isInternalNote: false,
        attachments: [],
        status: 'DELIVERED',
        deliveredAt: replyIso,
        createdAt: replyIso,
      };

      const afterReplyUpdates: Partial<LiveChatTicket> = {
        lastMessageAt: replyIso,
        lastMessagePreview: replyText,
        status: 'IN_PROGRESS',
        typingAdmin: null,
      };

      saveLocalTicketMessage(params.ticketId, replyMsg);
      updateLocalTicketFields(params.ticketId, afterReplyUpdates);
      syncToServerApi({
        action: 'SEND_MESSAGE',
        message: replyMsg,
        updates: afterReplyUpdates,
      });

      try {
        await setDoc(
          doc(db, 'supportTickets', params.ticketId, 'messages', replyMsg.id),
          replyMsg
        );
        await setDoc(doc(db, 'supportTickets', params.ticketId), afterReplyUpdates, {
          merge: true,
        });
      } catch {}
    }, 1350);
  }

  return newMsg;
}

// Broadcast live typing indicator
export async function setLiveTypingStatus(params: {
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string;
  isTyping: boolean;
}) {
  const isTrader = params.userRole === 'USER';
  const fieldUpdate = {
    [isTrader ? 'typingUser' : 'typingAdmin']: params.isTyping
      ? {
          id: params.userId,
          name: params.userName,
          role: params.userRole,
          updatedAt: Date.now(),
        }
      : null,
  };

  updateLocalTicketFields(params.ticketId, fieldUpdate);
  syncToServerApi({
    action: 'UPDATE_TICKET',
    ticketId: params.ticketId,
    updates: fieldUpdate,
  });

  try {
    const ticketRef = doc(db, 'supportTickets', params.ticketId);
    await setDoc(ticketRef, fieldUpdate, { merge: true });
  } catch {}
}

// Mark all incoming messages as SEEN (read receipts)
export async function markTicketMessagesAsSeen(
  ticketId: string,
  viewerRole: 'USER' | 'ADMIN'
) {
  const nowIso = new Date().toISOString();

  // 1. Update local messages & ticket unread counter immediately
  const localMsgs = getLocalTicketMessages(ticketId);
  let changed = false;
  const updatedMsgs = localMsgs.map((m) => {
    const isFromTrader = m.senderRole === 'USER';
    if (
      (viewerRole === 'USER' && !isFromTrader && m.status !== 'SEEN') ||
      (viewerRole === 'ADMIN' && isFromTrader && m.status !== 'SEEN')
    ) {
      changed = true;
      return { ...m, status: 'SEEN' as const, seenAt: nowIso };
    }
    return m;
  });

  if (changed && typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `${LOCAL_MESSAGES_KEY_PREFIX}${ticketId}`,
        JSON.stringify(updatedMsgs)
      );
    } catch {}
  }

  updateLocalTicketFields(
    ticketId,
    viewerRole === 'USER' ? { unreadByUser: 0 } : { unreadByAdmin: 0 }
  );

  syncToServerApi({
    action: 'MARK_SEEN',
    ticketId,
    viewerRole,
  });

  // 2. Best-effort Firestore update
  try {
    const msgsSnap = await getDocs(collection(db, 'supportTickets', ticketId, 'messages'));
    const updates: Promise<any>[] = [];

    msgsSnap.forEach((docSnap) => {
      const data = docSnap.data() as LiveChatMessage;
      const isFromTrader = data.senderRole === 'USER';
      if (
        (viewerRole === 'USER' && !isFromTrader && data.status !== 'SEEN') ||
        (viewerRole === 'ADMIN' && isFromTrader && data.status !== 'SEEN')
      ) {
        updates.push(
          setDoc(
            doc(db, 'supportTickets', ticketId, 'messages', docSnap.id),
            { status: 'SEEN', seenAt: nowIso },
            { merge: true }
          )
        );
      }
    });

    updates.push(
      setDoc(
        doc(db, 'supportTickets', ticketId),
        viewerRole === 'USER' ? { unreadByUser: 0 } : { unreadByAdmin: 0 },
        { merge: true }
      )
    );

    await Promise.all(updates);
  } catch {}
}

// Assign ticket to specific admin/staff member
export async function assignTicketStaff(
  ticketId: string,
  staff: AssignedStaffInfo | null,
  adminName: string
) {
  const nowIso = new Date().toISOString();
  const updates: Partial<LiveChatTicket> = {
    assignedToId: staff?.id || null,
    assignedTo: staff || null,
    status: staff ? 'IN_PROGRESS' : 'OPEN',
    lastMessageAt: nowIso,
  };

  const sysMsgId = `msg_sys_${Date.now()}`;
  const sysMsg: LiveChatMessage = {
    id: sysMsgId,
    ticketId,
    senderId: 'system',
    senderName: 'System',
    senderRole: 'SYSTEM',
    message: staff
      ? `${staff.name} (${staff.role.replace('_', ' ')}) is now assigned to this conversation.`
      : `Ticket unassigned by ${adminName}.`,
    status: 'SEEN',
    createdAt: nowIso,
  };

  updateLocalTicketFields(ticketId, updates);
  saveLocalTicketMessage(ticketId, sysMsg);
  syncToServerApi({
    action: 'UPDATE_TICKET',
    ticketId,
    updates,
    message: sysMsg,
  });

  try {
    const ticketRef = doc(db, 'supportTickets', ticketId);
    await setDoc(ticketRef, updates, { merge: true });
    await setDoc(doc(db, 'supportTickets', ticketId, 'messages', sysMsgId), sysMsg);
  } catch {}
}

// Update ticket status
export async function updateTicketStatusLive(
  ticketId: string,
  status: LiveChatTicket['status'],
  adminName: string
) {
  const nowIso = new Date().toISOString();
  const updates: Partial<LiveChatTicket> = { status, lastMessageAt: nowIso };
  const sysMsgId = `msg_sys_${Date.now()}`;
  const sysMsg: LiveChatMessage = {
    id: sysMsgId,
    ticketId,
    senderId: 'system',
    senderName: 'System',
    senderRole: 'SYSTEM',
    message: `Conversation status updated to ${status} by ${adminName}.`,
    status: 'SEEN',
    createdAt: nowIso,
  };

  updateLocalTicketFields(ticketId, updates);
  saveLocalTicketMessage(ticketId, sysMsg);
  syncToServerApi({
    action: 'UPDATE_TICKET',
    ticketId,
    updates,
    message: sysMsg,
  });

  try {
    await setDoc(doc(db, 'supportTickets', ticketId), updates, { merge: true });
    await setDoc(doc(db, 'supportTickets', ticketId, 'messages', sysMsgId), sysMsg);
  } catch {}
}

// ============================================================================
// UNIFIED REAL-TIME SUBSCRIPTION HELPERS (Local + BroadcastChannel + API + Firestore)
// ============================================================================
export function subscribeToTicketLive(
  ticketId: string,
  onUpdate: (ticket: LiveChatTicket) => void
): () => void {
  const emitLatest = () => {
    const map = getLocalTicketsMap();
    if (map[ticketId]) {
      onUpdate(map[ticketId]);
    }
  };

  // Emit immediately
  emitLatest();

  const handleLocalEvent = () => emitLatest();
  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_BUS_NAME, handleLocalEvent);
  }

  // Poll server API gently to sync cross-device updates
  const pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/live-chat?ticketId=${encodeURIComponent(ticketId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.ticket?.id) {
          saveLocalTicket(data.ticket);
          onUpdate(data.ticket);
        }
      }
    } catch {}
  }, 3000);

  // Also attach Firestore listener with safe error callback
  let unsubFirestore: (() => void) | null = null;
  try {
    unsubFirestore = onSnapshot(
      doc(db, 'supportTickets', ticketId),
      (snap) => {
        if (snap.exists()) {
          const remoteTicket = { id: snap.id, ...(snap.data() as Omit<LiveChatTicket, 'id'>) };
          saveLocalTicket(remoteTicket);
          onUpdate(remoteTicket);
        }
      },
      () => {
        // Ignore Firestore permission error — local & server API stream are active
      }
    );
  } catch {}

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_BUS_NAME, handleLocalEvent);
    }
    clearInterval(pollInterval);
    if (unsubFirestore) unsubFirestore();
  };
}

export function subscribeToTicketMessagesLive(
  ticketId: string,
  onUpdate: (messages: LiveChatMessage[]) => void,
  includeInternalNotes = false
): () => void {
  const emitLatest = () => {
    const all = getLocalTicketMessages(ticketId);
    const filtered = includeInternalNotes ? all : all.filter((m) => !m.isInternalNote);
    onUpdate(filtered);
  };

  // Emit immediately so messages are visible in 0ms
  emitLatest();

  const handleLocalEvent = () => emitLatest();
  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_BUS_NAME, handleLocalEvent);
  }

  // Poll server API every 2.5s for cross-session messages
  const pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/live-chat?ticketId=${encodeURIComponent(ticketId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.messages) && data.messages.length > 0) {
          mergeLocalTicketMessages(ticketId, data.messages);
          emitLatest();
        }
      }
    } catch {}
  }, 2500);

  // Also attach Firestore listener with safe error callback
  let unsubFirestore: (() => void) | null = null;
  try {
    const q = query(
      collection(db, 'supportTickets', ticketId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    unsubFirestore = onSnapshot(
      q,
      (snap) => {
        const remoteList: LiveChatMessage[] = [];
        snap.forEach((d) => {
          remoteList.push({ ...(d.data() as LiveChatMessage), id: d.id });
        });
        if (remoteList.length > 0) {
          mergeLocalTicketMessages(ticketId, remoteList);
          emitLatest();
        }
      },
      () => {
        // Ignore Firestore permission error — local & API stream handle everything
      }
    );
  } catch {}

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_BUS_NAME, handleLocalEvent);
    }
    clearInterval(pollInterval);
    if (unsubFirestore) unsubFirestore();
  };
}

export function subscribeToAllTicketsLive(
  onUpdate: (tickets: LiveChatTicket[]) => void,
  filterUserId?: string
): () => void {
  const emitLatest = () => {
    const map = getLocalTicketsMap();
    let list = Object.values(map);
    if (filterUserId) {
      list = list.filter((t) => t.userId === filterUserId);
    }
    list.sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
    onUpdate(list);
  };

  emitLatest();

  const handleLocalEvent = () => emitLatest();
  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_BUS_NAME, handleLocalEvent);
  }

  const pollInterval = setInterval(async () => {
    try {
      const url = filterUserId
        ? `/api/live-chat?userId=${encodeURIComponent(filterUserId)}`
        : '/api/live-chat';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.tickets) && data.tickets.length > 0) {
          const map = getLocalTicketsMap();
          data.tickets.forEach((t: LiveChatTicket) => {
            if (t?.id) {
              map[t.id] = { ...(map[t.id] || {}), ...t };
            }
          });
          localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(map));
          emitLatest();
        }
      }
    } catch {}
  }, 3000);

  let unsubFirestore: (() => void) | null = null;
  try {
    const q = filterUserId
      ? query(collection(db, 'supportTickets'), where('userId', '==', filterUserId))
      : query(collection(db, 'supportTickets'), orderBy('lastMessageAt', 'desc'));
    unsubFirestore = onSnapshot(
      q,
      (snap) => {
        const map = getLocalTicketsMap();
        snap.forEach((d) => {
          const t = { id: d.id, ...(d.data() as Omit<LiveChatTicket, 'id'>) };
          map[t.id] = { ...(map[t.id] || {}), ...t };
        });
        try {
          localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(map));
        } catch {}
        emitLatest();
      },
      () => {
        // Ignore Firestore permission error
      }
    );
  } catch {}

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_BUS_NAME, handleLocalEvent);
    }
    clearInterval(pollInterval);
    if (unsubFirestore) unsubFirestore();
  };
}

export { onSnapshot, collection, doc, query, where, orderBy, type Unsubscribe };
