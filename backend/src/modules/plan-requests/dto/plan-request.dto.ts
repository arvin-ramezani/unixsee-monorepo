import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePublicPlanRequestDto {
  @IsUUID()
  planId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  contactName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  contactPhone!: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  websiteDomain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class LinkPlanRequestDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsUUID()
  linkedUserId?: string;

  @IsOptional()
  @IsUUID()
  websiteId?: string;
}

export class EnablePlanRequestDto {
  @IsUUID()
  websiteId!: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}

export class DeclinePlanRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
