import prisma from '../utils/prisma';

export class ActivityLogService {
  async findAll(limit: number = 50) {
    return prisma.activityLog.findMany({
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByEntity(entity: string, entityId: string) {
    return prisma.activityLog.findMany({
      where: { entity, entityId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const activityLogService = new ActivityLogService();
