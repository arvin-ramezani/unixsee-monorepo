import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import type { CurrentUserType } from '#/@types/express/index.js';
import { ApiResponseBuilder } from '#/common/http/api-response.builder.js';
import { Role, TicketStatus } from '#/generated/prisma/enums.js';
import { CurrentUser } from '#/modules/auth/decorators/current-user.decorator.js';
import { Roles } from '#/modules/auth/decorators/roles.decorator.js';
import { RolesGuard } from '#/modules/auth/guards/roles.guard.js';
import {
  AssignTicketDto,
  CreateTicketMessageDto,
} from '../dto/tickets.dto.js';
import { TicketsService } from '../services/tickets.service.js';

@Controller('v1/admin/tickets')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.OPERATOR)
export class AdminTicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  async list(
    @Query('status') status?: TicketStatus,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const data = await this.ticketsService.listAdmin({
      status,
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 50,
    });
    return ApiResponseBuilder.ok(data);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assign(@Param('id') id: string, @Body() body: AssignTicketDto) {
    const data = await this.ticketsService.assign(id, body.assigneeId);
    return ApiResponseBuilder.ok(data);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolve(@Param('id') id: string) {
    const data = await this.ticketsService.resolve(id);
    return ApiResponseBuilder.ok(data);
  }

  @Post(':id/request-info')
  @HttpCode(HttpStatus.OK)
  async requestInfo(@Param('id') id: string) {
    const data = await this.ticketsService.requestCustomerInfo(id);
    return ApiResponseBuilder.ok(data);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async addMessage(
    @Param('id') id: string,
    @Body() body: CreateTicketMessageDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.ticketsService.addAdminMessage(user.id, id, {
      body: body.body,
      isInternal: body.isInternal,
    });
    return ApiResponseBuilder.created(data);
  }
}
