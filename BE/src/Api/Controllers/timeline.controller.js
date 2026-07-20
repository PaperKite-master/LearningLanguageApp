import { getTimelineUseCase } from '../../Application/UseCases/getTimeline.usecase.js';
import { listTimelinesUseCase } from '../../Application/UseCases/listTimelines.usecase.js';
import {
  assertTimelineAccessible,
  getUserRole,
  withTimelineLockFlags,
} from '../../Shared/planAccess.js';

export const timelineController = {
  list: async (request, reply) => {
    const timelines = await listTimelinesUseCase({ timelineRepo: request.timelineRepo });
    const role = await getUserRole(request.server.prisma, request.user?.sub);
    const data = withTimelineLockFlags(timelines, role);
    return reply.send({ data });
  },

  detail: async (request, reply) => {
    try {
      const role = await getUserRole(request.server.prisma, request.user?.sub);
      await assertTimelineAccessible(request.server.prisma, request.params.id, role);

      const timeline = await getTimelineUseCase({
        timelineRepo: request.timelineRepo,
        id: request.params.id
      });

      return reply.send({
        data: {
          ...timeline,
          isLocked: false,
        },
      });
    } catch (err) {
      if (err?.statusCode === 403) {
        return reply.code(403).send({ error: err.message });
      }
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
