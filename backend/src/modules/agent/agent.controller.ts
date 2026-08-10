import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { AgentSignatureGuard } from './guards/agent-signature.guard.js';
import {
  EnrollAgentDto,
  HeartbeatAgentDto,
  Phase1IngestDto,
} from './dto/agent.dto.js';
import { AgentService } from './agent.service.js';
import { Public } from '../auth/decorators/public.decorator.js';
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

    const result = await this.agentService.enroll(
      token,
      body.machineId,
      body.agentVersion,
    );

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
    const data = await this.agentService.heartbeat(body);
    return ApiResponseBuilder.ok(data);
  }

  @Public()
  @Post('ingest')
  @UseGuards(AgentSignatureGuard)
  @HttpCode(HttpStatus.CREATED)
  async ingest(@Body() payload: Phase1IngestDto) {
    this.logger.debug('agent.ingest.received', {
      machineId: payload.machineId,
      discoveryCount: payload.discoveries.length,
      visitorSampleCount: payload.activeVisitors3m?.length ?? 0,
    });

    const result = await this.agentService.processPhase1Ingest(payload);

    this.logger.log('agent.ingest.completed', {
      machineId: payload.machineId,
      vpsNodeId: result.vpsNodeId,
      discoveryCount: result.discoveryCount,
    });

    return ApiResponseBuilder.created(result);
  }
}
