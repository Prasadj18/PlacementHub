import prisma from '../utils/prisma';

export class DashboardService {
  async getDashboard(userId: string) {
    const now = new Date();

    // Get application counts by status
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            role: true,
            ctc: true,
            location: true,
            workMode: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const totalApplied = applications.length;
    const shortlisted = applications.filter(
      (a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW' || a.status === 'SELECTED'
    ).length;
    const interviews = applications.filter((a) => a.status === 'INTERVIEW').length;
    const selected = applications.filter((a) => a.status === 'SELECTED').length;

    // Get upcoming events for companies the user has applied to
    const appliedCompanyIds = applications.map((a) => a.companyId);

    const upcomingEvents = await prisma.event.findMany({
      where: {
        companyId: { in: appliedCompanyIds },
        dateTime: { gte: now },
      },
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
      orderBy: { dateTime: 'asc' },
      take: 10,
    });

    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

    // Recent applications (last 5)
    const recentApplications = applications.slice(0, 5);

    return {
      stats: {
        totalApplied,
        shortlisted,
        interviews,
        selected,
      },
      nextEvent,
      upcomingEvents: upcomingEvents.slice(0, 5),
      recentApplications,
    };
  }
}

export const dashboardService = new DashboardService();
