import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { PetsServicie } from '../src/pets/pets.service';
import { UserStatus, MedalState } from '@prisma/client';

describe('PetsService - Bug Fix: PENDING user with ENABLED medal', () => {
  let service: PetsServicie;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    userStatus: UserStatus.PENDING,
    phonenumber: '123456789',
    medals: [
      {
        id: 1,
        medalString: 'TEST123',
        status: MedalState.REGISTER_PROCESS,
        petName: 'Test Pet'
      }
    ]
  };

  const mockUpdateMedalDto = {
    medalString: 'TEST123',
    description: 'Test description',
    phoneNumber: '987654321'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsServicie,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            medal: {
              update: jest.fn(),
            },
            virginMedal: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PetsServicie>(PetsServicie);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should throw BadRequestException when trying to enable medal for PENDING user', async () => {
    // Arrange
    const pendingUser = { ...mockUser, userStatus: UserStatus.PENDING };
    
    jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(pendingUser),
          update: jest.fn(),
        },
        medal: {
          update: jest.fn(),
        },
        virginMedal: {
          update: jest.fn(),
        },
      };
      return callback(mockTx);
    });

    // Act & Assert
    await expect(
      service.updateMedal('test@example.com', mockUpdateMedalDto)
    ).rejects.toThrow(BadRequestException);
    
    await expect(
      service.updateMedal('test@example.com', mockUpdateMedalDto)
    ).rejects.toThrow('Usuario debe estar activo para habilitar la medalla');
  });

  it('should allow medal update for ACTIVE user', async () => {
    // Arrange
    const activeUser = { ...mockUser, userStatus: UserStatus.ACTIVE };
    const updatedUser = { ...activeUser, phonenumber: '987654321' };
    const updatedMedal = { ...mockUser.medals[0], status: MedalState.ENABLED };
    
    jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(activeUser),
          update: jest.fn().mockResolvedValue(updatedUser),
        },
        medal: {
          update: jest.fn().mockResolvedValue(updatedMedal),
        },
        virginMedal: {
          update: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    // Act
    const result = await service.updateMedal('test@example.com', mockUpdateMedalDto);

    // Assert
    expect(result).toEqual(updatedMedal);
    expect(prismaService.$transaction).toHaveBeenCalled();
  });

  it('should throw NotFoundException when user does not exist', async () => {
    // Arrange
    jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
        },
        medal: {
          update: jest.fn(),
        },
        virginMedal: {
          update: jest.fn(),
        },
      };
      return callback(mockTx);
    });

    // Act & Assert
    await expect(
      service.updateMedal('nonexistent@example.com', mockUpdateMedalDto)
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for DISABLED user', async () => {
    // Arrange
    const disabledUser = { ...mockUser, userStatus: UserStatus.DISABLED };
    
    jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(disabledUser),
          update: jest.fn(),
        },
        medal: {
          update: jest.fn(),
        },
        virginMedal: {
          update: jest.fn(),
        },
      };
      return callback(mockTx);
    });

    // Act & Assert
    await expect(
      service.updateMedal('test@example.com', mockUpdateMedalDto)
    ).rejects.toThrow(BadRequestException);
    
    await expect(
      service.updateMedal('test@example.com', mockUpdateMedalDto)
    ).rejects.toThrow('Usuario debe estar activo para habilitar la medalla');
  });
});
