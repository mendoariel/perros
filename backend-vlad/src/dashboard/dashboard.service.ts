import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';
import { SaveMedalFrontDto } from './dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

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

  // Identificar usuarios con problemas de medallas
  async getUsersWithMedalProblems() {
    const usersWithProblems = await this.prisma.user.findMany({
      where: {
        OR: [
          // Usuarios PENDING con medallas REGISTER_PROCESS
          {
            userStatus: 'PENDING',
            medals: {
              some: {
                status: 'REGISTER_PROCESS'
              }
            }
          },
          // Usuarios ACTIVE con medallas INCOMPLETE
          {
            userStatus: 'ACTIVE',
            medals: {
              some: {
                status: 'INCOMPLETE'
              }
            }
          },
          // Usuarios con medallas PENDING_CONFIRMATION
          {
            medals: {
              some: {
                status: 'PENDING_CONFIRMATION'
              }
            }
          }
        ]
      },
      include: {
        medals: true
      }
    });

    return usersWithProblems.map(user => ({
      id: user.id,
      email: user.email,
      userStatus: user.userStatus,
      medals: user.medals.map(medal => ({
        id: medal.id,
        medalString: medal.medalString,
        status: medal.status,
        petName: medal.petName,
        createdAt: medal.createAt
      })),
      problemType: this.identifyProblemType(user)
    }));
  }

  // Identificar el tipo de problema del usuario
  private identifyProblemType(user: any) {
    const problems = [];
    
    if (user.userStatus === 'PENDING') {
      problems.push('ACCOUNT_CONFIRMATION_NEEDED');
    }
    
    const medalStatuses = user.medals.map(m => m.status);
    if (medalStatuses.includes('INCOMPLETE')) {
      problems.push('MEDAL_INCOMPLETE');
    }
    if (medalStatuses.includes('PENDING_CONFIRMATION')) {
      problems.push('MEDAL_CONFIRMATION_NEEDED');
    }
    if (medalStatuses.includes('REGISTER_PROCESS')) {
      problems.push('MEDAL_REGISTRATION_PROCESS');
    }
    
    return problems;
  }

  // Restaurar medalla problemática
  async restoreProblematicMedal(userId: number, medalString: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Obtener usuario y medalla
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { medals: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const medal = user.medals.find(m => m.medalString === medalString);
      if (!medal) {
        throw new Error('Medalla no encontrada');
      }

      // Restaurar virgin medal a REGISTER_PROCESS
      await tx.virginMedal.update({
        where: { medalString },
        data: { status: 'REGISTER_PROCESS' }
      });

      // Actualizar medalla según el estado actual
      let newStatus: 'REGISTER_PROCESS' | 'INCOMPLETE' = 'REGISTER_PROCESS';
      if (user.userStatus === 'ACTIVE') {
        newStatus = 'INCOMPLETE'; // Necesita confirmación de medalla
      }

      await tx.medal.update({
        where: { medalString },
        data: { status: newStatus }
      });

      // Si el usuario está PENDING, actualizar a ACTIVE
      if (user.userStatus === 'PENDING') {
        await tx.user.update({
          where: { id: userId },
          data: { userStatus: 'ACTIVE' }
        });
      }

      // Enviar email de notificación
      try {
        await this.mailService.sendMedalRestoredNotification(
          user.email,
          medal.petName,
          medalString
        );
      } catch (error) {
        console.error('Error enviando email de restauración:', error);
      }

      return {
        message: 'Medalla restaurada exitosamente',
        userStatus: user.userStatus === 'PENDING' ? 'ACTIVE' : user.userStatus,
        medalStatus: newStatus,
        needsEmail: true,
        emailSent: true
      };
    });
  }

  // Restaurar todas las medallas problemáticas de un usuario
  async restoreAllUserMedals(userId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { medals: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const restoredMedals = [];

      for (const medal of user.medals) {
        // Restaurar virgin medal
        await tx.virginMedal.update({
          where: { medalString: medal.medalString },
          data: { status: 'REGISTER_PROCESS' }
        });

        // Actualizar medalla
        let newStatus: 'REGISTER_PROCESS' | 'INCOMPLETE' = 'REGISTER_PROCESS';
        if (user.userStatus === 'ACTIVE') {
          newStatus = 'INCOMPLETE';
        }

        await tx.medal.update({
          where: { medalString: medal.medalString },
          data: { status: newStatus }
        });

        restoredMedals.push({
          medalString: medal.medalString,
          oldStatus: medal.status,
          newStatus
        });
      }

      // Actualizar usuario si es necesario
      if (user.userStatus === 'PENDING') {
        await tx.user.update({
          where: { id: userId },
          data: { userStatus: 'ACTIVE' }
        });
      }

      // Enviar emails de notificación para cada medalla
      for (const medal of restoredMedals) {
        try {
          await this.mailService.sendMedalRestoredNotification(
            user.email,
            medal.petName || 'Tu mascota',
            medal.medalString
          );
        } catch (error) {
          console.error(`Error enviando email para medalla ${medal.medalString}:`, error);
        }
      }

      return {
        message: `${restoredMedals.length} medallas restauradas`,
        userStatus: user.userStatus === 'PENDING' ? 'ACTIVE' : user.userStatus,
        restoredMedals,
        needsEmail: true,
        emailsSent: restoredMedals.length
      };
    });
  }

  // Obtener estadísticas de problemas
  async getMedalProblemStats() {
    const stats = await this.prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT u.id) as total_users_with_problems,
        COUNT(CASE WHEN u.user_status = 'PENDING' THEN 1 END) as pending_users,
        COUNT(CASE WHEN m.status = 'INCOMPLETE' THEN 1 END) as incomplete_medals,
        COUNT(CASE WHEN m.status = 'PENDING_CONFIRMATION' THEN 1 END) as pending_confirmation_medals,
        COUNT(CASE WHEN m.status = 'REGISTER_PROCESS' THEN 1 END) as register_process_medals
      FROM users u
      LEFT JOIN medals m ON u.id = m.owner_id
      WHERE u.user_status = 'PENDING' 
         OR m.status IN ('INCOMPLETE', 'PENDING_CONFIRMATION', 'REGISTER_PROCESS')
    `;

    // Convertir BigInt a números para evitar problemas de serialización
    const result = stats[0] as any;
    return {
      total_users_with_problems: Number(result.total_users_with_problems),
      pending_users: Number(result.pending_users),
      incomplete_medals: Number(result.incomplete_medals),
      pending_confirmation_medals: Number(result.pending_confirmation_medals),
      register_process_medals: Number(result.register_process_medals)
    };
  }

  // Eliminar usuario problemático y restaurar virgin_medals
  async deleteProblematicUser(userId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { medals: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const deletedMedals = [];

      // Restaurar virgin_medals a estado VIRGIN
      for (const medal of user.medals) {
        await tx.virginMedal.update({
          where: { medalString: medal.medalString },
          data: { status: 'VIRGIN' }
        });

        deletedMedals.push({
          medalString: medal.medalString,
          petName: medal.petName,
          oldStatus: medal.status
        });
      }

      // Eliminar medallas del usuario
      await tx.medal.deleteMany({
        where: { ownerId: userId }
      });

      // Eliminar usuario
      await tx.user.delete({
        where: { id: userId }
      });

      return {
        message: `Usuario ${user.email} eliminado exitosamente`,
        deletedMedals,
        virginMedalsRestored: deletedMedals.length
      };
    });
  }

  // Eliminar todos los usuarios problemáticos
  async deleteAllProblematicUsers() {
    const usersWithProblems = await this.getUsersWithMedalProblems();
    const results = [];

    for (const user of usersWithProblems) {
      try {
        const result = await this.deleteProblematicUser(user.id);
        results.push({
          userId: user.id,
          email: user.email,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: error.message
        });
      }
    }

    return {
      message: `Proceso completado. ${results.filter(r => r.success).length} usuarios eliminados exitosamente.`,
      results
    };
  }
} 