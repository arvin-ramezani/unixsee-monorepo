import { Module } from '@nestjs/common';

import { AdminAgentCommandsController } from './controllers/admin-agent-commands.controller.js';
import { AgentCommandsService } from './services/agent-commands.service.js';

@Module({
  controllers: [AdminAgentCommandsController],
  providers: [AgentCommandsService],
  exports: [AgentCommandsService],
})
export class AgentCommandsModule {}
