import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { PropFirmsService } from './prop-firms.service';
import { CreatePropFirmDto, UpdatePropFirmDto, CreateOfferDto, UpdateOfferDto } from './dto/prop-firm.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('prop-firms')
export class PropFirmsController {
  constructor(private readonly propFirmsService: PropFirmsService) {}

  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.propFirmsService.findAll(includeInactive === 'true');
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string, @Query('includeInactive') includeInactive?: string) {
    return this.propFirmsService.findBySlugOrId(identifier, includeInactive === 'true');
  }

  // Admin routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async createPropFirm(@Body() dto: CreatePropFirmDto, @CurrentUser('id') adminId: string) {
    return this.propFirmsService.createPropFirm(dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async updatePropFirm(@Param('id') id: string, @Body() dto: UpdatePropFirmDto, @CurrentUser('id') adminId: string) {
    return this.propFirmsService.updatePropFirm(id, dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deletePropFirm(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.propFirmsService.deletePropFirm(id, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/offers')
  async createOffer(@Param('id') propFirmId: string, @Body() dto: CreateOfferDto, @CurrentUser('id') adminId: string) {
    return this.propFirmsService.createOffer(propFirmId, dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('offers/:offerId')
  async updateOffer(@Param('offerId') offerId: string, @Body() dto: UpdateOfferDto, @CurrentUser('id') adminId: string) {
    return this.propFirmsService.updateOffer(offerId, dto, adminId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('offers/:offerId')
  async deleteOffer(@Param('offerId') offerId: string, @CurrentUser('id') adminId: string) {
    return this.propFirmsService.deleteOffer(offerId, adminId);
  }
}
