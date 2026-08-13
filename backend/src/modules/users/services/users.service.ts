import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import type { Prisma } from '#/generated/prisma/client.js';
import {
  Role,
  UserAccountStatus,
} from '#/generated/prisma/enums.js';
import bcrypt from 'bcryptjs';
import { createAppLogger } from '#/common/logging/app-logger.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

const userPublicOmit = {
  hashedRt: true,
  password: true,
} as const;

@Injectable()
export class UsersService {
  private readonly logger = createAppLogger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOneByPhoneNumber(phoneNumber: string) {
    return this.prisma.user.findUnique({
      where: { phoneNumber },
      omit: userPublicOmit,
    });
  }

  async findCustomerByPhoneOrEmail(input: {
    phoneNumber?: string | null;
    email?: string | null;
  }) {
    const phoneNumber = input.phoneNumber?.trim();
    const email = input.email?.trim().toLowerCase();
    const orConditions: Prisma.UserWhereInput[] = [];

    if (phoneNumber) {
      orConditions.push({ phoneNumber });
    }

    if (email) {
      orConditions.push({ email });
    }

    if (orConditions.length === 0) {
      return null;
    }

    return this.prisma.user.findFirst({
      where: {
        role: { in: [Role.USER, Role.TENANT] },
        OR: orConditions,
      },
      omit: userPublicOmit,
    });
  }

  async findCustomerOwningWebsiteDomain(domain: string) {
    const website = await this.prisma.website.findFirst({
      where: {
        OR: [
          { domain },
          { domain: `www.${domain}` },
        ],
        user: {
          role: { in: [Role.USER, Role.TENANT] },
        },
      },
      select: {
        id: true,
        domain: true,
        userId: true,
      },
    });

    return website;
  }

  async findOneById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      omit: {
        password: true,
      },
    });
  }

  async findOneByUsername({ username }: { username: string }) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async create(input: {
    username?: string | null;
    email?: string | null;
    fullName?: string | null;
    phoneNumber: string;
    password?: string | null;
    role?: Role;
    locale?: string;
  }) {
    const user = await this.prisma.user.create({
      data: {
        phoneNumber: input.phoneNumber,
        ...(input.password && { password: input.password }),
        ...(input.email && { email: input.email }),
        ...(input.fullName && { fullName: input.fullName }),
        ...(input.username && { username: input.username }),
        ...(input.role && { role: input.role }),
        ...(input.locale && { locale: input.locale }),
      },
      omit: userPublicOmit,
    });

    this.logger.log('user.created', {
      userId: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return user;
  }

  async updateRtHash({ userId, rt }: { userId: string; rt: string }) {
    const rtHash = await bcrypt.hash(rt, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: rtHash },
    });

    this.logger.debug('user.refresh_token_hash.updated', { userId });

    return rtHash;
  }

  async updateMe(
    userId: string,
    data: { fullName?: string; email?: string; locale?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      omit: userPublicOmit,
    });
  }

  async listAdmin(params?: { skip?: number; take?: number; search?: string }) {
    const where: Prisma.UserWhereInput = params?.search
      ? {
          OR: [
            { phoneNumber: { contains: params.search } },
            { email: { contains: params.search, mode: 'insensitive' } },
            { fullName: { contains: params.search, mode: 'insensitive' } },
            { username: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        omit: userPublicOmit,
        orderBy: { createdAt: 'desc' },
        skip: params?.skip ?? 0,
        take: params?.take ?? 50,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async getAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: userPublicOmit,
      include: {
        memberships: { include: { tenant: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }

    return user;
  }

  async createAdmin(input: {
    phoneNumber: string;
    email?: string;
    fullName?: string;
    username?: string;
    role?: Role;
    locale?: string;
  }) {
    return this.create({
      ...input,
      role: input.role ?? Role.USER,
    });
  }

  async updateAdmin(
    userId: string,
    data: {
      fullName?: string;
      email?: string | null;
      username?: string | null;
      role?: Role;
      locale?: string;
    },
  ) {
    await this.getAdmin(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data,
      omit: userPublicOmit,
    });
  }

  async suspend(userId: string, reason?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserAccountStatus.SUSPENDED,
        suspendedAt: new Date(),
        suspendedReason: reason ?? null,
        hashedRt: null,
      },
      omit: userPublicOmit,
    });

    this.logger.log('user.suspended', { userId, reason: reason ?? null });
    return user;
  }

  async restore(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserAccountStatus.ACTIVE,
        suspendedAt: null,
        suspendedReason: null,
      },
      omit: userPublicOmit,
    });

    this.logger.log('user.restored', { userId });
    return user;
  }
}
