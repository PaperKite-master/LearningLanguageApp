import { timelineController } from '../Controllers/timeline.controller.js';
import { timelineRepoPlugin } from '../Middlewares/timelineRepo.middleware.js';
import { TimelineIdParamsSchema, TimelineListResponseSchema, TimelineResponseSchema } from '../Schemas/timeline.schemas.js';

export async function timelineRoutes(app) {
  await app.register(timelineRepoPlugin);

  app.get(
    '/',
    {
      schema: {
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
      schema: {
        params: TimelineIdParamsSchema,
        response: {
          200: TimelineResponseSchema
        }
      }
    },
    timelineController.detail
  );
}
