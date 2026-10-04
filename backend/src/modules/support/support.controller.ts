import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupportService } from './support.service';
import {
  CreateTicketDto,
  SendMessageDto,
  AssignTicketDto,
  UpdateTicketStatusDto,
  UpdateUserRoleDto,
} from './support.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Support & Live Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create a new support ticket' })
  async createTicket(@CurrentUser() user: any, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(user.id, dto);
  }

  @Get('my-tickets')
  @ApiOperation({ summary: 'Get current user tickets' })
  async getMyTickets(@CurrentUser() user: any) {
    return this.supportService.getUserTickets(user.id);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket details and chat history' })
  async getTicketById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.supportService.getTicketById(id, user.id, user.role);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Send a message in a support ticket' })
  async sendMessage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.supportService.addMessage(id, user.id, user.role, dto);
  }

  // --- STAFF & ADMIN DESK ENDPOINTS ---

  @Get('admin/tickets')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER')
  @ApiOperation({ summary: 'List all support tickets with filters (Staff only)' })
  async getAdminTickets(
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('priority') priority?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('unassigned') unassigned?: string,
    @Query('search') search?: string,
  ) {
    return this.supportService.getAdminTickets({
      status,
      department,
      priority,
      assignedToId,
      unassigned: unassigned === 'true',
      search,
    });
  }

  @Patch('admin/tickets/:id/assign')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT')
  @ApiOperation({ summary: 'Assign a ticket to an agent' })
  async assignTicket(
    @CurrentUser() adminUser: any,
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
  ) {
    return this.supportService.assignTicket(id, dto.assignedToId || null, adminUser);
  }

  @Patch('admin/tickets/:id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT')
  @ApiOperation({ summary: 'Update ticket status' })
  async updateStatus(
    @CurrentUser() adminUser: any,
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.supportService.updateTicketStatus(id, dto.status, adminUser);
  }

  // --- TEAM ROLE MANAGEMENT (Super Admin & Admin Only) ---

  @Get('admin/team')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD')
  @ApiOperation({ summary: 'List all staff members and their roles' })
  async getTeamMembers() {
    return this.supportService.getTeamMembers();
  }

  @Patch('admin/team/:userId/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Super Admin: Assign user role, department & permissions' })
  async updateUserRole(
    @CurrentUser() adminUser: any,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.supportService.updateUserRoleAndPermissions(
      targetUserId,
      dto,
      adminUser,
    );
  }
}

// ============================================================================
// PUBLIC / CROSS-DEVICE LIVE CHAT SYNC CONTROLLER (FOR VERCEL + RENDER)
// ============================================================================
const globalRenderChatStore = globalThis as unknown as {
  __pnRenderLiveChatTickets?: Map<string, any>;
  __pnRenderLiveChatMessages?: Map<string, any[]>;
};

if (!globalRenderChatStore.__pnRenderLiveChatTickets) {
  globalRenderChatStore.__pnRenderLiveChatTickets = new Map<string, any>();
}
if (!globalRenderChatStore.__pnRenderLiveChatMessages) {
  globalRenderChatStore.__pnRenderLiveChatMessages = new Map<string, any[]>();
}

const renderTicketsMap = globalRenderChatStore.__pnRenderLiveChatTickets;
const renderMessagesMap = globalRenderChatStore.__pnRenderLiveChatMessages;

@ApiTags('Support & Live Chat Sync')
@Controller('support/live-chat-sync')
export class LiveChatSyncController {
  @Get()
  @ApiOperation({ summary: 'Get real-time synced live chat tickets or messages (Vercel <-> Render)' })
  getLiveChatSync(
    @Query('ticketId') ticketId?: string,
    @Query('userId') userId?: string,
  ) {
    if (ticketId) {
      const ticket = renderTicketsMap.get(ticketId) || null;
      const messages = renderMessagesMap.get(ticketId) || [];
      return { ticket, messages };
    }

    let tickets = Array.from(renderTicketsMap.values());
    if (userId) {
      tickets = tickets.filter((t) => t.userId === userId);
    }
    tickets.sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));

    return { tickets };
  }

  @Post()
  @ApiOperation({ summary: 'Sync live chat ticket, message, typing, or seen status on Render' })
  postLiveChatSync(@Body() body: any) {
    const { action, ticket, message, ticketId, updates, viewerRole } = body || {};

    if (action === 'UPSERT_TICKET' && ticket?.id) {
      const existing = renderTicketsMap.get(ticket.id);
      const merged = { ...(existing || {}), ...ticket };
      renderTicketsMap.set(ticket.id, merged);

      if (message && message.id) {
        const list = renderMessagesMap.get(ticket.id) || [];
        if (!list.some((m) => m.id === message.id)) {
          list.push(message);
          list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
          renderMessagesMap.set(ticket.id, list);
        }
      }
      return { ok: true, ticket: merged };
    }

    if (action === 'SEND_MESSAGE' && message?.ticketId && message?.id) {
      const tId = message.ticketId;
      const list = renderMessagesMap.get(tId) || [];
      const existingIdx = list.findIndex((m) => m.id === message.id);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...message };
      } else {
        list.push(message);
      }
      list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      renderMessagesMap.set(tId, list);

      if (updates && renderTicketsMap.has(tId)) {
        const existingTicket = renderTicketsMap.get(tId)!;
        renderTicketsMap.set(tId, { ...existingTicket, ...updates });
      } else if (ticket && ticket.id === tId) {
        renderTicketsMap.set(tId, {
          ...(renderTicketsMap.get(tId) || {}),
          ...ticket,
          ...(updates || {}),
        });
      }

      return { ok: true, message };
    }

    if (action === 'UPDATE_TICKET' && ticketId && updates) {
      const existing = renderTicketsMap.get(ticketId);
      if (existing) {
        renderTicketsMap.set(ticketId, { ...existing, ...updates });
      }
      if (message && message.id) {
        const list = renderMessagesMap.get(ticketId) || [];
        if (!list.some((m) => m.id === message.id)) {
          list.push(message);
          renderMessagesMap.set(ticketId, list);
        }
      }
      return { ok: true };
    }

    if (action === 'MARK_SEEN' && ticketId) {
      const nowIso = new Date().toISOString();
      const list = renderMessagesMap.get(ticketId) || [];
      const updatedList = list.map((m) => {
        const isFromTrader = m.senderRole === 'USER';
        if (
          (viewerRole === 'USER' && !isFromTrader && m.status !== 'SEEN') ||
          (viewerRole === 'ADMIN' && isFromTrader && m.status !== 'SEEN')
        ) {
          return { ...m, status: 'SEEN', seenAt: nowIso };
        }
        return m;
      });
      renderMessagesMap.set(ticketId, updatedList);

      const existing = renderTicketsMap.get(ticketId);
      if (existing) {
        renderTicketsMap.set(ticketId, {
          ...existing,
          ...(viewerRole === 'USER' ? { unreadByUser: 0 } : { unreadByAdmin: 0 }),
        });
      }
      return { ok: true };
    }

    return { ok: true };
  }
}

