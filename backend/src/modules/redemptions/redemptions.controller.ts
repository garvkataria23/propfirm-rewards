import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { UpdateRedemptionStatusDto } from '../rewards/dto/reward.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('redemptions')
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserRedemptions(@CurrentUser('id') userId: string) {
    return this.redemptionsService.getUserRedemptions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserRedemptionById(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.redemptionsService.getUserRedemptionById(userId, id);
  }

  // Admin routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  async getAdminRedemptions(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
  ) {
    return this.redemptionsService.getAdminRedemptions({ status, userId, search });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id')
  async getAdminRedemptionById(@Param('id') id: string) {
    return this.redemptionsService.getAdminRedemptionById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRedemptionStatusDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.redemptionsService.updateStatus(id, dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/:id')
  async adminDeleteRedemption(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.redemptionsService.adminDeleteRedemption(id, adminId);
  }
}

