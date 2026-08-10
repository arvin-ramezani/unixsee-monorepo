import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  TicketServiceCategory,
  TicketStatus,
} from '#/generated/prisma/enums.js';

export class CreateTicketAttachmentItemDto {
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

export class CreateTicketDto {
  @IsEnum(TicketServiceCategory)
  service!: TicketServiceCategory;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  subject!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description!: string;

  @IsOptional()
  @IsUUID()
  websiteId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateTicketAttachmentItemDto)
  attachments?: CreateTicketAttachmentItemDto[];
}

export class CreateTicketMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  idempotencyKey?: string;
}

export class CreateTicketAttachmentDto {
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

export class AssignTicketDto {
  @IsUUID()
  assigneeId!: string;
}

export class ListTicketsQueryDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketServiceCategory)
  service?: TicketServiceCategory;

  @IsOptional()
  @IsUUID()
  websiteId?: string;
}
