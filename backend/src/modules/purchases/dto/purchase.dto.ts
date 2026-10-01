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
