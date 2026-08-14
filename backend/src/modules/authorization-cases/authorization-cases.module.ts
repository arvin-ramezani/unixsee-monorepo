import { Module } from '@nestjs/common';

import { AdminAuthorizationCasesController } from './controllers/admin-authorization-cases.controller.js';
import { AuthorizationCasesController } from './controllers/authorization-cases.controller.js';
import { AuthorizationCasesService } from './services/authorization-cases.service.js';

@Module({
  providers: [AuthorizationCasesService],
  controllers: [
    AuthorizationCasesController,
    AdminAuthorizationCasesController,
  ],
  exports: [AuthorizationCasesService],
})
export class AuthorizationCasesModule {}
