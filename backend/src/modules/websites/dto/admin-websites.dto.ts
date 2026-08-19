import {
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

const HTTP_URL_OPTIONS = {
  protocols: ['http', 'https'],
  require_protocol: true,
};

export class AdminCreateWebsiteDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  vpsNodeId!: string;

  @IsString()
  @MaxLength(255)
  domain!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @IsOptional()
  @IsUUID()
  planId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUrl(HTTP_URL_OPTIONS)
  @MaxLength(2048)
  wordpressAdminUrl?: string | null;
}

export class AdminUpdateWebsiteDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string | null;

  @IsOptional()
  @IsUrl(HTTP_URL_OPTIONS)
  @MaxLength(2048)
  wordpressAdminUrl?: string | null;
}

export class AssignWebsiteDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsUUID()
  planId?: string;
}

export class TransferWebsiteDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
