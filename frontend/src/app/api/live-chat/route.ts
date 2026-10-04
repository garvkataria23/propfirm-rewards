import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface StoredTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  userCountry?: string;
  assignedToId?: string | null;
  assignedTo?: any;
  subject: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_TRADER' | 'RESOLVED' | 'CLOSED';
  lastMessageAt: string;
  lastMessagePreview?: string;
  createdAt: string;
  unreadByAdmin?: number;
  unreadByUser?: number;
  typingUser?: any;
  typingAdmin?: any;
}

interface StoredMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  message: string;
  isInternalNote?: boolean;
  attachments?: any[];
  status: 'SENT' | 'DELIVERED' | 'SEEN';
  deliveredAt?: string;
  seenAt?: string;
  createdAt: string;
}

// Global in-memory store on server instance so visitors and admins sync even if Firestore rules block guest writes
const globalChatStore = globalThis as unknown as {
  __pnLiveChatTickets?: Map<string, StoredTicket>;
  __pnLiveChatMessages?: Map<string, StoredMessage[]>;
};

if (!globalChatStore.__pnLiveChatTickets) {
  globalChatStore.__pnLiveChatTickets = new Map<string, StoredTicket>();
}
if (!globalChatStore.__pnLiveChatMessages) {
  globalChatStore.__pnLiveChatMessages = new Map<string, StoredMessage[]>();
}

const ticketsMap = globalChatStore.__pnLiveChatTickets;
const messagesMap = globalChatStore.__pnLiveChatMessages;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get('ticketId');
  const userId = searchParams.get('userId');

  if (ticketId) {
    const ticket = ticketsMap.get(ticketId) || null;
    const messages = messagesMap.get(ticketId) || [];
    return NextResponse.json({ ticket, messages });
  }

  let tickets = Array.from(ticketsMap.values());
  if (userId) {
    tickets = tickets.filter((t) => t.userId === userId);
  }
  tickets.sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ticket, message, ticketId, updates } = body;

    if (action === 'UPSERT_TICKET' && ticket?.id) {
      const existing = ticketsMap.get(ticket.id);
      const merged: StoredTicket = { ...(existing || {}), ...ticket };
      ticketsMap.set(ticket.id, merged);

      if (message && message.id) {
        const list = messagesMap.get(ticket.id) || [];
        if (!list.some((m) => m.id === message.id)) {
          list.push(message);
          list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
          messagesMap.set(ticket.id, list);
        }
      }
      return NextResponse.json({ ok: true, ticket: merged });
    }

    if (action === 'SEND_MESSAGE' && message?.ticketId && message?.id) {
      const tId = message.ticketId;
      const list = messagesMap.get(tId) || [];
      const existingIdx = list.findIndex((m) => m.id === message.id);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...message };
      } else {
        list.push(message);
      }
      list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      messagesMap.set(tId, list);

      if (updates && ticketsMap.has(tId)) {
        const existingTicket = ticketsMap.get(tId)!;
        ticketsMap.set(tId, { ...existingTicket, ...updates });
      } else if (ticket && ticket.id === tId) {
        ticketsMap.set(tId, { ...(ticketsMap.get(tId) || {}), ...ticket, ...(updates || {}) });
      }

      return NextResponse.json({ ok: true, message });
    }

    if (action === 'UPDATE_TICKET' && ticketId && updates) {
      const existing = ticketsMap.get(ticketId);
      if (existing) {
        const updated = { ...existing, ...updates };
        ticketsMap.set(ticketId, updated);
      }
      if (message && message.id) {
        const list = messagesMap.get(ticketId) || [];
        if (!list.some((m) => m.id === message.id)) {
          list.push(message);
          messagesMap.set(ticketId, list);
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'MARK_SEEN' && ticketId) {
      const viewerRole = body.viewerRole as 'USER' | 'ADMIN';
      const nowIso = new Date().toISOString();
      const list = messagesMap.get(ticketId) || [];
      const updatedList = list.map((m) => {
        const isFromTrader = m.senderRole === 'USER';
        if (
          (viewerRole === 'USER' && !isFromTrader && m.status !== 'SEEN') ||
          (viewerRole === 'ADMIN' && isFromTrader && m.status !== 'SEEN')
        ) {
          return { ...m, status: 'SEEN' as const, seenAt: nowIso };
        }
        return m;
      });
      messagesMap.set(ticketId, updatedList);

      const existing = ticketsMap.get(ticketId);
      if (existing) {
        ticketsMap.set(ticketId, {
          ...existing,
          ...(viewerRole === 'USER' ? { unreadByUser: 0 } : { unreadByAdmin: 0 }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Error' }, { status: 200 });
  }
}
