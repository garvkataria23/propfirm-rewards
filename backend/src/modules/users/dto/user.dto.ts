import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateUserStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string; // ACTIVE, SUSPENDED, BANNED

  @IsString()
  @IsNotEmpty({ message: 'Reason for status update is required' })
  reason: string;
}

export class CreateUserAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  initialPoints?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}

export class ResetPasswordAdminDto {
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
