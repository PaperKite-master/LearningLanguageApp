import { getTimelineUseCase } from '../../Application/UseCases/getTimeline.usecase.js';
import { listTimelinesUseCase } from '../../Application/UseCases/listTimelines.usecase.js';

export const timelineController = {
  list: async (request, reply) => {
    const timelines = await listTimelinesUseCase({ timelineRepo: request.timelineRepo });
    return reply.send({ data: timelines });
  },

  detail: async (request, reply) => {
    try {
      const timeline = await getTimelineUseCase({
        timelineRepo: request.timelineRepo,
        id: request.params.id
      });

      return reply.send({ data: timeline });
    } catch (err) {
      if (err?.statusCode === 404) {
        return reply.code(404).send({ error: 'Timeline not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request params' });
      }
      throw err;
    }
  }
};
