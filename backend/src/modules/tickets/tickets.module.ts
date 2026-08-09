import { Module } from '@nestjs/common';

import { AdminTicketsController } from './controllers/admin-tickets.controller.js';
import { TicketsController } from './controllers/tickets.controller.js';
import { TicketsService } from './services/tickets.service.js';

@Module({
  providers: [TicketsService],
  controllers: [TicketsController, AdminTicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
