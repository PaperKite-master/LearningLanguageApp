import { GetAdminDashboardUseCase } from '../../Application/UseCases/adminDashboard/getAdminDashboard.usecase.js';

export const adminDashboardController = {
  getDashboardStats: async (request, reply) => {
    try {
      const useCase = new GetAdminDashboardUseCase();
      const stats = await useCase.execute();
      return reply.send({ data: stats });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  }
};
