import { IsInt, IsNotEmpty, IsOptional, IsString, NotEquals } from 'class-validator';

export class AdminAdjustPointsDto {
  @IsInt({ message: 'Points adjustment must be a non-zero integer' })
  @NotEquals(0, { message: 'Points adjustment cannot be 0' })
  points: number;

  @IsString()
  @IsNotEmpty({ message: 'Admin point adjustment MUST require a clear reason' })
  reason: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
