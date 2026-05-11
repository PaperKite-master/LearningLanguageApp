import { adminTimelineController } from '../Controllers/adminTimeline.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import { timelineRepoPlugin } from '../Middlewares/timelineRepo.middleware.js';
import {
  CreateTimelineBodySchema,
  TimelineIdParamsSchema,
  TimelineResponseSchema,
  UpdateTimelineBodySchema
} from '../Schemas/adminTimeline.schemas.js';

export async function adminTimelineRoutes(app) {
  await app.register(timelineRepoPlugin);

  app.post(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        security: [{ bearerAuth: [] }],
        body: CreateTimelineBodySchema,
        response: {
          201: TimelineResponseSchema
        }
      }
    },
    adminTimelineController.create
  );

  app.patch(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        security: [{ bearerAuth: [] }],
        params: TimelineIdParamsSchema,
        body: UpdateTimelineBodySchema,
        response: {
          200: TimelineResponseSchema
        }
      }
    },
    adminTimelineController.update
  );

  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        security: [{ bearerAuth: [] }],
        params: TimelineIdParamsSchema,
        response: {
          204: {}
        }
      }
    },
    adminTimelineController.remove
  );
}
