import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedalPostDto, UpdateMedalPostDto } from './dto';

@Injectable()
export class MedalPostsService {
  constructor(private prisma: PrismaService) {}

  // Obtener todas las publicaciones activas (público)
  async getActivePosts() {
    return this.prisma.medalPost.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  // Obtener todas las publicaciones (admin)
  async getAllPosts() {
    return this.prisma.medalPost.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  // Obtener una publicación por ID
  async getPostById(id: number) {
    const post = await this.prisma.medalPost.findUnique({
      where: { id }
    });

    if (!post) {
      throw new NotFoundException(`Publicación con ID ${id} no encontrada`);
    }

    return post;
  }

  // Crear nueva publicación
  async createPost(createPostDto: CreateMedalPostDto) {
    return this.prisma.medalPost.create({
      data: createPostDto
    });
  }

  // Actualizar publicación
  async updatePost(id: number, updatePostDto: UpdateMedalPostDto) {
    await this.getPostById(id);

    return this.prisma.medalPost.update({
      where: { id },
      data: updatePostDto
    });
  }

  // Eliminar publicación
  async deletePost(id: number) {
    await this.getPostById(id);

    return this.prisma.medalPost.delete({
      where: { id }
    });
  }

  // Obtener frentes de medallas (colores disponibles)
  async getMedalFronts() {
    return this.prisma.medalFront.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
