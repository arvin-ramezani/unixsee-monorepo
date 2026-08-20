import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

const HTTP_URL_OPTIONS = {
  protocols: ['http', 'https'],
  require_protocol: true,
};

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

  @IsOptional()
  @IsUrl(HTTP_URL_OPTIONS)
  @MaxLength(2048)
  controlPanelUrl?: string | null;
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

  @IsOptional()
  @IsUrl(HTTP_URL_OPTIONS)
  @MaxLength(2048)
  controlPanelUrl?: string | null;
}

export class CreateEnrollmentTokenDto {
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

export class RevokeAgentCredentialsDto {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  reason!: string;
}
