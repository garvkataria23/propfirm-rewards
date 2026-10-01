import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePropFirmDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  websiteUrl: string;

  @IsString()
  @IsNotEmpty()
  affiliateCode: string;

  @IsString()
  @IsNotEmpty()
  affiliateUrl: string;

  @IsOptional()
  @IsString()
  eligibilityTerms?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdatePropFirmDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  affiliateCode?: string;

  @IsOptional()
  @IsString()
  affiliateUrl?: string;

  @IsOptional()
  @IsString()
  eligibilityTerms?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  accountTierName: string;

  @IsNumber()
  @Min(0)
  purchasePriceUsd: number;

  @IsNumber()
  @Min(1)
  rewardPoints: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  accountTierName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePriceUsd?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rewardPoints?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
