import { Type } from 'class-transformer';
import {
  Equals,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class EnrollAgentDto {
  @IsString()
  @MinLength(1)
  machineId!: string;

  @IsOptional()
  @IsString()
  agentVersion?: string;
}

export class HeartbeatServerBindingDto {
  @IsOptional()
  @IsString()
  hostname?: string;
}

export class HeartbeatAgentDto {
  @IsString()
  @Equals('phase1')
  schemaVersion!: 'phase1';

  @IsString()
  @MinLength(1)
  machineId!: string;

  @IsOptional()
  @IsString()
  agentVersion?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => HeartbeatServerBindingDto)
  serverBinding?: HeartbeatServerBindingDto;

  @IsISO8601()
  sentAt!: string;
}

export class FieldStatusDto {
  @IsString()
  @IsIn(['ok', 'unknown', 'unsupported'])
  state!: 'ok' | 'unknown' | 'unsupported';

  @IsOptional()
  @IsString()
  reason?: string;
}

export class Phase1DiscoveryDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @IsString()
  @IsNotEmpty()
  documentRoot!: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsString()
  @IsNotEmpty()
  appType!: string;

  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsOptional()
  @IsString()
  backendAddress?: string | null;

  @IsOptional()
  @IsString()
  controlPanelUrl?: string | null;

  @IsOptional()
  @IsString()
  wordpressAdminUrl?: string | null;

  @IsOptional()
  @IsString()
  wordpressVersion?: string | null;

  @IsOptional()
  @IsString()
  phpVersion?: string | null;

  @IsOptional()
  @IsIn(['site', 'host', 'unknown'])
  phpVersionScope?: 'site' | 'host' | 'unknown';

  @IsOptional()
  @IsString()
  imagickVersion?: string | null;

  @IsOptional()
  @IsString()
  wordpressUpdateStatus?: string | null;

  @IsOptional()
  @IsISO8601()
  wordpressUpdateCheckedAt?: string | null;

  @IsOptional()
  @IsObject()
  fieldStatus?: Record<string, FieldStatusDto>;
}

export class ActiveVisitors3mDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsInt()
  @Min(0)
  uniqueIpCount!: number;

  @IsInt()
  @Min(1)
  windowSeconds!: number;

  @IsISO8601()
  windowStartedAt!: string;

  @IsISO8601()
  measuredAt!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FieldStatusDto)
  status?: FieldStatusDto;
}

export class Phase1IngestDto {
  @IsString()
  @Equals('phase1')
  schemaVersion!: 'phase1';

  @IsString()
  @MinLength(1)
  machineId!: string;

  @IsOptional()
  @IsString()
  agentVersion?: string;

  @IsISO8601()
  sentAt!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Phase1DiscoveryDto)
  discoveries!: Phase1DiscoveryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActiveVisitors3mDto)
  activeVisitors3m?: ActiveVisitors3mDto[];
}
