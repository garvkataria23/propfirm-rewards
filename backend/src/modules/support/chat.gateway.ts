import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SupportService } from './support.service';
import { TicketStatus } from './support.dto';
import { getJwtSecret } from '../../common/config/jwt.config';

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
}

const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'];

@WebSocketGateway({
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow local and configured domains
      if (!origin) return callback(null, true);
      const configured = process.env.CORS_ORIGIN || '';
      const allowed = configured.split(',').map((s) => s.trim());
      if (
        allowed.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private onlineUsers = new Map<string, { user: AuthenticatedUser; socketId: string }>();
  private messageRateLimits = new Map<string, { count: number; resetAt: number }>();
  private typingTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly supportService: SupportService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    this.logger.log('🛡️ Authenticated WebSocket Chat Gateway Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // 1. Extract token from handshake auth, query, or headers
      const rawToken =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
        (client.handshake.query?.token as string);

      if (!rawToken || typeof rawToken !== 'string') {
        this.logger.warn(`[Socket ${client.id}] Connection rejected: No JWT provided.`);
        client.emit('auth_error', { message: 'Authentication required. No JWT provided.' });
        client.disconnect(true);
        return;
      }

      // 2. Cryptographic JWT verification
      const payload = this.jwtService.verify(rawToken, { secret: getJwtSecret() });
      if (!payload?.sub) {
        this.logger.warn(`[Socket ${client.id}] Connection rejected: Invalid JWT sub.`);
        client.emit('auth_error', { message: 'Invalid authentication session.' });
        client.disconnect(true);
        return;
      }

      // 3. Verify user in database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatarUrl: true,
        },
      });

      if (!user) {
        this.logger.warn(`[Socket ${client.id}] Connection rejected: User not found in database.`);
        client.emit('auth_error', { message: 'User account not found.' });
        client.disconnect(true);
        return;
      }

      if (user.status === 'SUSPENDED') {
        this.logger.warn(`[Socket ${client.id}] Connection rejected: User ${user.email} is suspended.`);
        client.emit('auth_error', { message: 'Account is suspended.' });
        client.disconnect(true);
        return;
      }

      // 4. Attach verified server-derived identity to socket
      client.data.user = user;
      this.onlineUsers.set(client.id, { user, socketId: client.id });

      this.logger.log(`🔌 Client connected & authenticated: ${user.name} [${user.role}] (${client.id})`);

      client.emit('authenticated', {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        onlineCount: this.onlineUsers.size,
      });

      this.server.emit('presence_update', {
        userId: user.id,
        status: 'online',
        onlineCount: this.onlineUsers.size,
      });
    } catch (err: any) {
      this.logger.warn(`[Socket ${client.id}] Connection rejected: ${err.message}`);
      client.emit('auth_error', { message: 'Authentication failed. Please sign in again.' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const record = this.onlineUsers.get(client.id);
    if (record) {
      this.onlineUsers.delete(client.id);
      this.messageRateLimits.delete(client.id);
      this.logger.log(`❌ Client disconnected: ${record.user.name} (${client.id})`);

      this.server.emit('presence_update', {
        userId: record.user.id,
        status: 'offline',
        onlineCount: this.onlineUsers.size,
      });
    }
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const record = this.messageRateLimits.get(clientId);

    if (!record || now > record.resetAt) {
      this.messageRateLimits.set(clientId, { count: 1, resetAt: now + 3000 });
      return true;
    }

    record.count++;
    if (record.count > 5) {
      return false; // Max 5 messages per 3-second window
    }
    return true;
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(@ConnectedSocket() client: Socket) {
    const user: AuthenticatedUser = client.data.user;
    if (!user) {
      client.emit('error', { message: 'Socket unauthenticated' });
      return;
    }
    client.emit('authenticated', {
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
      onlineCount: this.onlineUsers.size,
    });
  }

  @SubscribeMessage('join_ticket')
  async handleJoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    const authUser: AuthenticatedUser = client.data.user;
    if (!authUser) {
      client.emit('error', { message: 'Unauthenticated socket' });
      return;
    }

    if (!data?.ticketId) {
      client.emit('error', { message: 'Ticket ID is required' });
      return;
    }

    // Server-side authorization check: verify ticket exists and ownership
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: data.ticketId },
      select: { id: true, userId: true },
    });

    if (!ticket) {
      client.emit('error', { message: 'Ticket not found' });
      return;
    }

    const isStaff = STAFF_ROLES.includes(authUser.role);
    if (!isStaff && ticket.userId !== authUser.id) {
      this.logger.warn(
        `🚨 [SECURITY] User ${authUser.id} attempted unauthorized access to ticket ${data.ticketId}!`,
      );
      client.emit('error', { message: 'Forbidden: You do not have access to this ticket room' });
      return;
    }

    const roomName = `ticket_${data.ticketId}`;
    client.join(roomName);
    this.logger.log(`📥 ${authUser.name} (${authUser.role}) joined authorized room: ${roomName}`);

    client.to(roomName).emit('user_joined_room', {
      ticketId: data.ticketId,
      user: { id: authUser.id, name: authUser.name, role: authUser.role },
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('leave_ticket')
  handleLeaveTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    const authUser: AuthenticatedUser = client.data.user;
    if (!authUser || !data?.ticketId) return;

    const roomName = `ticket_${data.ticketId}`;
    client.leave(roomName);
    client.to(roomName).emit('user_left_room', {
      ticketId: data.ticketId,
      user: { id: authUser.id, name: authUser.name },
    });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      ticketId: string;
      message: string;
      isInternalNote?: boolean;
      attachments?: string;
    },
  ) {
    const authUser: AuthenticatedUser = client.data.user;
    if (!authUser) {
      client.emit('error', { message: 'Unauthenticated socket: message rejected' });
      return { success: false, error: 'Unauthenticated' };
    }

    // Rate limit check
    if (!this.checkRateLimit(client.id)) {
      client.emit('error', { message: 'Rate limit exceeded: Please wait before sending more messages.' });
      return { success: false, error: 'Rate limit exceeded' };
    }

    // Message validation
    if (!data?.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
      client.emit('error', { message: 'Message content cannot be empty' });
      return { success: false, error: 'Empty message' };
    }

    if (data.message.length > 4000) {
      client.emit('error', { message: 'Message exceeds maximum length (4000 characters)' });
      return { success: false, error: 'Message too long' };
    }

    const isStaff = STAFF_ROLES.includes(authUser.role);

    // SECURITY: Traders can NEVER author internal notes!
    const isInternalNote = isStaff ? Boolean(data.isInternalNote) : false;

    // Sender identity is derived 100% from authenticated socket, NEVER client body!
    const senderId = authUser.id;
    const senderRole = authUser.role;

    try {
      const roomName = `ticket_${data.ticketId}`;

      const result = await this.supportService.addMessage(
        data.ticketId,
        senderId,
        senderRole,
        {
          message: data.message.trim(),
          isInternalNote,
          attachments: data.attachments,
        },
      );

      // Stop typing status
      client.to(roomName).emit('user_typing', {
        ticketId: data.ticketId,
        userId: senderId,
        isTyping: false,
      });

      // Broadcast message:
      // If internal note, broadcast only to staff sockets
      if (isInternalNote) {
        for (const [sId, rec] of this.onlineUsers.entries()) {
          if (STAFF_ROLES.includes(rec.user.role)) {
            this.server.to(sId).emit('new_message', {
              ticketId: data.ticketId,
              message: result.message,
              ticket: result.ticket,
            });
          }
        }
      } else {
        this.server.to(roomName).emit('new_message', {
          ticketId: data.ticketId,
          message: result.message,
          ticket: result.ticket,
        });
      }

      this.server.emit('ticket_activity', {
        ticketId: data.ticketId,
        lastMessage: result.message.message,
        senderRole: result.message.senderRole,
        lastMessageAt: result.ticket.lastMessageAt,
        status: result.ticket.status,
      });

      return { success: true, message: result.message };
    } catch (err: any) {
      this.logger.error(`Error sending message: ${err.message}`);
      client.emit('error', { message: err.message });
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    const authUser: AuthenticatedUser = client.data.user;
    if (!authUser || !data?.ticketId) return;

    const roomName = `ticket_${data.ticketId}`;
    const timeoutKey = `${data.ticketId}_${authUser.id}`;

    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
    }

    client.to(roomName).emit('user_typing', {
      ticketId: data.ticketId,
      user: { id: authUser.id, name: authUser.name, role: authUser.role },
      isTyping: true,
    });

    const timeout = setTimeout(() => {
      client.to(roomName).emit('user_typing', {
        ticketId: data.ticketId,
        user: { id: authUser.id, name: authUser.name },
        isTyping: false,
      });
      this.typingTimeouts.delete(timeoutKey);
    }, 4000);

    this.typingTimeouts.set(timeoutKey, timeout);
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    const authUser: AuthenticatedUser = client.data.user;
    if (!authUser || !data?.ticketId) return;

    const roomName = `ticket_${data.ticketId}`;
    const timeoutKey = `${data.ticketId}_${authUser.id}`;

    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
      this.typingTimeouts.delete(timeoutKey);
    }

    client.to(roomName).emit('user_typing', {
      ticketId: data.ticketId,
      user: { id: authUser.id, name: authUser.name },
      isTyping: false,
    });
  }

  @SubscribeMessage('assign_ticket')
  async handleAssignTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      ticketId: string;
      assignedToId: string | null;
    },
  ) {
    const authUser: AuthenticatedUser = client.data.user;
    if (!authUser || !STAFF_ROLES.includes(authUser.role)) {
      client.emit('error', { message: 'Unauthorized: Only staff can assign tickets' });
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const updated = await this.supportService.assignTicket(
        data.ticketId,
        data.assignedToId,
        { id: authUser.id, name: authUser.name },
      );

      const roomName = `ticket_${data.ticketId}`;
      this.server.to(roomName).emit('ticket_assigned', {
        ticketId: data.ticketId,
        assignedTo: updated.assignedTo,
        status: updated.status,
      });

      this.server.emit('ticket_activity', {
        ticketId: data.ticketId,
        assignedTo: updated.assignedTo,
        status: updated.status,
      });

      return { success: true, ticket: updated };
    } catch (err: any) {
      client.emit('error', { message: err.message });
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('update_status')
  async handleUpdateStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      ticketId: string;
      status: TicketStatus;
    },
  ) {
    const authUser: AuthenticatedUser = client.data.user;
    if (!authUser || !STAFF_ROLES.includes(authUser.role)) {
      client.emit('error', { message: 'Unauthorized: Only staff can update ticket status' });
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const updated = await this.supportService.updateTicketStatus(
        data.ticketId,
        data.status,
        { id: authUser.id, name: authUser.name },
      );

      const roomName = `ticket_${data.ticketId}`;
      this.server.to(roomName).emit('status_updated', {
        ticketId: data.ticketId,
        status: updated.status,
      });

      this.server.emit('ticket_activity', {
        ticketId: data.ticketId,
        status: updated.status,
      });

      return { success: true, ticket: updated };
    } catch (err: any) {
      client.emit('error', { message: err.message });
      return { success: false, error: err.message };
    }
  }
}
