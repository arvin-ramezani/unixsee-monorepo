import { Module } from '@nestjs/common';

import { AdminUnixseeMessagesController } from './controllers/admin-unixsee-messages.controller.js';
import { UnixseeMessagesController } from './controllers/unixsee-messages.controller.js';
import { UnixseeMessagesService } from './services/unixsee-messages.service.js';

@Module({
  providers: [UnixseeMessagesService],
  controllers: [UnixseeMessagesController, AdminUnixseeMessagesController],
  exports: [UnixseeMessagesService],
})
export class UnixseeMessagesModule {}
