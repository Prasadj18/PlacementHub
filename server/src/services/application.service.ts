import prisma from '../utils/prisma';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationService {
  async findByUser(userId: string) {
    return prisma.application.findMany({
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
  }

  async create(userId: string, companyId: string) {
    // Check if application already exists
    const existing = await prisma.application.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (existing) {
      throw Object.assign(new Error('Application already exists for this company'), { statusCode: 409 });
    }

    return prisma.application.create({
      data: {
        userId,
        companyId,
        status: 'APPLIED',
      },
      include: {
        company: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  }

  async updateStatus(id: string, status: ApplicationStatus, userId: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });

    if (!application) {
      throw Object.assign(new Error('Application not found'), { statusCode: 404 });
    }

    if (application.userId !== userId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }

    const previousStatus = application.status;

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        company: {
          select: { id: true, name: true, role: true, ctc: true, location: true, workMode: true, logoUrl: true },
        },
      },
    });

    // Create notification about status change
    await prisma.notification.create({
      data: {
        userId,
        type: 'GENERAL',
        title: 'Application Updated',
        message: `Your ${application.company.name} application status changed from ${previousStatus} to ${status}.`,
        entityId: application.companyId,
        entityType: 'Application',
      },
    });

    return updated;
  }
}

export const applicationService = new ApplicationService();
