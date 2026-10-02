import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum TicketDepartment {
  GENERAL = 'GENERAL',
  PURCHASE_PROOF = 'PURCHASE_PROOF',
  CASHOUT_PAYOUT = 'CASHOUT_PAYOUT',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  VIP = 'VIP',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_TRADER = 'WAITING_TRADER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(TicketDepartment)
  @IsOptional()
  department?: TicketDepartment = TicketDepartment.GENERAL;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority = TicketPriority.MEDIUM;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsBoolean()
  @IsOptional()
  isInternalNote?: boolean = false;

  @IsString()
  @IsOptional()
  attachments?: string;
}

export class AssignTicketDto {
  @IsString()
  @IsNotEmpty()
  assignedToId: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}

export class UpdateUserRoleDto {
  @IsString()
  @IsNotEmpty()
  role: string; // 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT_LEAD' | 'SUPPORT_AGENT' | 'FINANCE_OFFICER' | 'USER'

  @IsString()
  @IsOptional()
  department?: string;

  @IsOptional()
  permissions?: string[];
}
