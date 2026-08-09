import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { AgentSignatureGuard } from './guards/agent-signature.guard.js';
import { IngestAgentMetricsDto } from './dto/ingest-agent-metrics.dto.js';
import {
  EnrollAgentDto,
  HeartbeatAgentDto,
} from './dto/enroll-agent.dto.js';
import { AgentService } from './agent.service.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { IsFirstProvisioning } from './decorators/is-first-provisioning.js';
import { createAppLogger } from '#/common/logging/app-logger.js';
import { ApiResponseBuilder } from '#/common/http/api-response.builder.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

@Controller('internal/agent/v1')
export class AgentController {
  private readonly logger = createAppLogger(AgentController.name);

  constructor(private readonly agentService: AgentService) {}

  @Public()
  @Post('enroll')
  @HttpCode(HttpStatus.CREATED)
  async enroll(
    @Headers('x-enrollment-token') enrollmentToken: string | string[] | undefined,
    @Body() body: EnrollAgentDto,
  ) {
    const token = Array.isArray(enrollmentToken)
      ? enrollmentToken[0]
      : enrollmentToken;
    if (!token) {
      throw new UnauthorizedException(ERROR_MESSAGES.fa.unauthenticated);
    }

    const result = await this.agentService.enroll(token, body.machineId);

    this.logger.log('agent.enroll.completed', {
      machineId: body.machineId,
      vpsNodeId: result.vpsNodeId,
      serverId: result.serverId,
    });

    return ApiResponseBuilder.created({
      vpsNodeId: result.vpsNodeId,
      serverId: result.serverId,
      secretKey: result.secretKey,
    });
  }

  @Public()
  @Post('heartbeat')
  @UseGuards(AgentSignatureGuard)
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Body() body: HeartbeatAgentDto) {
    const data = await this.agentService.heartbeat(body.machineId);
    return ApiResponseBuilder.ok(data);
  }

  @Public()
  @Post('ingest')
  @UseGuards(AgentSignatureGuard)
  @HttpCode(HttpStatus.CREATED)
  async ingestAgentMetrics(
    @Ip() clientIp: string,
    @IsFirstProvisioning() isFirstProvisioningCycle: boolean,
    @Body() payload: IngestAgentMetricsDto,
  ) {
    const batchSize = payload.batch.length;
    const websiteEntryCount = payload.batch.reduce(
      (total, entry) => total + entry.websites.length,
      0,
    );
    const machineId = payload.batch[0]?.machineId ?? 'unknown';

    this.logger.debug('agent.ingest.received', {
      machineId,
      batchSize,
      websiteEntryCount,
      firstProvisioning: isFirstProvisioningCycle,
    });

    const result = await this.agentService.processTelemetryIngestion(
      payload,
      isFirstProvisioningCycle,
      clientIp,
    );

    this.logger.log('agent.ingest.completed', {
      machineId,
      vpsNodeId: result.vpsNodeId,
      hasAssignedCredential: Boolean(result.assignedSecretKey),
    });

    return {
      status: 'success',
      ...(result.assignedSecretKey && {
        assignedSecretKey: result.assignedSecretKey,
      }),
    };
  }
}
