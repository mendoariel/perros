import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { UtilService } from '../services/util.service';
import { MedalState, UserStatus } from '@prisma/client';

describe('Auto Verification of Medals', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    medal: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    virginMedal: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
        {
          provide: UtilService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('confirmAccount with auto-verification', () => {
    it('should automatically enable medal when complete', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        userRegisterHash: 'valid-hash',
        medalString: 'MEDAL123',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        hashToRegister: 'valid-hash',
        userStatus: UserStatus.PENDING,
      };

      const mockMedal = {
        medalString: 'MEDAL123',
        petName: 'Buddy',
        description: 'A friendly dog',
        registerHash: 'hash123',
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          user: {
            findFirst: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({ ...mockUser, userStatus: UserStatus.ACTIVE }),
          },
          medal: {
            findUnique: jest.fn().mockResolvedValue(mockMedal),
            update: jest.fn().mockResolvedValue({ ...mockMedal, status: MedalState.ENABLED }),
          },
          virginMedal: {
            update: jest.fn().mockResolvedValue({ status: MedalState.ENABLED }),
          },
        });
      });

      mockPrismaService.$transaction.mockImplementation(mockTransaction);

      // Act
      const result = await service.confirmAccount(dto);

      // Assert
      expect(result.message).toBe('user registered, medal enabled');
      expect(result.code).toBe(5001);
    });

    it('should keep medal as incomplete when data is missing', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        userRegisterHash: 'valid-hash',
        medalString: 'MEDAL123',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        hashToRegister: 'valid-hash',
        userStatus: UserStatus.PENDING,
      };

      const mockMedal = {
        medalString: 'MEDAL123',
        petName: 'Buddy',
        description: '', // Empty description - incomplete
        registerHash: 'hash123',
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          user: {
            findFirst: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({ ...mockUser, userStatus: UserStatus.ACTIVE }),
          },
          medal: {
            findUnique: jest.fn().mockResolvedValue(mockMedal),
            update: jest.fn().mockResolvedValue({ ...mockMedal, status: MedalState.INCOMPLETE }),
          },
          virginMedal: {
            update: jest.fn().mockResolvedValue({ status: MedalState.REGISTERED }),
          },
        });
      });

      mockPrismaService.$transaction.mockImplementation(mockTransaction);

      // Act
      const result = await service.confirmAccount(dto);

      // Assert
      expect(result.message).toBe('user registered, medal incomplete');
      expect(result.code).toBe(5001);
    });

    it('should handle missing medal gracefully', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        userRegisterHash: 'valid-hash',
        medalString: 'MEDAL123',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        hashToRegister: 'valid-hash',
        userStatus: UserStatus.PENDING,
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          user: {
            findFirst: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({ ...mockUser, userStatus: UserStatus.ACTIVE }),
          },
          medal: {
            findUnique: jest.fn().mockResolvedValue(null), // Medal not found
            update: jest.fn(),
          },
          virginMedal: {
            update: jest.fn(),
          },
        });
      });

      mockPrismaService.$transaction.mockImplementation(mockTransaction);

      // Act & Assert
      await expect(service.confirmAccount(dto)).rejects.toThrow('Medalla no encontrada');
    });
  });

  describe('isMedalComplete validation', () => {
    it('should return true for complete medal', () => {
      const completeMedal = {
        petName: 'Buddy',
        description: 'A friendly dog',
        medalString: 'MEDAL123',
        registerHash: 'hash123',
      };

      // Access private method for testing
      const isComplete = (service as any).isMedalComplete(completeMedal);
      expect(isComplete).toBe(true);
    });

    it('should return false for incomplete medal', () => {
      const incompleteMedal = {
        petName: 'Buddy',
        description: '', // Empty description
        medalString: 'MEDAL123',
        registerHash: 'hash123',
      };

      const isComplete = (service as any).isMedalComplete(incompleteMedal);
      expect(isComplete).toBe(false);
    });

    it('should return false for medal with whitespace-only fields', () => {
      const whitespaceMedal = {
        petName: '   ', // Only whitespace
        description: 'A friendly dog',
        medalString: 'MEDAL123',
        registerHash: 'hash123',
      };

      const isComplete = (service as any).isMedalComplete(whitespaceMedal);
      expect(isComplete).toBe(false);
    });

    it('should return false for medal with missing required fields', () => {
      const missingFieldsMedal = {
        petName: 'Buddy',
        description: 'A friendly dog',
        medalString: 'MEDAL123',
        // Missing registerHash
      };

      const isComplete = (service as any).isMedalComplete(missingFieldsMedal);
      expect(isComplete).toBe(false);
    });
  });
});
