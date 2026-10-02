import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto, SendMessageDto, TicketStatus, UpdateUserRoleDto } from './support.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    const count = await this.prisma.supportTicket.count();
    const ticketNumber = `TICK-${1000 + count + 1}`;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        subject: dto.subject,
        department: dto.department || 'GENERAL',
        priority: dto.priority || 'MEDIUM',
        status: TicketStatus.OPEN,
        lastMessageAt: new Date(),
        messages: {
          create: {
            senderId: userId,
            senderRole: 'USER',
            message: dto.message,
            isInternalNote: false,
          },
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, role: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return ticket;
  }

  async getAdminTickets(filters?: {
    status?: string;
    department?: string;
    priority?: string;
    assignedToId?: string;
    unassigned?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters?.department && filters.department !== 'ALL') {
      where.department = filters.department;
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      where.priority = filters.priority;
    }
    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }
    if (filters?.unassigned) {
      where.assignedToId = null;
    }
    if (filters?.search) {
      where.OR = [
        { ticketNumber: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.supportTicket.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { message: true, createdAt: true, senderRole: true, isInternalNote: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        assignedTo: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
        messages: {
          where: { isInternalNote: false },
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { message: true, createdAt: true, senderRole: true },
        },
        _count: {
          select: { messages: { where: { isInternalNote: false } } },
        },
      },
    });
  }

  async getTicketById(ticketId: string, currentUserId: string, currentUserRole: string) {
    const isStaff = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'].includes(currentUserRole);

    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            country: true,
            createdAt: true,
            pointsLedger: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { balanceAfter: true },
            },
            submissions: {
              take: 3,
              orderBy: { createdAt: 'desc' },
              select: { id: true, submissionCode: true, status: true, purchaseAmountUsd: true },
            },
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true, department: true, avatarUrl: true },
        },
        messages: {
          where: isStaff ? undefined : { isInternalNote: false },
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, name: true, role: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (!isStaff && ticket.userId !== currentUserId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    return ticket;
  }

  async addMessage(
    ticketId: string,
    senderId: string,
    senderRole: string,
    dto: SendMessageDto,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const isStaff = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'].includes(senderRole);
    if (!isStaff && ticket.userId !== senderId) {
      throw new ForbiddenException('Access denied');
    }

    // Trader cannot create internal notes
    const isInternal = isStaff ? (dto.isInternalNote ?? false) : false;

    // Auto-update ticket status:
    // If staff replies to trader, set to WAITING_TRADER (unless it was already closed or internal note)
    // If trader replies, set to IN_PROGRESS
    let newStatus = ticket.status;
    if (!isInternal) {
      if (isStaff && ticket.status === 'OPEN') {
        newStatus = TicketStatus.IN_PROGRESS;
      } else if (!isStaff && (ticket.status === 'WAITING_TRADER' || ticket.status === 'OPEN')) {
        newStatus = TicketStatus.IN_PROGRESS;
      }
    }

    const [message, updatedTicket] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          ticketId,
          senderId,
          senderRole: isStaff ? senderRole : 'USER',
          message: dto.message,
          isInternalNote: isInternal,
          attachments: dto.attachments,
        },
        include: {
          sender: {
            select: { id: true, name: true, role: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          lastMessageAt: new Date(),
          status: newStatus,
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, role: true, avatarUrl: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return { message, ticket: updatedTicket };
  }

  async assignTicket(ticketId: string, assignedToId: string | null, adminUser: { id: string; name: string }) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { assignedTo: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    let assignedUser: any = null;
    if (assignedToId) {
      assignedUser = await this.prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      });
      if (!assignedUser) {
        throw new NotFoundException('Assigned agent not found');
      }
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToId,
        status: assignedToId && ticket.status === 'OPEN' ? TicketStatus.IN_PROGRESS : ticket.status,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create system notification message
    const assignText = assignedUser
      ? `System: Ticket assigned to ${assignedUser.name} (${assignedUser.role}) by ${adminUser.name}.`
      : `System: Ticket unassigned by ${adminUser.name}.`;

    await this.prisma.chatMessage.create({
      data: {
        ticketId,
        senderId: adminUser.id,
        senderRole: 'SYSTEM',
        message: assignText,
        isInternalNote: true,
      },
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        adminId: adminUser.id,
        action: 'ASSIGN_SUPPORT_TICKET',
        entity: 'SupportTicket',
        entityId: ticketId,
        previousValue: ticket.assignedTo?.name || 'Unassigned',
        newValue: assignedUser?.name || 'Unassigned',
        notes: `Ticket ${ticket.ticketNumber} reassigned`,
      },
    });

    return updated;
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, adminUser: { id: string; name: string }) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Add status message
    await this.prisma.chatMessage.create({
      data: {
        ticketId,
        senderId: adminUser.id,
        senderRole: 'SYSTEM',
        message: `System: Ticket status updated to ${status} by ${adminUser.name}.`,
        isInternalNote: false,
      },
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        adminId: adminUser.id,
        action: 'UPDATE_TICKET_STATUS',
        entity: 'SupportTicket',
        entityId: ticketId,
        previousValue: ticket.status,
        newValue: status,
      },
    });

    return updated;
  }

  // TEAM & ROLE MANAGEMENT (Super Admin & Admin)
  async getTeamMembers() {
    const staffRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_LEAD', 'SUPPORT_AGENT', 'FINANCE_OFFICER'];
    const members = await this.prisma.user.findMany({
      where: {
        role: { in: staffRoles },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        permissions: true,
        avatarUrl: true,
        phone: true,
        country: true,
        createdAt: true,
        _count: {
          select: {
            assignedTickets: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((m) => ({
      ...m,
      permissions: m.permissions ? JSON.parse(m.permissions) : [],
    }));
  }

  async updateUserRoleAndPermissions(
    targetUserId: string,
    dto: UpdateUserRoleDto,
    adminUser: { id: string; name: string; role: string },
  ) {
    // Only SUPER_ADMIN and ADMIN can assign roles
    if (!['SUPER_ADMIN', 'ADMIN'].includes(adminUser.role)) {
      throw new ForbiddenException('Only Admins can assign roles and manage team permissions');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const permissionsString = dto.permissions ? JSON.stringify(dto.permissions) : null;

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: dto.role,
        department: dto.department || targetUser.department,
        permissions: permissionsString,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        permissions: true,
        avatarUrl: true,
      },
    });

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        adminId: adminUser.id,
        action: 'UPDATE_USER_ROLE_AND_PERMISSIONS',
        entity: 'User',
        entityId: targetUserId,
        previousValue: `Role: ${targetUser.role}, Dept: ${targetUser.department || 'None'}`,
        newValue: `Role: ${dto.role}, Dept: ${dto.department || 'None'}, Permissions: ${dto.permissions?.join(',') || 'Default'}`,
        notes: `Admin ${adminUser.name} modified role for ${targetUser.name} (${targetUser.email})`,
      },
    });

    return {
      ...updated,
      permissions: updated.permissions ? JSON.parse(updated.permissions) : [],
    };
  }
}
