import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { UnixseeMessageStatus } from '#/generated/prisma/enums.js';

export class UnixseeMessageLinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  url!: string;

  @IsIn(['external', 'dashboard'])
  kind!: 'external' | 'dashboard';
}

export class UnixseeMessageAttachmentItemDto {
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @MaxLength(128)
  contentType!: string;

  @IsInt()
  @Min(0)
  sizeBytes!: number;

  @IsString()
  @MaxLength(512)
  storageKey!: string;
}

export class CreateUnixseeMessageDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;

  @IsIn(['fa', 'en'])
  contentLocale!: 'fa' | 'en';

  @IsOptional()
  @IsUUID()
  websiteId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UnixseeMessageLinkDto)
  links?: UnixseeMessageLinkDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => UnixseeMessageAttachmentItemDto)
  attachments?: UnixseeMessageAttachmentItemDto[];
}

export class UpdateUnixseeMessageDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body?: string;

  @IsOptional()
  @IsIn(['fa', 'en'])
  contentLocale?: 'fa' | 'en';

  @IsOptional()
  @IsUUID()
  websiteId?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UnixseeMessageLinkDto)
  links?: UnixseeMessageLinkDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => UnixseeMessageAttachmentItemDto)
  attachments?: UnixseeMessageAttachmentItemDto[];
}

export class AdminListUnixseeMessagesQueryDto {
  @IsOptional()
  @IsEnum(UnixseeMessageStatus)
  status?: UnixseeMessageStatus;

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
