import { Module } from '@nestjs/common';

import { AgentController } from './agent.controller.js';
import { AgentService } from './agent.service.js';
import { AgentSignatureGuard } from './guards/agent-signature.guard.js';
import { ServersModule } from '#/modules/servers/servers.module.js';

@Module({
  imports: [ServersModule],
  controllers: [AgentController],
  providers: [AgentService, AgentSignatureGuard],
  exports: [AgentService],
})
export class AgentModule {}
