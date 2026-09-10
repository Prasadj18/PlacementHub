import prisma from '../utils/prisma';

interface UpdateProfileInput {
  name?: string;
  branch?: string;
  graduationYear?: number;
}

export class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        branch: true,
        graduationYear: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
            experiences: true,
          },
        },
      },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        name: true,
        email: true,
        branch: true,
        graduationYear: true,
        createdAt: true,
      },
    });

    return user;
  }
}

export const profileService = new ProfileService();
