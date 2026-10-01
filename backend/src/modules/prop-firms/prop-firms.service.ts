import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropFirmDto, UpdatePropFirmDto, CreateOfferDto, UpdateOfferDto } from './dto/prop-firm.dto';

@Injectable()
export class PropFirmsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    return this.prisma.propFirm.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        offers: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findBySlugOrId(identifier: string, includeInactive = false) {
    const propFirm = await this.prisma.propFirm.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        offers: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!propFirm) {
      throw new NotFoundException(`Prop Firm '${identifier}' not found`);
    }

    return propFirm;
  }

  // Admin Operations
  async createPropFirm(dto: CreatePropFirmDto, adminId: string) {
    const existing = await this.prisma.propFirm.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Prop Firm slug '${dto.slug}' already exists`);
    }

    const created = await this.prisma.propFirm.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        logoUrl: dto.logoUrl,
        description: dto.description,
        websiteUrl: dto.websiteUrl,
        affiliateCode: dto.affiliateCode,
        affiliateUrl: dto.affiliateUrl,
        eligibilityTerms: dto.eligibilityTerms,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { offers: true },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'CREATE_PROP_FIRM',
        entity: 'PropFirm',
        entityId: created.id,
        newValue: JSON.stringify(created),
        notes: `Created prop firm: ${created.name}`,
      },
    });

    return created;
  }

  async updatePropFirm(id: string, dto: UpdatePropFirmDto, adminId: string) {
    const existing = await this.prisma.propFirm.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Prop firm not found');
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.propFirm.findUnique({ where: { slug: dto.slug } });
      if (slugExists) {
        throw new ConflictException(`Slug '${dto.slug}' is already taken`);
      }
    }

    const updated = await this.prisma.propFirm.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.description && { description: dto.description }),
        ...(dto.websiteUrl && { websiteUrl: dto.websiteUrl }),
        ...(dto.affiliateCode && { affiliateCode: dto.affiliateCode }),
        ...(dto.affiliateUrl && { affiliateUrl: dto.affiliateUrl }),
        ...(dto.eligibilityTerms !== undefined && { eligibilityTerms: dto.eligibilityTerms }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
      include: { offers: true },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'UPDATE_PROP_FIRM',
        entity: 'PropFirm',
        entityId: id,
        previousValue: JSON.stringify(existing),
        newValue: JSON.stringify(updated),
        notes: `Updated prop firm: ${updated.name}`,
      },
    });

    return updated;
  }

  async deletePropFirm(id: string, adminId: string) {
    const existing = await this.prisma.propFirm.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Prop firm not found');
    }

    // Soft delete / disable or hard delete if no active submissions
    const submissionCount = await this.prisma.purchaseSubmission.count({ where: { propFirmId: id } });

    if (submissionCount > 0) {
      const disabled = await this.prisma.propFirm.update({
        where: { id },
        data: { isActive: false },
      });

      await this.prisma.auditLog.create({
        data: {
          adminId,
          action: 'DEACTIVATE_PROP_FIRM',
          entity: 'PropFirm',
          entityId: id,
          notes: `Deactivated prop firm with ${submissionCount} existing submissions: ${existing.name}`,
        },
      });

      return { message: 'Prop firm has historical submissions so it was deactivated rather than permanently deleted', propFirm: disabled };
    }

    await this.prisma.propFirmOffer.deleteMany({ where: { propFirmId: id } });
    await this.prisma.propFirm.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'DELETE_PROP_FIRM',
        entity: 'PropFirm',
        entityId: id,
        previousValue: JSON.stringify(existing),
        notes: `Deleted prop firm: ${existing.name}`,
      },
    });

    return { message: 'Prop firm and offers deleted successfully' };
  }

  // Offers
  async createOffer(propFirmId: string, dto: CreateOfferDto, adminId: string) {
    const propFirm = await this.prisma.propFirm.findUnique({ where: { id: propFirmId } });
    if (!propFirm) {
      throw new NotFoundException('Prop firm not found');
    }

    const offer = await this.prisma.propFirmOffer.create({
      data: {
        propFirmId,
        accountTierName: dto.accountTierName,
        purchasePriceUsd: dto.purchasePriceUsd,
        rewardPoints: dto.rewardPoints,
        description: dto.description,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'CREATE_OFFER',
        entity: 'PropFirmOffer',
        entityId: offer.id,
        newValue: JSON.stringify(offer),
        notes: `Added offer '${offer.accountTierName}' (${offer.rewardPoints} pts) for ${propFirm.name}`,
      },
    });

    return offer;
  }

  async updateOffer(offerId: string, dto: UpdateOfferDto, adminId: string) {
    const existing = await this.prisma.propFirmOffer.findUnique({ where: { id: offerId } });
    if (!existing) {
      throw new NotFoundException('Offer not found');
    }

    const updated = await this.prisma.propFirmOffer.update({
      where: { id: offerId },
      data: {
        ...(dto.accountTierName && { accountTierName: dto.accountTierName }),
        ...(dto.purchasePriceUsd !== undefined && { purchasePriceUsd: dto.purchasePriceUsd }),
        ...(dto.rewardPoints !== undefined && { rewardPoints: dto.rewardPoints }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'UPDATE_OFFER',
        entity: 'PropFirmOffer',
        entityId: offerId,
        previousValue: JSON.stringify(existing),
        newValue: JSON.stringify(updated),
        notes: `Updated offer '${updated.accountTierName}'`,
      },
    });

    return updated;
  }

  async deleteOffer(offerId: string, adminId: string) {
    const existing = await this.prisma.propFirmOffer.findUnique({ where: { id: offerId } });
    if (!existing) {
      throw new NotFoundException('Offer not found');
    }

    await this.prisma.propFirmOffer.delete({ where: { id: offerId } });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'DELETE_OFFER',
        entity: 'PropFirmOffer',
        entityId: offerId,
        previousValue: JSON.stringify(existing),
        notes: `Deleted offer '${existing.accountTierName}'`,
      },
    });

    return { message: 'Offer deleted successfully' };
  }
}
