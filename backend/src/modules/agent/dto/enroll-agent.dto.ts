import { IsString, MinLength } from 'class-validator';

export class EnrollAgentDto {
  @IsString()
  @MinLength(1)
  machineId!: string;
}

export class HeartbeatAgentDto {
  @IsString()
  @MinLength(1)
  machineId!: string;
}
