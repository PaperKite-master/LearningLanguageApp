import { timelineController } from '../Controllers/timeline.controller.js';
import { timelineRepoPlugin } from '../Middlewares/timelineRepo.middleware.js';
import { authenticate } from '../Middlewares/authenticate.js';
import { TimelineIdParamsSchema, TimelineListResponseSchema, TimelineResponseSchema } from '../Schemas/timeline.schemas.js';

export async function timelineRoutes(app) {
  await app.register(timelineRepoPlugin);

  app.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          200: TimelineListResponseSchema
        }
      }
    },
    timelineController.list
  );

  app.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        security: [{ bearerAuth: [] }],
        params: TimelineIdParamsSchema,
        response: {
          200: TimelineResponseSchema
        }
      }
    },
    timelineController.detail
  );
}
