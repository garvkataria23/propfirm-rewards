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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SupportService } from './support.service';
import { TicketStatus } from './support.dto';

interface ActiveUser {
  userId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  socketId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private onlineUsers = new Map<string, ActiveUser>(); // socketId -> ActiveUser
  private typingTimeouts = new Map<string, NodeJS.Timeout>(); // key: `${ticketId}_${userId}`

  constructor(private readonly supportService: SupportService) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Live Chat Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.onlineUsers.get(client.id);
    if (user) {
      this.logger.log(`❌ Client disconnected: ${user.name} (${user.role}) - ${client.id}`);
      this.onlineUsers.delete(client.id);
      this.server.emit('presence_update', {
        userId: user.userId,
        status: 'offline',
        onlineCount: this.onlineUsers.size,
      });
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; name: string; role: string; avatarUrl?: string },
  ) {
    if (!data?.userId) return;

    this.onlineUsers.set(client.id, {
      userId: data.userId,
      name: data.name,
      role: data.role,
      avatarUrl: data.avatarUrl,
      socketId: client.id,
    });

    this.logger.log(`✅ User authenticated on WebSocket: ${data.name} [${data.role}]`);

    client.emit('authenticated', {
      success: true,
      onlineCount: this.onlineUsers.size,
    });

    this.server.emit('presence_update', {
      userId: data.userId,
      status: 'online',
      onlineCount: this.onlineUsers.size,
    });
  }

  @SubscribeMessage('join_ticket')
  handleJoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string; user: { id: string; name: string; role: string } },
  ) {
    if (!data?.ticketId) return;

    const roomName = `ticket_${data.ticketId}`;
    client.join(roomName);
    this.logger.log(`📥 ${data.user?.name || 'Client'} joined room: ${roomName}`);

    // Notify room that user has joined / active
    client.to(roomName).emit('user_joined_room', {
      ticketId: data.ticketId,
      user: data.user,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('leave_ticket')
  handleLeaveTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string; user?: { id: string; name: string } },
  ) {
    if (!data?.ticketId) return;

    const roomName = `ticket_${data.ticketId}`;
    client.leave(roomName);
    client.to(roomName).emit('user_left_room', {
      ticketId: data.ticketId,
      user: data.user,
    });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      ticketId: string;
      message: string;
      senderId: string;
      senderRole: string;
      isInternalNote?: boolean;
      attachments?: string;
    },
  ) {
    try {
      const roomName = `ticket_${data.ticketId}`;

      // Persist to database
      const result = await this.supportService.addMessage(
        data.ticketId,
        data.senderId,
        data.senderRole,
        {
          message: data.message,
          isInternalNote: data.isInternalNote ?? false,
          attachments: data.attachments,
        },
      );

      // Stop typing immediately when sent
      client.to(roomName).emit('user_typing', {
        ticketId: data.ticketId,
        userId: data.senderId,
        isTyping: false,
      });

      // Broadcast to room
      this.server.to(roomName).emit('new_message', {
        ticketId: data.ticketId,
        message: result.message,
        ticket: result.ticket,
      });

      // Also broadcast global ticket update event so admin queue counters update
      this.server.emit('ticket_activity', {
        ticketId: data.ticketId,
        lastMessage: result.message.message,
        senderRole: result.message.senderRole,
        lastMessageAt: result.ticket.lastMessageAt,
        status: result.ticket.status,
      });

      return { success: true, message: result.message };
    } catch (err) {
      this.logger.error(`Error sending message: ${err.message}`);
      client.emit('error', { message: err.message });
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string; user: { id: string; name: string; role: string } },
  ) {
    if (!data?.ticketId || !data?.user) return;

    const roomName = `ticket_${data.ticketId}`;
    const timeoutKey = `${data.ticketId}_${data.user.id}`;

    // Clear any previous timeout
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
    }

    // Broadcast typing to other sockets in room
    client.to(roomName).emit('user_typing', {
      ticketId: data.ticketId,
      user: data.user,
      isTyping: true,
    });

    // Auto-expire typing status after 4 seconds of inactivity
    const timeout = setTimeout(() => {
      client.to(roomName).emit('user_typing', {
        ticketId: data.ticketId,
        user: data.user,
        isTyping: false,
      });
      this.typingTimeouts.delete(timeoutKey);
    }, 4000);

    this.typingTimeouts.set(timeoutKey, timeout);
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string; user: { id: string; name: string } },
  ) {
    if (!data?.ticketId || !data?.user) return;

    const roomName = `ticket_${data.ticketId}`;
    const timeoutKey = `${data.ticketId}_${data.user.id}`;

    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
      this.typingTimeouts.delete(timeoutKey);
    }

    client.to(roomName).emit('user_typing', {
      ticketId: data.ticketId,
      user: data.user,
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
      adminUser: { id: string; name: string };
    },
  ) {
    try {
      const updated = await this.supportService.assignTicket(
        data.ticketId,
        data.assignedToId,
        data.adminUser,
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
    } catch (err) {
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
      adminUser: { id: string; name: string };
    },
  ) {
    try {
      const updated = await this.supportService.updateTicketStatus(
        data.ticketId,
        data.status,
        data.adminUser,
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
    } catch (err) {
      client.emit('error', { message: err.message });
      return { success: false, error: err.message };
    }
  }
}
