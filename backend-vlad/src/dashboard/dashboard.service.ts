import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'hash-generator';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Obtener todas las medallas virgin
  async getVirginMedals() {
    return await this.prisma.virginMedals.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  // Obtener estadísticas
  async getStats() {
    const total = await this.prisma.virginMedals.count();
    
    const statsByStatus = await this.prisma.virginMedals.groupBy({
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
    let medalString = createHash(36);
    const existingMedal = await this.prisma.virginMedals.findFirst({
      where: { medal_string: medalString }
    });
    
    if (existingMedal) {
      return this.createUniqueHash();
    }
    
    return medalString;
  }

  // Crear nuevas medallas virgin
  async createVirginMedals(quantity: number, registerHash: string) {
    const createdMedals = [];

    for (let i = 0; i < quantity; i++) {
      const medalString = await this.createUniqueHash();
      
      const medal = await this.prisma.virginMedals.create({
        data: {
          status: 'VIRGIN',
          medal_string: medalString,
          register_hash: registerHash
        }
      });

      createdMedals.push(medal);
    }

    return {
      message: `${quantity} medallas creadas exitosamente`,
      registerHash,
      createdCount: createdMedals.length
    };
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

    const updatedMedal = await this.prisma.virginMedals.update({
      where: { id },
      data: { 
        status,
        updated_at: new Date()
      }
    });

    return {
      message: 'Estado actualizado exitosamente',
      medal: updatedMedal
    };
  }

  // Eliminar medalla
  async deleteMedal(id: number) {
    await this.prisma.virginMedals.delete({
      where: { id }
    });

    return {
      message: 'Medalla eliminada exitosamente'
    };
  }

  // Obtener medallas para generar QR codes (solo datos, sin generar QR)
  async getMedalsForQR(medalIds: number[]) {
    try {
      const medals = await this.prisma.virginMedals.findMany({
        where: {
          id: {
            in: medalIds
          }
        },
        select: {
          id: true,
          medal_string: true,
          status: true,
          created_at: true
        }
      });

      if (medals.length === 0) {
        throw new Error('No se encontraron medallas con los IDs proporcionados');
      }

      // Agregar la URL que se usará para el QR
      const medalsWithQRData = medals.map(medal => ({
        ...medal,
        qrData: `https://peludosclick.com/mascota-checking?medalString=${medal.medal_string}`
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
      const medals = await this.prisma.virginMedals.findMany({
        where: {
          status: 'VIRGIN'
        },
        take: quantity,
        orderBy: {
          created_at: 'asc'
        },
        select: {
          id: true,
          medal_string: true,
          status: true,
          created_at: true
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
        qrData: `https://peludosclick.com/mascota-checking?medalString=${medal.medal_string}`
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
} 