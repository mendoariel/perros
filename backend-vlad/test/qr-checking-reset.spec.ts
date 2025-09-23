import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { QrService } from '../src/qr-checking/qr-checking.service';
import { MailService } from '../src/mail/mail.service';
import { MedalState } from '@prisma/client';

describe('QrService - Medal Reset Bug Fix', () => {
  let service: QrService;
  let prismaService: PrismaService;
  let mailService: MailService;

  const mockVirginMedal = {
    id: 1,
    medalString: 'TEST123',
    status: MedalState.REGISTER_PROCESS,
    registerHash: 'test-hash'
  };

  const mockRegisteredMedal = {
    id: 1,
    medalString: 'TEST123',
    status: MedalState.ENABLED,
    petName: 'Test Pet',
    ownerId: 1,
    owner: {
      id: 1,
      email: 'test@example.com',
      userStatus: 'ACTIVE'
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            virginMedal: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            medal: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              delete: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
            sendMedalResetConfirmation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QrService>(QrService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
  });

  describe('processMedalReset', () => {
    it('should delete user when they have only one medal (bug fix)', async () => {
      // Arrange
      const userWithOneMedal = [mockRegisteredMedal]; // Usuario con 1 medalla
      
      jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
        const mockTx = {
          virginMedal: {
            update: jest.fn().mockResolvedValue({}),
          },
          medal: {
            findFirst: jest.fn().mockResolvedValue(mockRegisteredMedal),
            findMany: jest.fn().mockResolvedValue(userWithOneMedal), // 1 medalla
            delete: jest.fn().mockResolvedValue({}),
          },
          user: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      // Mock the initial queries outside transaction
      jest.spyOn(prismaService.virginMedal, 'findFirst').mockResolvedValue(mockVirginMedal);
      jest.spyOn(prismaService.medal, 'findFirst').mockResolvedValue(mockRegisteredMedal);

      // Act
      await service.processMedalReset('TEST123', 'test@example.com');

      // Assert
      expect(prismaService.$transaction).toHaveBeenCalled();
      
      // Verificar que se consultaron las medallas del usuario ANTES de eliminar
      const transactionCall = prismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        virginMedal: { update: jest.fn() },
        medal: { 
          findFirst: jest.fn().mockResolvedValue(mockRegisteredMedal),
          findMany: jest.fn().mockResolvedValue(userWithOneMedal),
          delete: jest.fn()
        },
        user: { delete: jest.fn() }
      };
      
      await transactionCall(mockTx);
      
      // Verificar el orden correcto: consultar medallas ANTES de eliminar
      expect(mockTx.medal.findMany).toHaveBeenCalledWith({
        where: { ownerId: 1 }
      });
      expect(mockTx.medal.delete).toHaveBeenCalledWith({
        where: { medalString: 'TEST123' }
      });
      expect(mockTx.user.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should NOT delete user when they have multiple medals', async () => {
      // Arrange
      const userWithMultipleMedals = [
        mockRegisteredMedal,
        { ...mockRegisteredMedal, id: 2, medalString: 'TEST456' }
      ]; // Usuario con 2 medallas
      
      jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
        const mockTx = {
          virginMedal: {
            update: jest.fn().mockResolvedValue({}),
          },
          medal: {
            findFirst: jest.fn().mockResolvedValue(mockRegisteredMedal),
            findMany: jest.fn().mockResolvedValue(userWithMultipleMedals), // 2 medallas
            delete: jest.fn().mockResolvedValue({}),
          },
          user: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      // Mock the initial queries outside transaction
      jest.spyOn(prismaService.virginMedal, 'findFirst').mockResolvedValue(mockVirginMedal);
      jest.spyOn(prismaService.medal, 'findFirst').mockResolvedValue(mockRegisteredMedal);

      // Act
      await service.processMedalReset('TEST123', 'test@example.com');

      // Assert
      const transactionCall = prismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        virginMedal: { update: jest.fn() },
        medal: { 
          findFirst: jest.fn().mockResolvedValue(mockRegisteredMedal),
          findMany: jest.fn().mockResolvedValue(userWithMultipleMedals),
          delete: jest.fn()
        },
        user: { delete: jest.fn() }
      };
      
      await transactionCall(mockTx);
      
      // Verificar que NO se eliminó el usuario
      expect(mockTx.user.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid medal status', async () => {
      // Arrange
      const invalidVirginMedal = { ...mockVirginMedal, status: MedalState.ENABLED };
      jest.spyOn(prismaService.virginMedal, 'findFirst').mockResolvedValue(invalidVirginMedal);

      // Act & Assert
      await expect(
        service.processMedalReset('TEST123', 'test@example.com')
      ).rejects.toThrow(BadRequestException);
      
      await expect(
        service.processMedalReset('TEST123', 'test@example.com')
      ).rejects.toThrow('El estado actual de la medalla no permite reset');
    });

    it('should throw NotFoundException when medal does not exist', async () => {
      // Arrange
      jest.spyOn(prismaService.virginMedal, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.processMedalReset('NONEXISTENT', 'test@example.com')
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle reset when no registered medal exists', async () => {
      // Arrange
      jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
        const mockTx = {
          virginMedal: {
            update: jest.fn().mockResolvedValue({}),
          },
          medal: {
            findFirst: jest.fn().mockResolvedValue(null), // No hay medalla registrada
            findMany: jest.fn(),
            delete: jest.fn(),
          },
          user: {
            delete: jest.fn(),
          },
        };
        return callback(mockTx);
      });

      // Mock the initial queries outside transaction
      jest.spyOn(prismaService.virginMedal, 'findFirst').mockResolvedValue(mockVirginMedal);
      jest.spyOn(prismaService.medal, 'findFirst').mockResolvedValue(null);

      // Act
      const result = await service.processMedalReset('TEST123', 'test@example.com');

      // Assert
      expect(result.message).toBe('Medalla reseteada correctamente. Se ha enviado un email de confirmación.');
      expect(result.code).toBe('reset_completed');
    });
  });
});
