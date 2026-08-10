import { plainToInstance, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  Equals,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  Validate,
  ValidateIf,
  ValidateNested,
  validateSync,
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
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

@ValidatorConstraint({ name: 'fieldStatusMap', async: false })
class FieldStatusMapConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null) {
      return true;
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }

    for (const entry of Object.values(value as Record<string, unknown>)) {
      if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
        return false;
      }
      const dto = plainToInstance(FieldStatusDto, entry);
      if (validateSync(dto).length > 0) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(): string {
    return 'fieldStatus values must include state ok|unknown|unsupported';
  }
}

@ValidatorConstraint({ name: 'zeroVisitorsRequireStatus', async: false })
class ZeroVisitorsRequireStatusConstraint
  implements ValidatorConstraintInterface
{
  validate(uniqueIpCount: unknown, args: ValidationArguments): boolean {
    if (uniqueIpCount !== 0) {
      return true;
    }
    const sample = args.object as ActiveVisitors3mDto;
    // Real empty window: status.ok. Missing/unreadable log: status.unsupported.
    // Bare zeros without status are rejected (never treat as real traffic).
    return (
      sample.status?.state === 'ok' || sample.status?.state === 'unsupported'
    );
  }

  defaultMessage(): string {
    return 'activeVisitors3m uniqueIpCount 0 requires status.state ok or unsupported';
  }
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
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUrl({ protocols: ['https'], require_protocol: true })
  controlPanelUrl?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUrl({ protocols: ['https'], require_protocol: true })
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
  @Validate(FieldStatusMapConstraint)
  fieldStatus?: Record<string, FieldStatusDto>;
}

export class ActiveVisitors3mDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsInt()
  @Min(0)
  @Validate(ZeroVisitorsRequireStatusConstraint)
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
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => Phase1DiscoveryDto)
  discoveries!: Phase1DiscoveryDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ActiveVisitors3mDto)
  activeVisitors3m?: ActiveVisitors3mDto[];
}
