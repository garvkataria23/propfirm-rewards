import { Injectable, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { SubmitPurchaseDto, ApprovePurchaseDto, RejectPurchaseDto, RequestInfoPurchaseDto, ResubmitPurchaseDto } from './dto/purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private emailService: EmailService,
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

    // Fallback: if no offer selected, calculate proportional estimate (e.g. 15 points per $1)
    if (pointsAwarded === 0 && dto.purchaseAmountUsd > 0) {
      pointsAwarded = Math.round(dto.purchaseAmountUsd * 15);
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const submissionCode = `SUB-${new Date().getFullYear()}-${randomSuffix}`;

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
        user: { select: { id: true, name: true, email: true } },
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
      : (submission.pointsAwarded || submission.offer?.rewardPoints || Math.round(submission.purchaseAmountUsd * 15));

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

    return result;
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
}
