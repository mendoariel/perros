import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { SaveMedalFrontDto } from './dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Obtener todas las medallas virgin
  async getVirginMedals() {
    return await this.prisma.virginMedal.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Obtener estadísticas
  async getStats() {
    const total = await this.prisma.virginMedal.count();
    
    const statsByStatus = await this.prisma.virginMedal.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const stats = {
      total,
      virgin: 0,
      enabled: 0,
      disabled: 0,
      dead: 0,
      registerProcess: 0,
      pendingConfirmation: 0,
      incomplete: 0,
      registered: 0
    };

    statsByStatus.forEach(item => {
      const status = item.status.toLowerCase();
      if (stats.hasOwnProperty(status)) {
        stats[status] = item._count.status;
      }
    });

    return stats;
  }

  // Crear hash único
  private async createUniqueHash(): Promise<string> {
    let medalString = randomBytes(18).toString('hex');
    console.log('Generated hash:', medalString);
    
    const existingMedal = await this.prisma.virginMedal.findFirst({
      where: { medalString: medalString }
    });
    
    if (existingMedal) {
      console.log('Hash already exists, generating new one');
      return this.createUniqueHash();
    }
    
    console.log('Hash is unique');
    return medalString;
  }

  // Crear nuevas medallas virgin
  async createVirginMedals(quantity: number, registerHash: string) {
    console.log('Creating virgin medals:', { quantity, registerHash });
    const createdMedals = [];

    try {
      for (let i = 0; i < quantity; i++) {
        console.log(`Creating medal ${i + 1}/${quantity}`);
        const medalString = await this.createUniqueHash();
        console.log('Generated medal string:', medalString);
        
        const medal = await this.prisma.virginMedal.create({
          data: {
            status: 'VIRGIN' as any,
            medalString: medalString,
            registerHash: registerHash
          }
        });

        console.log('Created medal:', medal.id);
        createdMedals.push(medal);
      }

      return {
        message: `${quantity} medallas creadas exitosamente`,
        registerHash,
        createdCount: createdMedals.length
      };
    } catch (error) {
      console.error('Error creating medals:', error);
      throw error;
    }
  }

  // Actualizar estado de una medalla
  async updateMedalStatus(id: number, status: string) {
    const validStatuses = [
      'VIRGIN', 'ENABLED', 'DISABLED', 'DEAD', 
      'REGISTER_PROCESS', 'PENDING_CONFIRMATION', 'INCOMPLETE', 'REGISTERED'
    ];

    if (!validStatuses.includes(status)) {
      throw new Error('Estado no válido');
    }

    const updatedMedal = await this.prisma.virginMedal.update({
      where: { id },
      data: { 
        status: status as any,
        updatedAt: new Date()
      }
    });

    return {
      message: 'Estado actualizado exitosamente',
      medal: updatedMedal
    };
  }

  // Eliminar medalla
  async deleteMedal(id: number) {
    await this.prisma.virginMedal.delete({
      where: { id }
    });

    return {
      message: 'Medalla eliminada exitosamente'
    };
  }

  // Obtener medallas para generar QR codes (solo datos, sin generar QR)
  async getMedalsForQR(medalIds: number[]) {
    try {
      const medals = await this.prisma.virginMedal.findMany({
        where: {
          id: {
            in: medalIds
          }
        },
        select: {
          id: true,
          medalString: true,
          status: true,
          createdAt: true
        }
      });

      if (medals.length === 0) {
        throw new Error('No se encontraron medallas con los IDs proporcionados');
      }

      // Agregar la URL que se usará para el QR
      const medalsWithQRData = medals.map(medal => ({
        ...medal,
        qrData: `https://peludosclick.com/mascota-checking?medalString=${medal.medalString}`
      }));

      return {
        message: `${medalsWithQRData.length} medallas obtenidas para generar QR`,
        medals: medalsWithQRData
      };
    } catch (error) {
      throw new Error(`Error al obtener medallas: ${error.message}`);
    }
  }

  // Obtener medallas virgin por cantidad para generar QR
  async getVirginMedalsForQR(quantity: number) {
    try {
      const medals = await this.prisma.virginMedal.findMany({
        where: {
          status: 'VIRGIN'
        },
        take: quantity,
        orderBy: {
          createdAt: 'asc'
        },
        select: {
          id: true,
          medalString: true,
          status: true,
          createdAt: true
        }
      });

      if (medals.length === 0) {
        throw new Error('No hay medallas virgin disponibles');
      }

      if (medals.length < quantity) {
        console.warn(`Solo se encontraron ${medals.length} medallas virgin de las ${quantity} solicitadas`);
      }

      // Agregar la URL que se usará para el QR
      const medalsWithQRData = medals.map(medal => ({
        ...medal,
        qrData: `https://peludosclick.com/mascota-checking?medalString=${medal.medalString}`
      }));

      return {
        message: `${medalsWithQRData.length} medallas virgin obtenidas para generar QR`,
        medals: medalsWithQRData,
        requestedQuantity: quantity,
        availableQuantity: medalsWithQRData.length
      };
    } catch (error) {
      throw new Error(`Error al obtener medallas virgin: ${error.message}`);
    }
  }

  // ===== FRENTES DE MEDALLAS =====

  // Obtener todos los frentes de medallas
  async getMedalFronts() {
    try {
      const medalFronts = await this.prisma.medalFront.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        medalFronts: medalFronts
      };
    } catch (error) {
      console.error('Error getting medal fronts:', error);
      throw new Error('Error al obtener frentes de medallas');
    }
  }

  // Guardar un nuevo frente de medalla
  async saveMedalFront(dto: SaveMedalFrontDto) {
    try {
      const medalFront = await this.prisma.medalFront.create({
        data: {
          name: dto.name,
          description: dto.description || '',
          type: dto.type,
          size: dto.size,
          width: dto.width,
          height: dto.height,
          backgroundColor: dto.backgroundColor,
          logoColor: dto.logoColor,
          logoSize: dto.logoSize,
          logoX: dto.logoX,
          logoY: dto.logoY,
          borderRadius: dto.borderRadius,
          useBackgroundImage: dto.useBackgroundImage,
          backgroundImage: dto.backgroundImage,
          backgroundImageSize: dto.backgroundImageSize,
          backgroundImageX: dto.backgroundImageX,
          backgroundImageY: dto.backgroundImageY,
          fileName: '', // Campo requerido pero no usado
          userId: 1 // Usuario por defecto del dashboard
        }
      });

      return {
        success: true,
        message: 'Frente de medalla guardado exitosamente',
        medalFront: medalFront
      };
    } catch (error) {
      console.error('Error saving medal front:', error);
      throw new Error('Error al guardar frente de medalla');
    }
  }

  // Eliminar un frente de medalla
  async deleteMedalFront(id: string) {
    try {
      await this.prisma.medalFront.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Frente de medalla eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting medal front:', error);
      throw new Error('Error al eliminar frente de medalla');
    }
  }

  // Obtener un frente de medalla específico
  async getMedalFront(id: string) {
    try {
      const medalFront = await this.prisma.medalFront.findUnique({
        where: { id }
      });

      if (!medalFront) {
        throw new Error('Frente de medalla no encontrado');
      }

      return {
        success: true,
        medalFront: medalFront
      };
    } catch (error) {
      console.error('Error getting medal front:', error);
      throw new Error('Error al obtener frente de medalla');
    }
  }
} 