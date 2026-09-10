import prisma from '../utils/prisma';
import { WorkMode } from '@prisma/client';

interface CreateCompanyInput {
  name: string;
  role: string;
  ctc?: string;
  description?: string;
  eligibility?: string;
  eligibleBranches?: string[];
  location?: string;
  workMode?: WorkMode;
  notes?: string;
  logoUrl?: string;
}

export class CompanyService {
  async create(input: CreateCompanyInput, userId: string) {
    // Create company and auto-create application in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          ...input,
          workMode: input.workMode || 'ONSITE',
          eligibleBranches: input.eligibleBranches || [],
          createdById: userId,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Auto-create application with APPLIED status
      const application = await tx.application.create({
        data: {
          userId,
          companyId: company.id,
          status: 'APPLIED',
        },
      });

      // Create activity log
      await tx.activityLog.create({
        data: {
          userId,
          action: 'COMPANY_CREATED',
          entity: 'Company',
          entityId: company.id,
          newValue: { name: company.name, role: company.role },
        },
      });

      // Create notification for the user
      await tx.notification.create({
        data: {
          userId,
          type: 'GENERAL',
          title: 'Company Added',
          message: `You added ${company.name} and your application is now tracked.`,
          entityId: company.id,
          entityType: 'Company',
        },
      });

      return { company, application };
    });

    return result;
  }

  async findAll() {
    return prisma.company.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        _count: {
          select: { applications: true, events: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId?: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        events: {
          orderBy: { dateTime: 'asc' },
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { applications: true, experiences: true },
        },
      },
    });

    if (!company) {
      throw Object.assign(new Error('Company not found'), { statusCode: 404 });
    }

    // Get user's application for this company if userId provided
    let userApplication = null;
    if (userId) {
      userApplication = await prisma.application.findUnique({
        where: {
          userId_companyId: { userId, companyId: id },
        },
      });
    }

    return { ...company, userApplication };
  }

  async update(id: string, input: Partial<CreateCompanyInput>, userId: string) {
    const existing = await prisma.company.findUnique({ where: { id } });

    if (!existing) {
      throw Object.assign(new Error('Company not found'), { statusCode: 404 });
    }

    const company = await prisma.company.update({
      where: { id },
      data: input,
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'COMPANY_UPDATED',
        entity: 'Company',
        entityId: id,
        previousValue: { name: existing.name, role: existing.role },
        newValue: { name: company.name, role: company.role },
      },
    });

    return company;
  }

  async delete(id: string, userId: string) {
    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
      throw Object.assign(new Error('Company not found'), { statusCode: 404 });
    }

    if (company.createdById !== userId) {
      throw Object.assign(new Error('Not authorized to delete this company'), { statusCode: 403 });
    }

    await prisma.company.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'COMPANY_DELETED',
        entity: 'Company',
        entityId: id,
        previousValue: { name: company.name, role: company.role },
      },
    });

    return { message: 'Company deleted successfully' };
  }
}

export const companyService = new CompanyService();
