import { prisma } from '../../../Infrastructure/Persistence/prisma.js';

export class GetAdminDashboardUseCase {
  async execute() {
    // 1. Total Users
    const totalUsersCount = await prisma.profiles.count({ where: { role: 'USER' } });
    
    // Growth calculation logic can be added here.
    // For now we'll mock growth text to match UI
    
    // 2. Active Users (Simulate with activity log count, or users created this month)
    const activeUsersCount = await prisma.user_activity_log.groupBy({
      by: ['user_id'],
      _count: true
    }).then(res => res.length);

    // 3. Revenue (Sum of successful payments)
    const revenueObj = await prisma.payment_transactions.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' } // Assuming 'SUCCESS' or '00' is the completed status
    });
    const totalRevenue = revenueObj._sum.amount || 0;
    // Format to 'Tr VNĐ'
    const revenueFormatted = totalRevenue > 0 ? `${Math.round(totalRevenue / 1000000)}Tr VNĐ` : '0Tr VNĐ';

    // 4. Total Lessons
    const totalLessonsCount = await prisma.lessons.count();

    // 5. Completion Data
    const completedProgress = await prisma.user_lesson_progress.count({ where: { is_completed: true } });
    const inProgressProgress = await prisma.user_lesson_progress.count({ where: { is_completed: false } });
    const notStartedEst = Math.max(0, (totalUsersCount * totalLessonsCount) - (completedProgress + inProgressProgress));

    const totalCalculated = completedProgress + inProgressProgress + notStartedEst;
    // Use percentages for the chart
    const getPercent = (val) => totalCalculated > 0 ? Math.round((val / totalCalculated) * 100) : 0;
    
    let compPer = getPercent(completedProgress);
    let inProgPer = getPercent(inProgressProgress);
    let notStartPer = getPercent(notStartedEst);
    if(totalCalculated === 0) {
       notStartPer = 100;
    }

    // Return structured payload matching the UI needs
    return {
      summary: {
        totalUsers: totalUsersCount.toString(),
        totalUsersGrowth: "Tăng 5% so với tháng trước",
        activeUsers: activeUsersCount.toString(),
        activeUsersGrowth: "Tăng 3% so với tháng trước",
        revenue: revenueFormatted,
        revenueGrowth: "Tăng 10% so với tháng trước",
        totalLessons: totalLessonsCount.toString(),
        totalLessonsGrowth: "Tăng 2% so với tháng trước"
      },
      // Mocked sequential data for now since we'd need complex grouping by month
      activityChart: [
        { name: 'Jan', value: 75 },
        { name: 'Feb', value: 85 },
        { name: 'Mar', value: 50 },
        { name: 'Apr', value: 92 },
        { name: 'May', value: 115 },
        { name: 'Jun', value: 85 },
        { name: 'Jul', value: 105 },
        { name: 'Aug', value: 95 },
        { name: 'Sep', value: 125 },
        { name: 'Oct', value: 80 },
        { name: 'Nov', value: 100 },
        { name: 'Dec', value: 85 },
      ],
      completionData: [
        { name: 'Completed', value: compPer, color: '#0275d8' },
        { name: 'In Progress', value: inProgPer, color: '#e066ff' },
        { name: 'Not Started', value: notStartPer, color: '#ff0000' }
      ],
      // Mocked growth chart
      growthChart: [
        { name: 'Jan', value: 100 },
        { name: '', value: 120 },
        { name: '', value: 350 },
        { name: '', value: 250 },
        { name: '', value: 400 },
        { name: '', value: 280 },
        { name: 'Feb', value: 450 },
        { name: '', value: 300 },
        { name: '', value: 350 },
        { name: '', value: 320 },
        { name: '', value: 380 },
        { name: '', value: 350 },
        { name: '', value: 450 },
        { name: '', value: 420 },
        { name: '', value: 400 },
        { name: 'Mar', value: 420 }
      ]
    };
  }
}
