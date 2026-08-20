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
  AgentCommandResultDto,
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
      body.agentInstanceId,
      body.agentVersion,
    );

    this.logger.log('agent.enroll.completed', {
      agentInstanceId: body.agentInstanceId,
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
  @Post('command-results')
  @UseGuards(AgentSignatureGuard)
  @HttpCode(HttpStatus.OK)
  async commandResult(@Body() payload: AgentCommandResultDto) {
    const data = await this.agentService.completeCommand(payload);
    return ApiResponseBuilder.ok(data);
  }

  @Public()
  @Post('ingest')
  @UseGuards(AgentSignatureGuard)
  @HttpCode(HttpStatus.CREATED)
  async ingest(@Body() payload: Phase1IngestDto) {
    this.logger.debug('agent.ingest.received', {
      agentInstanceId: payload.agentInstanceId,
      discoveryCount: payload.discoveries?.length ?? 0,
      stackSnapshotCount: payload.stackSnapshots?.length ?? 0,
      activeVisitorSampleCount: payload.activeVisitors3m?.length ?? 0,
      visitors24hCount: payload.visitors24h?.length ?? 0,
      hasDiscoverySection: payload.discoveries !== undefined,
    });

    const result = await this.agentService.processPhase1Ingest(payload);

    this.logger.log('agent.ingest.completed', {
      agentInstanceId: payload.agentInstanceId,
      vpsNodeId: result.vpsNodeId,
      discoveryCount: result.discoveryCount,
      stackSnapshotsUpdated: result.stackSnapshotsUpdated,
      visitorSamplesInserted: result.visitorSamplesInserted,
      visitors24hUpdated: result.visitors24hUpdated,
    });

    return ApiResponseBuilder.created(result);
  }
}
