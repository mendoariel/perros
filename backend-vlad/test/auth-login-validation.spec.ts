import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';

describe('AuthService - Login Validation', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockActiveUser = {
    id: 1,
    email: 'test@example.com',
    hash: '$2b$10$hashedpassword',
    userStatus: UserStatus.ACTIVE,
    role: 'VISITOR'
  };

  const mockPendingUser = {
    id: 2,
    email: 'pending@example.com',
    hash: '$2b$10$hashedpassword',
    userStatus: UserStatus.PENDING,
    role: 'VISITOR'
  };

  const mockDisabledUser = {
    id: 3,
    email: 'disabled@example.com',
    hash: '$2b$10$hashedpassword',
    userStatus: UserStatus.DISABLED,
    role: 'VISITOR'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signinLocal', () => {
    it('should allow login for ACTIVE user', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockActiveUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock-token');
      
      // Mock bcrypt comparison
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      // Act
      const result = await service.signinLocal(loginDto);

      // Assert
      expect(result).toBeDefined();
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
          userStatus: UserStatus.ACTIVE  // ✅ Verifica que solo busca usuarios ACTIVE
        }
      });
    });

    it('should NOT allow login for PENDING user', async () => {
      // Arrange
      const loginDto = {
        email: 'pending@example.com',
        password: 'password123'
      };

      // Simular que el usuario PENDING no se encuentra (porque la query filtra por ACTIVE)
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.signinLocal(loginDto)
      ).rejects.toThrow(ForbiddenException);
      
      await expect(
        service.signinLocal(loginDto)
      ).rejects.toThrow('Access Denied');

      // Verificar que la query solo busca usuarios ACTIVE
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'pending@example.com',
          userStatus: UserStatus.ACTIVE  // ✅ PENDING no coincide
        }
      });
    });

    it('should NOT allow login for DISABLED user', async () => {
      // Arrange
      const loginDto = {
        email: 'disabled@example.com',
        password: 'password123'
      };

      // Simular que el usuario DISABLED no se encuentra (porque la query filtra por ACTIVE)
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.signinLocal(loginDto)
      ).rejects.toThrow(ForbiddenException);
      
      await expect(
        service.signinLocal(loginDto)
      ).rejects.toThrow('Access Denied');

      // Verificar que la query solo busca usuarios ACTIVE
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'disabled@example.com',
          userStatus: UserStatus.ACTIVE  // ✅ DISABLED no coincide
        }
      });
    });

    it('should throw ForbiddenException for non-existent user', async () => {
      // Arrange
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.signinLocal(loginDto)
      ).rejects.toThrow(ForbiddenException);
      
      await expect(
        service.signinLocal(loginDto)
      ).rejects.toThrow('Access Denied');
    });

    it('should throw ForbiddenException for wrong password', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockActiveUser);
      
      // Mock bcrypt comparison to return false
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      // Act & Assert
      await expect(
        service.signinLocal(loginDto)
      ).rejects.toThrow(ForbiddenException);
      
      await expect(
        service.signinLocal(loginDto)
      ).rejects.toThrow('Access Denied');
    });

    it('should verify the exact query structure', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockActiveUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock-token');
      
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      // Act
      await service.signinLocal(loginDto);

      // Assert - Verificar la estructura exacta de la query
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',  // ✅ Email en lowercase
          userStatus: UserStatus.ACTIVE  // ✅ Solo usuarios ACTIVE
        }
      });
    });
  });
});
