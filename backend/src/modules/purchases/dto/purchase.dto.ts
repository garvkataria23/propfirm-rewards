import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SubmitPurchaseDto {
  @IsString()
  @IsNotEmpty()
  propFirmId: string;

  @IsOptional()
  @IsString()
  offerId?: string;

  @IsString()
  @IsNotEmpty()
  accountType: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsString()
  @IsNotEmpty()
  purchaseDate: string;

  @IsNumber()
  @Min(0)
  purchaseAmountUsd: number;

  @IsString()
  @IsNotEmpty()
  emailUsed: string;

  @IsString()
  @IsNotEmpty()
  referralCodeUsed: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApprovePurchaseDto {
  @IsOptional()
  @IsNumber()
  customPoints?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectPurchaseDto {
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required' })
  reason: string;
}

export class RequestInfoPurchaseDto {
  @IsString()
  @IsNotEmpty({ message: 'Request message is required' })
  message: string;
}

export class ResubmitPurchaseDto {
  @IsString()
  @IsNotEmpty({ message: 'Please provide the requested details' })
  userResubmissionNotes: string;
}

export class AdminCreatePurchaseDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  propFirmId: string;

  @IsString()
  @IsNotEmpty()
  accountType: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsNumber()
  @Min(0)
  purchaseAmountUsd: number;

  @IsString()
  @IsNotEmpty()
  emailUsed: string;

  @IsOptional()
  @IsString()
  referralCodeUsed?: string;

  @IsOptional()
  @IsNumber()
  pointsAwarded?: number;

  @IsOptional()
  @IsString()
  status?: string; // APPROVED, PENDING, UNDER_REVIEW

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdminUpdatePurchaseDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  accountType?: string;

  @IsOptional()
  @IsNumber()
  purchaseAmountUsd?: number;

  @IsOptional()
  @IsString()
  emailUsed?: string;

  @IsOptional()
  @IsString()
  referralCodeUsed?: string;

  @IsOptional()
  @IsNumber()
  pointsAwarded?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

