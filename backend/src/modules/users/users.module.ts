import { Module } from '@nestjs/common';

import { UsersService } from './services/users.service.js';
import { UsersController } from './controllers/users.controller.js';
import { AdminUsersController } from './controllers/admin-users.controller.js';
import { OtpModule } from '#/modules/auth/otp.module.js';
import { MailModule } from '#/modules/mail/mail.module.js';

@Module({
  imports: [OtpModule, MailModule],
  providers: [UsersService],
  controllers: [UsersController, AdminUsersController],
  exports: [UsersService],
})
export class UsersModule {}
