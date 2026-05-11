import { createTimelineUseCase } from '../../Application/UseCases/createTimeline.usecase.js';
import { updateTimelineUseCase } from '../../Application/UseCases/updateTimeline.usecase.js';
import { deleteTimelineUseCase } from '../../Application/UseCases/deleteTimeline.usecase.js';

export const adminTimelineController = {
  create: async (request, reply) => {
    try {
      const timeline = await createTimelineUseCase({
        timelineRepo: request.timelineRepo,
        payload: request.body
      });
      return reply.code(201).send({ data: timeline });
    } catch (err) {
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request body' });
      }
      throw err;
    }
  },

  update: async (request, reply) => {
    try {
      const timeline = await updateTimelineUseCase({
        timelineRepo: request.timelineRepo,
        id: request.params.id,
        payload: request.body
      });
      return reply.send({ data: timeline });
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Timeline not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request body' });
      }
      throw err;
    }
  },

  remove: async (request, reply) => {
    try {
      await deleteTimelineUseCase({ timelineRepo: request.timelineRepo, id: request.params.id });
      return reply.code(204).send();
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Timeline not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request params' });
      }
      throw err;
    }
  }
};
