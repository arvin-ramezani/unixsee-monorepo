import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  Equals,
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  Validate,
  ValidateIf,
  ValidateNested,
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

export class EnrollAgentDto {
  @IsString()
  @MinLength(1)
  agentInstanceId!: string;

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
  agentInstanceId!: string;

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

@ValidatorConstraint({ name: 'activeVisitorWindowConsistency', async: false })
class ActiveVisitorWindowConsistencyConstraint
  implements ValidatorConstraintInterface
{
  validate(_measuredAt: unknown, args: ValidationArguments): boolean {
    const sample = args.object as ActiveVisitors3mDto;
    const measuredAt = Date.parse(sample.measuredAt);
    const windowStartedAt = Date.parse(sample.windowStartedAt);
    if (!Number.isFinite(measuredAt) || !Number.isFinite(windowStartedAt)) {
      return false;
    }
    return measuredAt - windowStartedAt === 180_000;
  }

  defaultMessage(): string {
    return 'activeVisitors3m windowStartedAt must be exactly 180 seconds before measuredAt';
  }
}

@ValidatorConstraint({ name: 'stackSnapshotConsistency', async: false })
class StackSnapshotConsistencyConstraint
  implements ValidatorConstraintInterface
{
  validate(_checkedAt: unknown, args: ValidationArguments): boolean {
    const snapshot = args.object as StackSnapshotDto;
    if (!snapshot.fieldStatus) return false;

    const checks: Array<{
      value: string | null | undefined;
      status: FieldStatusDto | undefined;
    }> = [
      {
        value: snapshot.wordpressVersion,
        status: snapshot.fieldStatus.wordpressVersion,
      },
      { value: snapshot.phpVersion, status: snapshot.fieldStatus.phpVersion },
      {
        value: snapshot.imagickVersion,
        status: snapshot.fieldStatus.imagickVersion,
      },
    ];

    return checks.every(({ value, status }) => {
      if (!status) return false;
      if (status.state === 'ok') {
        return typeof value === 'string' && value.trim().length > 0;
      }
      return value === null;
    });
  }

  defaultMessage(): string {
    return 'stack values must be non-empty strings when status is ok, and null when status is unknown/unsupported';
  }
}

@ValidatorConstraint({ name: 'visitors24hCoverageStatus', async: false })
class Visitors24hCoverageStatusConstraint
  implements ValidatorConstraintInterface
{
  validate(coverageSeconds: unknown, args: ValidationArguments): boolean {
    if (typeof coverageSeconds !== 'number') return false;

    const sample = args.object as Visitors24hDto;
    if (!sample.status || typeof sample.windowSeconds !== 'number') {
      return false;
    }

    if (coverageSeconds < sample.windowSeconds) {
      return sample.status.state !== 'ok';
    }

    return true;
  }

  defaultMessage(): string {
    return 'visitors24h partial coverage cannot use status.state ok';
  }
}

@ValidatorConstraint({ name: 'phase1IngestHasSection', async: false })
class Phase1IngestHasSectionConstraint
  implements ValidatorConstraintInterface
{
  validate(_schemaVersion: unknown, args: ValidationArguments): boolean {
    const payload = args.object as Phase1IngestDto;
    return (
      payload.discoveries !== undefined ||
      payload.stackSnapshots !== undefined ||
      payload.activeVisitors3m !== undefined ||
      payload.visitors24h !== undefined
    );
  }

  defaultMessage(): string {
    return 'ingest must contain at least one typed section: discoveries, stackSnapshots, activeVisitors3m, or visitors24h';
  }
}

/**
 * Agent-owned OLS inventory only.
 *
 * Stack versions, admin URLs, document roots, hosting users and other legacy
 * enrichment fields are intentionally not part of discovery anymore.
 */
export class Phase1DiscoveryDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases!: string[];

  @IsString()
  @IsNotEmpty()
  virtualHostName!: string;

  @IsString()
  @Equals('openlitespeed')
  source!: 'openlitespeed';

  @IsISO8601()
  discoveredAt!: string;
}

export class StackFieldStatusDto {
  @ValidateNested()
  @Type(() => FieldStatusDto)
  wordpressVersion!: FieldStatusDto;

  @ValidateNested()
  @Type(() => FieldStatusDto)
  phpVersion!: FieldStatusDto;

  @ValidateNested()
  @Type(() => FieldStatusDto)
  imagickVersion!: FieldStatusDto;
}

export class StackSnapshotDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @ValidateIf((_snapshot, value) => value !== null)
  @IsString()
  @IsNotEmpty()
  wordpressVersion!: string | null;

  @ValidateIf((_snapshot, value) => value !== null)
  @IsString()
  @IsNotEmpty()
  phpVersion!: string | null;

  @ValidateIf((_snapshot, value) => value !== null)
  @IsString()
  @IsNotEmpty()
  imagickVersion!: string | null;

  @IsISO8601()
  @Validate(StackSnapshotConsistencyConstraint)
  checkedAt!: string;

  @ValidateNested()
  @Type(() => StackFieldStatusDto)
  fieldStatus!: StackFieldStatusDto;
}

export class ActiveVisitors3mDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsInt()
  @Min(0)
  uniqueVisitorCount!: number;

  @IsInt()
  @Equals(180)
  windowSeconds!: 180;

  @IsISO8601()
  windowStartedAt!: string;

  @IsISO8601()
  @Validate(ActiveVisitorWindowConsistencyConstraint)
  measuredAt!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => FieldStatusDto)
  status!: FieldStatusDto;
}

export class Visitors24hDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsInt()
  @Min(0)
  uniqueVisitors24h!: number;

  @IsInt()
  @Equals(86400)
  windowSeconds!: 86400;

  @IsInt()
  @Min(0)
  @Max(86400)
  @Validate(Visitors24hCoverageStatusConstraint)
  coverageSeconds!: number;

  @IsISO8601()
  measuredAt!: string;

  @IsString()
  @Equals('hll')
  algorithm!: 'hll';

  @IsDefined()
  @ValidateNested()
  @Type(() => FieldStatusDto)
  status!: FieldStatusDto;
}

@ValidatorConstraint({ name: 'agentCommandResultConsistency', async: false })
class AgentCommandResultConsistencyConstraint
  implements ValidatorConstraintInterface
{
  validate(_completedAt: unknown, args: ValidationArguments): boolean {
    const result = args.object as AgentCommandResultDto;

    if (result.stackSnapshot && result.stackSnapshot.domain !== result.domain) {
      return false;
    }

    if (result.status === 'SUCCEEDED') {
      return Boolean(result.stackSnapshot) && result.errorCode === undefined;
    }

    if (result.status === 'FAILED') {
      return typeof result.errorCode === 'string' && result.errorCode.length > 0;
    }

    return false;
  }

  defaultMessage(): string {
    return 'command result must match its domain; SUCCEEDED requires stackSnapshot and no errorCode, FAILED requires errorCode';
  }
}

export class AgentCommandResultDto {
  @IsString()
  @Equals('phase1')
  schemaVersion!: 'phase1';

  @IsString()
  @MinLength(1)
  agentInstanceId!: string;

  @IsUUID()
  commandId!: string;

  @IsString()
  @Equals('REFRESH_SITE_STACK')
  type!: 'REFRESH_SITE_STACK';

  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsString()
  @IsIn(['SUCCEEDED', 'FAILED'])
  status!: 'SUCCEEDED' | 'FAILED';

  @IsISO8601()
  @Validate(AgentCommandResultConsistencyConstraint)
  completedAt!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StackSnapshotDto)
  stackSnapshot?: StackSnapshotDto;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  errorCode?: string;
}

export class Phase1IngestDto {
  @IsString()
  @Equals('phase1')
  @Validate(Phase1IngestHasSectionConstraint)
  schemaVersion!: 'phase1';

  @IsString()
  @MinLength(1)
  agentInstanceId!: string;

  @IsOptional()
  @IsString()
  agentVersion?: string;

  @IsISO8601()
  sentAt!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => Phase1DiscoveryDto)
  discoveries?: Phase1DiscoveryDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => StackSnapshotDto)
  stackSnapshots?: StackSnapshotDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ActiveVisitors3mDto)
  activeVisitors3m?: ActiveVisitors3mDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => Visitors24hDto)
  visitors24h?: Visitors24hDto[];
}
