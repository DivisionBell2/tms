import { Injectable } from '@nestjs/common';
import type { User } from '../generated/prisma/client';
import type { UpdateProfileRequestDto, UserPublicDto } from '@tms/contracts';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  toPublic(user: User): UserPublicDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarFileId: user.avatarFileId,
      createdAt: user.createdAt.toISOString(),
    };
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: { email: string; passwordHash: string; displayName: string }) {
    return this.prisma.user.create({ data });
  }

  async updateProfile(dto: UpdateProfileRequestDto) {
    return this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        displayName: dto.displayName,
        avatarFileId: dto.avatarFileId,
      },
    });
  }
}