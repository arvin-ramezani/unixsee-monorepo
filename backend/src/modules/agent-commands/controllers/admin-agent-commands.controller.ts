import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { CurrentUserType } from '#/@types/express/index.js';
import { ApiResponseBuilder } from '#/common/http/api-response.builder.js';
import { Role } from '#/generated/prisma/enums.js';
import { CurrentUser } from '#/modules/auth/decorators/current-user.decorator.js';
import { Roles } from '#/modules/auth/decorators/roles.decorator.js';
import { RolesGuard } from '#/modules/auth/guards/roles.guard.js';
import { CreateRefreshSiteStackCommandDto } from '../dto/agent-commands.dto.js';
import { AgentCommandsService } from '../services/agent-commands.service.js';

@Controller('v1/admin/agent-commands')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.OPERATOR)
export class AdminAgentCommandsController {
  constructor(private readonly agentCommandsService: AgentCommandsService) {}

  @Post('refresh-site-stack')
  @HttpCode(HttpStatus.CREATED)
  async refreshSiteStack(
    @Body() body: CreateRefreshSiteStackCommandDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.agentCommandsService.createRefreshSiteStack(
      body.discoveryId,
      user.id,
    );
    return ApiResponseBuilder.created(data);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.agentCommandsService.getAdmin(id);
    return ApiResponseBuilder.ok(data);
  }
}
