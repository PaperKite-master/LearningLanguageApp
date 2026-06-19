export const AdminDashboardResponseSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'object',
      properties: {
        totalUsers: { type: 'string' },
        totalUsersGrowth: { type: 'string' },
        activeUsers: { type: 'string' },
        activeUsersGrowth: { type: 'string' },
        revenue: { type: 'string' },
        revenueGrowth: { type: 'string' },
        totalLessons: { type: 'string' },
        totalLessonsGrowth: { type: 'string' },
      }
    },
    activityChart: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          value: { type: 'number' }
        }
      }
    },
    completionData: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          value: { type: 'number' },
          color: { type: 'string' }
        }
      }
    },
    growthChart: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          value: { type: 'number' }
        }
      }
    }
  }
};
