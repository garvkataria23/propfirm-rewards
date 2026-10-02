import { Injectable, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { SubmitPurchaseDto, ApprovePurchaseDto, RejectPurchaseDto, RequestInfoPurchaseDto, ResubmitPurchaseDto, AdminCreatePurchaseDto, AdminUpdatePurchaseDto } from './dto/purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private emailService: EmailService,
    private whatsappService: WhatsAppService,
  ) {}

  async submitPurchase(
    userId: string,
    dto: SubmitPurchaseDto,
    files?: Express.Multer.File[],
  ) {
    // 1. Verify Prop Firm exists
    const propFirm = await this.prisma.propFirm.findUnique({
      where: { id: dto.propFirmId },
    });
    if (!propFirm) {
      throw new BadRequestException('Selected prop firm does not exist');
    }

    // 2. Anti-Fraud & Duplicate Detection: check for same orderId on the same prop firm
    const cleanOrderId = dto.orderId.trim();
    const existingDuplicate = await this.prisma.purchaseSubmission.findFirst({
      where: {
        propFirmId: dto.propFirmId,
        orderId: cleanOrderId,
      },
    });

    if (existingDuplicate) {
      if (existingDuplicate.status === 'APPROVED') {
        throw new ConflictException(
          `This Order ID (${cleanOrderId}) has already been verified and credited previously. Duplicate submissions are not allowed.`,
        );
      }
      if (existingDuplicate.status === 'PENDING' || existingDuplicate.status === 'UNDER_REVIEW') {
        throw new ConflictException(
          `A submission with Order ID (${cleanOrderId}) is already currently under review.`,
        );
      }
    }

    // 3. Resolve Points to offer
    let pointsAwarded = 0;
    if (dto.offerId) {
      const offer = await this.prisma.propFirmOffer.findUnique({
        where: { id: dto.offerId },
      });
      if (offer) {
        pointsAwarded = offer.rewardPoints;
      }
    }

    // 1$ = 10 points rule
    if (pointsAwarded === 0 && dto.purchaseAmountUsd > 0) {
      pointsAwarded = Math.round(dto.purchaseAmountUsd * 10);
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const submissionCode = `PN-PUR-${randomSuffix}`;

    // 4. Create submission in database
    const submission = await this.prisma.purchaseSubmission.create({
      data: {
        submissionCode,
        userId,
        propFirmId: dto.propFirmId,
        offerId: dto.offerId || null,
        accountType: dto.accountType,
        orderId: cleanOrderId,
        accountId: dto.accountId?.trim() || null,
        purchaseDate: new Date(dto.purchaseDate),
        purchaseAmountUsd: Number(dto.purchaseAmountUsd),
        emailUsed: dto.emailUsed.trim(),
        referralCodeUsed: dto.referralCodeUsed.trim(),
        notes: dto.notes?.trim() || null,
        status: 'PENDING',
        fraudStatus: existingDuplicate ? 'FLAGGED' : 'NORMAL',
        pointsAwarded,
      },
      include: {
        propFirm: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // 5. Upload Proofs if provided
    if (files && files.length > 0) {
      for (const file of files) {
        const upload = await this.storageService.uploadFile(file, 'proofs');
        await this.prisma.purchaseProof.create({
          data: {
            submissionId: submission.id,
            fileUrl: upload.url,
            fileName: upload.fileName,
            fileType: upload.mimeType,
            fileSize: upload.size,
          },
        });
      }
    }

    // 6. User notification
    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Purchase Submitted',
        message: `Your purchase submission (${submission.submissionCode}) for ${propFirm.name} is now pending review.`,
        type: 'PURCHASE',
        linkUrl: `/dashboard/purchases/${submission.id}`,
      },
    });

    // 7. Send confirmation email
    this.emailService.sendPurchaseSubmittedEmail(
      submission.user.email,
      submission.user.name,
      submission.submissionCode,
      propFirm.name,
    ).catch(() => {});

    // 8. Send WhatsApp alert
    const recipientPhone = submission.user.phone;
    if (recipientPhone) {
      this.whatsappService.sendPurchaseSubmittedAlert(
        recipientPhone,
        submission.user.name,
        submission.submissionCode,
        propFirm.name,
        submission.orderId,
      ).catch(() => {});
    }

    return this.prisma.purchaseSubmission.findUnique({
      where: { id: submission.id },
      include: {
        propFirm: true,
        offer: true,
        proofs: true,
      },
    });
  }

  async getUserPurchases(userId: string) {
    return this.prisma.purchaseSubmission.findMany({
      where: { userId },
      include: {
        propFirm: true,
        offer: true,
        proofs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserPurchaseById(userId: string, id: string) {
    const submission = await this.prisma.purchaseSubmission.findFirst({
      where: { id, userId },
      include: {
        propFirm: true,
        offer: true,
        proofs: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Purchase submission not found');
    }

    return submission;
  }

  async resubmitPurchase(userId: string, id: string, dto: ResubmitPurchaseDto, files?: Express.Multer.File[]) {
    const submission = await this.prisma.purchaseSubmission.findFirst({
      where: { id, userId },
      include: { propFirm: true },
    });

    if (!submission) {
      throw new NotFoundException('Purchase submission not found');
    }

    if (submission.status !== 'MORE_INFO_REQUIRED') {
      throw new BadRequestException('Only submissions with "More Information Required" status can be resubmitted');
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const upload = await this.storageService.uploadFile(file, 'proofs');
        await this.prisma.purchaseProof.create({
          data: {
            submissionId: submission.id,
            fileUrl: upload.url,
            fileName: upload.fileName,
            fileType: upload.mimeType,
            fileSize: upload.size,
          },
        });
      }
    }

    const updated = await this.prisma.purchaseSubmission.update({
      where: { id },
      data: {
        userResubmissionNotes: dto.userResubmissionNotes,
        status: 'UNDER_REVIEW',
      },
      include: {
        propFirm: true,
        offer: true,
        proofs: true,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Information Resubmitted',
        message: `Your submission (${submission.submissionCode}) has been updated and is under review.`,
        type: 'PURCHASE',
        linkUrl: `/dashboard/purchases/${submission.id}`,
      },
    });

    return updated;
  }

  // Admin Operations
  async getAdminPurchases(query: {
    status?: string;
    propFirmId?: string;
    userId?: string;
    search?: string;
  }) {
    const { status, propFirmId, userId, search } = query;

    return this.prisma.purchaseSubmission.findMany({
      where: {
        ...(status && { status }),
        ...(propFirmId && { propFirmId }),
        ...(userId && { userId }),
        ...(search && {
          OR: [
            { submissionCode: { contains: search } },
            { orderId: { contains: search } },
            { accountId: { contains: search } },
            { emailUsed: { contains: search } },
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
          ],
        }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        propFirm: true,
        offer: true,
        proofs: true,
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminPurchaseById(id: string) {
    const submission = await this.prisma.purchaseSubmission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
            status: true,
            createdAt: true,
          },
        },
        propFirm: true,
        offer: true,
        proofs: true,
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Previous submissions by the same user to help review
    const userPreviousSubmissions = await this.prisma.purchaseSubmission.findMany({
      where: {
        userId: submission.userId,
        id: { not: id },
      },
      select: {
        id: true,
        submissionCode: true,
        propFirm: { select: { name: true } },
        orderId: true,
        status: true,
        pointsAwarded: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      ...submission,
      userPreviousSubmissions,
    };
  }

  async approvePurchase(id: string, dto: ApprovePurchaseDto, adminId: string) {
    const submission = await this.prisma.purchaseSubmission.findUnique({
      where: { id },
      include: {
        user: true,
        propFirm: true,
        offer: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.status === 'APPROVED') {
      throw new BadRequestException('This purchase has already been approved and credited');
    }

    // Calculate points: offer points or custom admin override points
    const pointsToAward = dto.customPoints !== undefined && dto.customPoints !== null
      ? Number(dto.customPoints)
      : (submission.pointsAwarded || submission.offer?.rewardPoints || Math.round(submission.purchaseAmountUsd * 10));

    if (pointsToAward <= 0) {
      throw new BadRequestException('Points awarded must be greater than zero');
    }

    // ATOMIC TRANSACTION: update submission + record points in ledger
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Get current balance
      const lastTx = await tx.pointsLedger.findFirst({
        where: { userId: submission.userId },
        orderBy: { createdAt: 'desc' },
        select: { balanceAfter: true },
      });

      const currentBalance = lastTx ? lastTx.balanceAfter : 0;
      const newBalance = currentBalance + pointsToAward;

      // 2. Update submission
      const updatedSubmission = await tx.purchaseSubmission.update({
        where: { id },
        data: {
          status: 'APPROVED',
          pointsAwarded: pointsToAward,
          reviewedById: adminId,
          reviewedAt: new Date(),
          notes: dto.notes ? `${submission.notes || ''} | Admin note: ${dto.notes}` : submission.notes,
        },
      });

      // 3. Create PointsLedger entry
      const ledgerEntry = await tx.pointsLedger.create({
        data: {
          userId: submission.userId,
          submissionId: submission.id,
          type: 'PURCHASE_REWARD',
          points: pointsToAward,
          balanceAfter: newBalance,
          description: `Verified ${submission.propFirm.name} purchase: ${submission.accountType} (Order: ${submission.orderId})`,
          createdById: adminId,
        },
      });

      // 4. Create Notification
      await tx.notification.create({
        data: {
          userId: submission.userId,
          title: 'Purchase Approved! 🎉',
          message: `Your ${submission.propFirm.name} purchase was approved. +${pointsToAward.toLocaleString()} points added to your balance.`,
          type: 'POINTS',
          linkUrl: '/dashboard/points',
        },
      });

      // 5. Create Audit Log
      await tx.auditLog.create({
        data: {
          adminId,
          action: 'APPROVE_PURCHASE',
          entity: 'PurchaseSubmission',
          entityId: id,
          previousValue: JSON.stringify({ status: submission.status }),
          newValue: JSON.stringify({ status: 'APPROVED', pointsAwarded: pointsToAward }),
          notes: dto.notes || `Approved by admin. Credited ${pointsToAward} points.`,
        },
      });

      return { updatedSubmission, ledgerEntry, newBalance };
    });

    // Send email notification
    this.emailService.sendPurchaseApprovedEmail(
      submission.user.email,
      submission.user.name,
      submission.submissionCode,
      pointsToAward,
      result.newBalance,
    ).catch(() => {});

    // Send WhatsApp notification
    if (submission.user.phone) {
      this.whatsappService.sendPurchaseApprovedAlert(
        submission.user.phone,
        submission.user.name,
        submission.submissionCode,
        submission.propFirm.name,
        pointsToAward,
        14,
      ).catch(() => {});
    }

    return result;
  }

  async reconcileBulkCsv(
    rows: Array<{ orderId: string; amount?: number; commission?: number; status?: string; propFirmSlug?: string }>,
    adminId: string,
  ) {
    if (!rows || rows.length === 0) {
      throw new BadRequestException('No CSV rows provided for reconciliation');
    }

    const matchedItems: any[] = [];
    const unmatchedItems: any[] = [];
    let newlyApprovedCount = 0;
    let alreadyApprovedCount = 0;

    for (const row of rows) {
      if (!row.orderId) continue;
      const cleanOrderId = String(row.orderId).trim();

      const submission = await this.prisma.purchaseSubmission.findFirst({
        where: {
          orderId: { equals: cleanOrderId, mode: 'insensitive' },
        },
        include: {
          user: true,
          propFirm: true,
          offer: true,
        },
      });

      if (!submission) {
        unmatchedItems.push({
          orderId: cleanOrderId,
          amount: row.amount,
          commission: row.commission,
          reason: 'No matching user submission found in database',
        });
        continue;
      }

      if (submission.status === 'APPROVED') {
        alreadyApprovedCount++;
        matchedItems.push({
          submissionId: submission.id,
          submissionCode: submission.submissionCode,
          orderId: cleanOrderId,
          traderName: submission.user.name,
          firmName: submission.propFirm.name,
          pointsAwarded: submission.pointsAwarded,
          status: 'ALREADY_APPROVED',
        });
        continue;
      }

      // Approve this submission atomically
      const pointsToAward =
        submission.pointsAwarded ||
        submission.offer?.rewardPoints ||
        Math.round(submission.purchaseAmountUsd * 10);

      await this.prisma.$transaction(async (tx) => {
        const lastTx = await tx.pointsLedger.findFirst({
          where: { userId: submission.userId },
          orderBy: { createdAt: 'desc' },
          select: { balanceAfter: true },
        });

        const currentBalance = lastTx ? lastTx.balanceAfter : 0;
        const newBalance = currentBalance + pointsToAward;

        await tx.purchaseSubmission.update({
          where: { id: submission.id },
          data: {
            status: 'APPROVED',
            pointsAwarded: pointsToAward,
            reviewedById: adminId,
            reviewedAt: new Date(),
            notes: row.commission ? `Reconciled via CSV with Commission: $${row.commission}` : 'Reconciled via CSV',
          },
        });

        await tx.pointsLedger.create({
          data: {
            userId: submission.userId,
            submissionId: submission.id,
            type: 'PURCHASE_REWARD',
            points: pointsToAward,
            balanceAfter: newBalance,
            description: `Batch CSV Reconciled: ${submission.propFirm.name} - ${submission.accountType}`,
            createdById: adminId,
          },
        });

        await tx.notification.create({
          data: {
            userId: submission.userId,
            title: 'Purchase Approved via Partner Reconciliation! 🎉',
            message: `Your ${submission.propFirm.name} purchase (${submission.orderId}) was matched and approved! +${pointsToAward.toLocaleString()} PTS added.`,
            type: 'POINTS',
            linkUrl: '/dashboard/points',
          },
        });
      });

      newlyApprovedCount++;

      // Trigger notifications
      if (submission.user.phone) {
        this.whatsappService.sendPurchaseApprovedAlert(
          submission.user.phone,
          submission.user.name,
          submission.submissionCode,
          submission.propFirm.name,
          pointsToAward,
          14,
        ).catch(() => {});
      }

      this.emailService.sendPurchaseApprovedEmail(
        submission.user.email,
        submission.user.name,
        submission.submissionCode,
        pointsToAward,
        0,
      ).catch(() => {});

      matchedItems.push({
        submissionId: submission.id,
        submissionCode: submission.submissionCode,
        orderId: cleanOrderId,
        traderName: submission.user.name,
        firmName: submission.propFirm.name,
        pointsAwarded: pointsToAward,
        status: 'NEWLY_APPROVED',
      });
    }

    return {
      totalRows: rows.length,
      matchedCount: matchedItems.length,
      newlyApprovedCount,
      alreadyApprovedCount,
      unmatchedCount: unmatchedItems.length,
      matchedItems,
      unmatchedItems,
    };
  }

  async rejectPurchase(id: string, dto: RejectPurchaseDto, adminId: string) {
    const submission = await this.prisma.purchaseSubmission.findUnique({
      where: { id },
      include: { user: true, propFirm: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.status === 'APPROVED') {
      throw new BadRequestException('Cannot reject an already approved purchase without manual points adjustment');
    }

    const updated = await this.prisma.purchaseSubmission.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: dto.reason,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: submission.userId,
        title: 'Purchase Submission Rejected',
        message: `Your ${submission.propFirm.name} submission (${submission.submissionCode}) was rejected: "${dto.reason}"`,
        type: 'PURCHASE',
        linkUrl: `/dashboard/purchases/${submission.id}`,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'REJECT_PURCHASE',
        entity: 'PurchaseSubmission',
        entityId: id,
        previousValue: JSON.stringify({ status: submission.status }),
        newValue: JSON.stringify({ status: 'REJECTED', reason: dto.reason }),
        notes: `Rejection reason: ${dto.reason}`,
      },
    });

    return updated;
  }

  async requestMoreInfo(id: string, dto: RequestInfoPurchaseDto, adminId: string) {
    const submission = await this.prisma.purchaseSubmission.findUnique({
      where: { id },
      include: { user: true, propFirm: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const updated = await this.prisma.purchaseSubmission.update({
      where: { id },
      data: {
        status: 'MORE_INFO_REQUIRED',
        infoRequestedMessage: dto.message,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: submission.userId,
        title: 'Action Required: More Information Needed',
        message: `Our review team requested additional details for your ${submission.propFirm.name} submission: "${dto.message}"`,
        type: 'PURCHASE',
        linkUrl: `/dashboard/purchases/${submission.id}`,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'REQUEST_MORE_INFO',
        entity: 'PurchaseSubmission',
        entityId: id,
        notes: `Requested information: ${dto.message}`,
      },
    });

    return updated;
  }

  async adminCreateSubmission(dto: AdminCreatePurchaseDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const propFirm = await this.prisma.propFirm.findUnique({ where: { id: dto.propFirmId } });
    if (!propFirm) throw new NotFoundException('Prop firm not found');

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const submissionCode = `PN-ADM-${randomSuffix}`;
    const status = dto.status || 'APPROVED';
    const pointsToAward = dto.pointsAwarded || Math.round(dto.purchaseAmountUsd * 10);

    const submission = await this.prisma.$transaction(async (tx) => {
      const created = await tx.purchaseSubmission.create({
        data: {
          submissionCode,
          userId: dto.userId,
          propFirmId: dto.propFirmId,
          accountType: dto.accountType,
          orderId: dto.orderId,
          accountId: dto.accountId || null,
          purchaseDate: new Date(),
          purchaseAmountUsd: dto.purchaseAmountUsd,
          emailUsed: dto.emailUsed,
          referralCodeUsed: dto.referralCodeUsed || propFirm.affiliateCode || 'PROPNATION',
          notes: dto.notes || 'Manually logged by Admin from Control Panel',
          status,
          pointsAwarded: status === 'APPROVED' ? pointsToAward : 0,
          reviewedById: adminId,
          reviewedAt: new Date(),
        },
        include: {
          propFirm: true,
          user: true,
          proofs: true,
        },
      });

      if (status === 'APPROVED' && pointsToAward > 0) {
        const lastTx = await tx.pointsLedger.findFirst({
          where: { userId: dto.userId },
          orderBy: { createdAt: 'desc' },
          select: { balanceAfter: true },
        });
        const currentBalance = lastTx ? lastTx.balanceAfter : 0;
        const newBalance = currentBalance + pointsToAward;

        await tx.pointsLedger.create({
          data: {
            userId: dto.userId,
            submissionId: created.id,
            type: 'PURCHASE_REWARD',
            points: pointsToAward,
            balanceAfter: newBalance,
            description: `Admin Verified: ${propFirm.name} - ${dto.accountType}`,
            reason: 'Manual order entry by Admin',
            createdById: adminId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'MANUAL_CREATE_SUBMISSION',
          entity: 'PurchaseSubmission',
          entityId: created.id,
          newValue: JSON.stringify(dto),
          notes: `Admin manually created submission for user ${user.name}: ${submissionCode}`,
        },
      });

      return created;
    });

    return submission;
  }

  async adminUpdateSubmission(id: string, dto: AdminUpdatePurchaseDto, adminId: string) {
    const submission = await this.prisma.purchaseSubmission.findUnique({
      where: { id },
      include: { user: true, propFirm: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    const updated = await this.prisma.purchaseSubmission.update({
      where: { id },
      data: {
        ...(dto.orderId && { orderId: dto.orderId }),
        ...(dto.accountType && { accountType: dto.accountType }),
        ...(dto.purchaseAmountUsd !== undefined && { purchaseAmountUsd: dto.purchaseAmountUsd }),
        ...(dto.emailUsed && { emailUsed: dto.emailUsed }),
        ...(dto.referralCodeUsed && { referralCodeUsed: dto.referralCodeUsed }),
        ...(dto.pointsAwarded !== undefined && { pointsAwarded: dto.pointsAwarded }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes && { notes: dto.notes }),
      },
      include: { propFirm: true, user: true, proofs: true },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'UPDATE_SUBMISSION',
        entity: 'PurchaseSubmission',
        entityId: id,
        previousValue: JSON.stringify({
          orderId: submission.orderId,
          amount: submission.purchaseAmountUsd,
          points: submission.pointsAwarded,
          status: submission.status,
        }),
        newValue: JSON.stringify(dto),
        notes: `Admin edited submission ${submission.submissionCode}`,
      },
    });

    return updated;
  }

  async adminDeleteSubmission(id: string, adminId: string) {
    const submission = await this.prisma.purchaseSubmission.findUnique({
      where: { id },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    // Delete linked proofs first if any, then submission
    await this.prisma.purchaseProof.deleteMany({ where: { submissionId: id } });
    await this.prisma.purchaseSubmission.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'DELETE_SUBMISSION',
        entity: 'PurchaseSubmission',
        entityId: id,
        notes: `Admin deleted submission ${submission.submissionCode} (Order: ${submission.orderId})`,
      },
    });

    return { message: 'Submission deleted successfully' };
  }
}
