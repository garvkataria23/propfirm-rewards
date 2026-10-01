import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { PointsService } from './points.service';
import { AdminAdjustPointsDto } from './dto/points.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getUserSummary(@CurrentUser('id') userId: string) {
    return this.pointsService.getUserSummary(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ledger')
  async getUserLedger(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.pointsService.getUserLedger(
      userId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/adjust/:userId')
  async adminAdjustPoints(
    @Param('userId') targetUserId: string,
    @Body() dto: AdminAdjustPointsDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.pointsService.adminAdjustPoints(targetUserId, dto, adminId);
  }
}
