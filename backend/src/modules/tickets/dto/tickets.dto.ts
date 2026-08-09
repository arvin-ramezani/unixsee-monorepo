import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { TicketPriority } from '#/generated/prisma/enums.js';

export class CreateTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;

  @IsOptional()
  @IsUUID()
  websiteId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}

export class CreateTicketMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
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
