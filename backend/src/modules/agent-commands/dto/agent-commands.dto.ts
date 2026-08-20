import { IsUUID } from 'class-validator';

export class CreateRefreshSiteStackCommandDto {
  @IsUUID()
  discoveryId!: string;
}
