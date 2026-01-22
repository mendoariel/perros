import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto';
import { ImageResizeService } from '../services/image-resize.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private imageResizeService: ImageResizeService
  ) { }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        phonenumber: true,
        phoneNumber: true,
        role: true,
        userStatus: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            medals: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      ...user,
      phoneNumber: user.phoneNumber || user.phonenumber // Usar phoneNumber si existe, sino phonenumber
    };
  }

  async updateProfile(userId: number, dto: UpdateUserProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Preparar datos para actualizar
    const updateData: any = {};

    if (dto.phoneNumber !== undefined) {
      updateData.phoneNumber = dto.phoneNumber;
      // También actualizar phonenumber para mantener compatibilidad
      updateData.phonenumber = dto.phoneNumber;
    }
    if (dto.firstName !== undefined) {
      updateData.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName;
    }
    if (dto.bio !== undefined) {
      updateData.bio = dto.bio;
    }
    if (dto.address !== undefined) {
      updateData.address = dto.address;
    }
    if (dto.city !== undefined) {
      updateData.city = dto.city;
    }
    if (dto.country !== undefined) {
      updateData.country = dto.country;
    }

    updateData.updatedAt = new Date();


    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        phonenumber: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        bio: true,
        address: true,
        city: true,
        country: true,
        role: true,
        userStatus: true,
        updatedAt: true
      }
    });

    return {
      ...updatedUser,
      phoneNumber: updatedUser.phoneNumber || updatedUser.phonenumber
    };
  }

  async uploadAvatar(userId: number, filename: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const avatarUrl = `users/avatars/${filename}`;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: avatarUrl,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        avatar: true
      }
    });

    return updatedUser;
  }
}
