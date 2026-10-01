import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PurchasesService } from './purchases.service';
import { SubmitPurchaseDto, ApprovePurchaseDto, RejectPurchaseDto, RequestInfoPurchaseDto, ResubmitPurchaseDto } from './dto/purchase.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('proofs', 5, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async submitPurchase(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitPurchaseDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // When sent as multipart form-data, purchaseAmountUsd may be string
    if (dto.purchaseAmountUsd && typeof dto.purchaseAmountUsd === 'string') {
      dto.purchaseAmountUsd = parseFloat(dto.purchaseAmountUsd);
    }
    return this.purchasesService.submitPurchase(userId, dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserPurchases(@CurrentUser('id') userId: string) {
    return this.purchasesService.getUserPurchases(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserPurchaseById(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.purchasesService.getUserPurchaseById(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/resubmit')
  @UseInterceptors(FilesInterceptor('proofs', 5, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async resubmitPurchase(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ResubmitPurchaseDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.purchasesService.resubmitPurchase(userId, id, dto, files);
  }

  // Admin routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  async getAdminPurchases(
    @Query('status') status?: string,
    @Query('propFirmId') propFirmId?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
  ) {
    return this.purchasesService.getAdminPurchases({ status, propFirmId, userId, search });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id')
  async getAdminPurchaseById(@Param('id') id: string) {
    return this.purchasesService.getAdminPurchaseById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/:id/approve')
  async approvePurchase(
    @Param('id') id: string,
    @Body() dto: ApprovePurchaseDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.purchasesService.approvePurchase(id, dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/:id/reject')
  async rejectPurchase(
    @Param('id') id: string,
    @Body() dto: RejectPurchaseDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.purchasesService.rejectPurchase(id, dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/:id/request-info')
  async requestMoreInfo(
    @Param('id') id: string,
    @Body() dto: RequestInfoPurchaseDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.purchasesService.requestMoreInfo(id, dto, adminId);
  }
}
