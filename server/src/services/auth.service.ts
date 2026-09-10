import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { env } from '../config/env';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  branch: string;
  graduationYear: number;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const domain = input.email.split('@')[1];
    if (domain !== env.COLLEGE_EMAIL_DOMAIN) {
      throw Object.assign(new Error(`Only @${env.COLLEGE_EMAIL_DOMAIN} emails are allowed`), { statusCode: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        branch: input.branch,
        graduationYear: input.graduationYear,
      },
      select: {
        id: true,
        name: true,
        email: true,
        branch: true,
        graduationYear: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    return { user, token };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);

    if (!isValidPassword) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        graduationYear: user.graduationYear,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        branch: true,
        graduationYear: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }
}

export const authService = new AuthService();
