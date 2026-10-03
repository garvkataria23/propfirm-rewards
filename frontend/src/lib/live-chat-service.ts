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

  // Try Firebase Storage first with progress tracking
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
      }, 6500);

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
  } catch {
    // Fallback: For images, compress or convert to Data URL; for videos/files, convert to Data URL if <= 750KB or Object URL + chunked storage
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
}

async function fileToPreviewUrl(file: File, kind: 'image' | 'video' | 'file'): Promise<string> {
  // If image, compress if over 600KB so it fits cleanly inside Firestore document (1MB limit)
  if (kind === 'image' && file.size > 500 * 1024) {
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

  // For larger videos/files when Firebase Storage bucket is not yet initialized, create a persistent blob URL in session & store reference
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
  const ticketRef = doc(db, 'supportTickets', ticketId);

  try {
    const snap = await getDoc(ticketRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<LiveChatTicket, 'id'>) };
    }
  } catch {}

  const assignedAgent = DEFAULT_STAFF_TEAM[0]; // Arjun Mehta (VIP Verification & Escrow Lead)
  const nowIso = new Date().toISOString();
  const ticketNumber = `PN-CHAT-${Math.floor(10000 + Math.random() * 90000)}`;
  const isGuestUser = user.id.startsWith('guest_');

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
    lastMessagePreview: `Hi ${user.name || 'there'}! I'm ${assignedAgent.name}, your assigned PropNation Specialist. How can I help you today?`,
    createdAt: nowIso,
    unreadByAdmin: 0,
    unreadByUser: 0,
    typingUser: null,
    typingAdmin: null,
  };

  try {
    await setDoc(ticketRef, newTicket, { merge: true });

    // Seed welcome message from assigned staff member
    const welcomeMsgId = `msg_welcome_${Date.now()}`;
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
      deliveredAt: nowIso,
      createdAt: nowIso,
    };
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
  const ticketRef = doc(db, 'supportTickets', ticketId);
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
    userCountry: user.country || 'United States',
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

  await setDoc(ticketRef, newTicket, { merge: true });

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

  await setDoc(doc(db, 'supportTickets', ticketId, 'messages', msgId), firstMsg);
  return newTicket;
}

// Send a message in a ticket
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

  await setDoc(doc(db, 'supportTickets', params.ticketId, 'messages', msgId), newMsg);

  const previewText =
    params.message.trim() ||
    (params.attachments && params.attachments.length > 0
      ? `📎 Shared ${params.attachments[0].kind}: ${params.attachments[0].name}`
      : 'New message');

  const ticketRef = doc(db, 'supportTickets', params.ticketId);
  const ticketSnap = await getDoc(ticketRef).catch(() => null);
  const currentData = ticketSnap?.exists() ? (ticketSnap.data() as LiveChatTicket) : null;

  await setDoc(
    ticketRef,
    {
      lastMessageAt: nowIso,
      lastMessagePreview: params.isInternalNote ? currentData?.lastMessagePreview || previewText : previewText,
      status: isTrader ? 'OPEN' : 'WAITING_TRADER',
      unreadByAdmin: isTrader ? (currentData?.unreadByAdmin || 0) + 1 : 0,
      unreadByUser: !isTrader && !params.isInternalNote ? (currentData?.unreadByUser || 0) + 1 : currentData?.unreadByUser || 0,
      ...(isTrader ? { typingUser: null } : { typingAdmin: null }),
    },
    { merge: true }
  );

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
  const ticketRef = doc(db, 'supportTickets', params.ticketId);
  try {
    await setDoc(
      ticketRef,
      {
        [isTrader ? 'typingUser' : 'typingAdmin']: params.isTyping
          ? {
              id: params.userId,
              name: params.userName,
              role: params.userRole,
              updatedAt: Date.now(),
            }
          : null,
      },
      { merge: true }
    );
  } catch {}
}

// Mark all incoming messages as SEEN (read receipts)
export async function markTicketMessagesAsSeen(
  ticketId: string,
  viewerRole: 'USER' | 'ADMIN'
) {
  try {
    const msgsSnap = await getDocs(collection(db, 'supportTickets', ticketId, 'messages'));
    const nowIso = new Date().toISOString();
    const updates: Promise<any>[] = [];

    msgsSnap.forEach((docSnap) => {
      const data = docSnap.data() as LiveChatMessage;
      const isFromTrader = data.senderRole === 'USER';
      // If viewer is USER, mark staff messages as SEEN. If viewer is ADMIN, mark trader messages as SEEN.
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
  const ticketRef = doc(db, 'supportTickets', ticketId);
  await setDoc(
    ticketRef,
    {
      assignedToId: staff?.id || null,
      assignedTo: staff || null,
      status: staff ? 'IN_PROGRESS' : 'OPEN',
      lastMessageAt: nowIso,
    },
    { merge: true }
  );

  const sysMsgId = `msg_sys_${Date.now()}`;
  await setDoc(doc(db, 'supportTickets', ticketId, 'messages', sysMsgId), {
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
  });
}

// Update ticket status
export async function updateTicketStatusLive(
  ticketId: string,
  status: LiveChatTicket['status'],
  adminName: string
) {
  const nowIso = new Date().toISOString();
  await setDoc(
    doc(db, 'supportTickets', ticketId),
    { status, lastMessageAt: nowIso },
    { merge: true }
  );

  const sysMsgId = `msg_sys_${Date.now()}`;
  await setDoc(doc(db, 'supportTickets', ticketId, 'messages', sysMsgId), {
    id: sysMsgId,
    ticketId,
    senderId: 'system',
    senderName: 'System',
    senderRole: 'SYSTEM',
    message: `Conversation status updated to ${status} by ${adminName}.`,
    status: 'SEEN',
    createdAt: nowIso,
  });
}

export { onSnapshot, collection, doc, query, where, orderBy, type Unsubscribe };
