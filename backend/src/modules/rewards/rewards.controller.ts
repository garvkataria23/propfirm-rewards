import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, Header } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto, UpdateRewardDto, RedeemRewardDto } from './dto/reward.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('categories')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300')
  async getCategories() {
    return this.rewardsService.getCategories();
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  async findAll(
    @Query('category') categorySlug?: string,
    @Query('search') search?: string,
    @Query('inStockOnly') inStockOnly?: string,
  ) {
    return this.rewardsService.findAll({
      categorySlug,
      search,
      inStockOnly: inStockOnly === 'true',
    });
  }

  @Get(':identifier')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  async findOne(@Param('identifier') identifier: string) {
    return this.rewardsService.findBySlugOrId(identifier);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/redeem')
  async redeemReward(
    @CurrentUser('id') userId: string,
    @Param('id') rewardId: string,
    @Body() dto: RedeemRewardDto,
  ) {
    return this.rewardsService.redeemReward(userId, rewardId, dto);
  }

  // Admin routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  async adminGetAll(@Query('includeInactive') includeInactive?: string) {
    return this.rewardsService.adminGetAll(includeInactive !== 'false');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin')
  async adminCreateReward(
    @Body() dto: CreateRewardDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.rewardsService.adminCreateReward(dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('admin/:id')
  async adminUpdateReward(
    @Param('id') id: string,
    @Body() dto: UpdateRewardDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.rewardsService.adminUpdateReward(id, dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/:id')
  async adminDeleteReward(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.rewardsService.adminDeleteReward(id, adminId);
  }
}
