import prisma from '../utils/prisma';
import { ExperienceRound, Difficulty } from '@prisma/client';

interface CreateExperienceInput {
  companyId: string;
  round: ExperienceRound;
  content: string;
  difficulty: Difficulty;
}

export class ExperienceService {
  async findAll(companyId?: string) {
    const where = companyId ? { companyId } : {};

    return prisma.experience.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, branch: true, graduationYear: true },
        },
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(input: CreateExperienceInput, userId: string) {
    const company = await prisma.company.findUnique({
      where: { id: input.companyId },
    });

    if (!company) {
      throw Object.assign(new Error('Company not found'), { statusCode: 404 });
    }

    return prisma.experience.create({
      data: {
        ...input,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, branch: true, graduationYear: true },
        },
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });
  }
}

export const experienceService = new ExperienceService();
