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
