import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards, Query, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { PurchasesService } from './purchases.service';
import { SubmitPurchaseDto, ApprovePurchaseDto, RejectPurchaseDto, RequestInfoPurchaseDto, ResubmitPurchaseDto, AdminCreatePurchaseDto, AdminUpdatePurchaseDto } from './dto/purchase.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const ALLOWED_PROOF_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const ALLOWED_PROOF_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

export const proofUploadOptions = {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_PROOF_MIMES.has(file.mimetype) || !ALLOWED_PROOF_EXTS.has(ext)) {
      return callback(
        new BadRequestException(
          `Invalid file format: "${file.mimetype}" (${ext}). Only JPEG, PNG, WEBP, and PDF documents are allowed.`,
        ),
        false,
      );
    }
    callback(null, true);
  },
};

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('proofs', 5, proofUploadOptions))
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
  @UseInterceptors(FilesInterceptor('proofs', 5, proofUploadOptions))
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
  @Post('admin/create')
  async adminCreateSubmission(
    @Body() dto: AdminCreatePurchaseDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.purchasesService.adminCreateSubmission(dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('admin/:id')
  async adminUpdateSubmission(
    @Param('id') id: string,
    @Body() dto: AdminUpdatePurchaseDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.purchasesService.adminUpdateSubmission(id, dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/:id')
  async adminDeleteSubmission(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.purchasesService.adminDeleteSubmission(id, adminId);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/reconcile-csv')
  async reconcileBulkCsv(
    @Body('rows') rows: any[],
    @CurrentUser('id') adminId: string,
  ) {
    return this.purchasesService.reconcileBulkCsv(rows, adminId);
  }
}
