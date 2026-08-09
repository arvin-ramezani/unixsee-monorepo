import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateServerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  ipAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateServerDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}

export class CreateEnrollmentTokenDto {
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
