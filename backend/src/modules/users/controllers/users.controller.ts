import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

import { UsersService } from '../services/users.service.js';
import { CurrentUser } from '#/modules/auth/decorators/current-user.decorator.js';
import type { CurrentUserType } from '#/@types/express/index.js';
import { ApiResponseBuilder } from '#/common/http/api-response.builder.js';

class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string;
}

@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: CurrentUserType) {
    return ApiResponseBuilder.ok(user);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMe(
    @CurrentUser() user: CurrentUserType,
    @Body() body: UpdateMeDto,
  ) {
    const updated = await this.usersService.updateMe(user.id, body);
    return ApiResponseBuilder.ok(updated);
  }
}
