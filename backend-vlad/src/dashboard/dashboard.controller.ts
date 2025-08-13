import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AtGuard } from '../common/guards/at.guard';
import { Public } from '../common/decorators';
import { SaveMedalFrontDto } from './dto';

@Controller('dashboard')
@UseGuards(AtGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {
    console.log('DashboardController initialized');
  }

  // Obtener todas las medallas virgin
  @Get('virgin-medals')
  async getVirginMedals() {
    try {
      return await this.dashboardService.getVirginMedals();
    } catch (error) {
      throw new HttpException('Error al obtener medallas virgin', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Obtener estadísticas
  @Get('stats')
  async getStats() {
    try {
      return await this.dashboardService.getStats();
    } catch (error) {
      throw new HttpException('Error al obtener estadísticas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Crear nuevas medallas virgin
  @Post('virgin-medals/create')
  async createVirginMedals(@Body() body: { quantity: number; registerHash: string }) {
    try {
      const { quantity, registerHash } = body;
      if (!quantity || !registerHash) {
        throw new HttpException('Cantidad y registerHash son requeridos', HttpStatus.BAD_REQUEST);
      }
      if (quantity < 1 || quantity > 1000) {
        throw new HttpException('La cantidad debe estar entre 1 y 1000', HttpStatus.BAD_REQUEST);
      }
      
      return await this.dashboardService.createVirginMedals(quantity, registerHash);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error al crear medallas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Actualizar estado de una medalla
  @Patch('virgin-medals/:id/status')
  async updateMedalStatus(@Param('id') id: string, @Body() body: { status: string }) {
    try {
      const { status } = body;
      if (!status) {
        throw new HttpException('Estado es requerido', HttpStatus.BAD_REQUEST);
      }
      
      return await this.dashboardService.updateMedalStatus(parseInt(id), status);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error al actualizar estado', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Eliminar medalla
  @Delete('virgin-medals/:id')
  async deleteMedal(@Param('id') id: string) {
    try {
      return await this.dashboardService.deleteMedal(parseInt(id));
    } catch (error) {
      throw new HttpException('Error al eliminar medalla', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Obtener medallas específicas para generar QR
  @Post('virgin-medals/get-for-qr')
  async getMedalsForQR(@Body() body: { medalIds: number[] }) {
    try {
      const { medalIds } = body;
      
      if (!medalIds || medalIds.length === 0) {
        throw new HttpException('IDs de medallas son requeridos', HttpStatus.BAD_REQUEST);
      }

      if (medalIds.length > 100) {
        throw new HttpException('Máximo 100 medallas por solicitud', HttpStatus.BAD_REQUEST);
      }

      return await this.dashboardService.getMedalsForQR(medalIds);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error al obtener medallas: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Obtener medallas virgin por cantidad para generar QR
  @Post('virgin-medals/get-virgin-for-qr')
  async getVirginMedalsForQR(@Body() body: { quantity: number }) {
    try {
      const { quantity } = body;
      
      if (!quantity || quantity < 1 || quantity > 100) {
        throw new HttpException('Cantidad debe estar entre 1 y 100', HttpStatus.BAD_REQUEST);
      }

      return await this.dashboardService.getVirginMedalsForQR(quantity);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error al obtener medallas virgin: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Health check para el dashboard
  @Get('health')
  async healthCheck() {
    console.log('Health check endpoint called');
    return { 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'dashboard-api'
    };
  }

  // Test endpoint sin autenticación
  @Get('test')
  async testEndpoint() {
    console.log('Test endpoint called');
    return { 
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    };
  }

  // ===== FRENTES DE MEDALLAS =====

  // Obtener todos los frentes de medallas
  @Get('front-medals')
  async getMedalFronts() {
    try {
      return await this.dashboardService.getMedalFronts();
    } catch (error) {
      throw new HttpException('Error al obtener frentes de medallas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Guardar un nuevo frente de medalla
  @Post('front-medals')
  async saveMedalFront(@Body() dto: SaveMedalFrontDto) {
    try {
      if (!dto.name) {
        throw new HttpException('Nombre es requerido', HttpStatus.BAD_REQUEST);
      }
      
      return await this.dashboardService.saveMedalFront(dto);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error al guardar frente de medalla', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Eliminar un frente de medalla
  @Delete('front-medals/:id')
  async deleteMedalFront(@Param('id') id: string) {
    try {
      return await this.dashboardService.deleteMedalFront(id);
    } catch (error) {
      throw new HttpException('Error al eliminar frente de medalla', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Obtener un frente de medalla específico
  @Get('front-medals/:id')
  async getMedalFront(@Param('id') id: string) {
    try {
      return await this.dashboardService.getMedalFront(id);
    } catch (error) {
      throw new HttpException('Error al obtener frente de medalla', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 