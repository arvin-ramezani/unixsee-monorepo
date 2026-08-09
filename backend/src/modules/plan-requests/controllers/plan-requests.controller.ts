import { Controller, Get, Param, Query } from '@nestjs/common';

import type { CurrentUserType } from '#/@types/express/index.js';
import { ApiResponseBuilder } from '#/common/http/api-response.builder.js';
import { CurrentUser } from '#/modules/auth/decorators/current-user.decorator.js';
import { PlanRequestsService } from '../services/plan-requests.service.js';

@Controller('v1/plan-requests')
export class PlanRequestsController {
  constructor(private readonly planRequestsService: PlanRequestsService) {}

  @Get()
  async list(
    @CurrentUser() user: CurrentUserType,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const data = await this.planRequestsService.listForUser(user.id, {
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 50,
    });
    return ApiResponseBuilder.ok(data);
  }

  @Get(':id')
  async get(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    const data = await this.planRequestsService.getForUser(user.id, id);
    return ApiResponseBuilder.ok(data);
  }
}
