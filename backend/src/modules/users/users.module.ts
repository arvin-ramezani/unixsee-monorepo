import { Module } from '@nestjs/common';

import { UsersService } from './services/users.service.js';
import { UsersController } from './controllers/users.controller.js';
import { AdminUsersController } from './controllers/admin-users.controller.js';

@Module({
  providers: [UsersService],
  controllers: [UsersController, AdminUsersController],
  exports: [UsersService],
})
export class UsersModule {}
