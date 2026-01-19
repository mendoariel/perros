import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto';
import { ImageResizeService } from '../services/image-resize.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private imageResizeService: ImageResizeService
  ) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        phonenumber: true, // Mantener por compatibilidad
        avatar: true,
        bio: true,
        address: true,
        city: true,
        country: true,
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

    // Usar phoneNumber si existe, sino usar phonenumber (compatibilidad)
    const phone = user.phoneNumber || user.phonenumber;

    return {
      ...user,
      phoneNumber: phone,
      phonenumber: undefined // No exponer el campo antiguo
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

    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.phoneNumber !== undefined) {
      updateData.phoneNumber = dto.phoneNumber;
      // También actualizar phonenumber por compatibilidad
      updateData.phonenumber = dto.phoneNumber;
    }
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.country !== undefined) updateData.country = dto.country;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;

    updateData.updatedAt = new Date();

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatar: true,
        bio: true,
        address: true,
        city: true,
        country: true,
        role: true,
        userStatus: true,
        updatedAt: true
      }
    });

    return updatedUser;
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
