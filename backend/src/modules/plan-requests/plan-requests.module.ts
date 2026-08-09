import { Module } from '@nestjs/common';

import { AdminPlanRequestsController } from './controllers/admin-plan-requests.controller.js';
import { PlanRequestsController } from './controllers/plan-requests.controller.js';
import { PublicPlanRequestsController } from './controllers/public-plan-requests.controller.js';
import { PlanRequestsService } from './services/plan-requests.service.js';

@Module({
  providers: [PlanRequestsService],
  controllers: [
    PublicPlanRequestsController,
    PlanRequestsController,
    AdminPlanRequestsController,
  ],
  exports: [PlanRequestsService],
})
export class PlanRequestsModule {}
