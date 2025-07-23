import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class DashboardAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    
    // Obtener las credenciales desde las variables de entorno
    const expectedUsername = process.env.DASHBOARD_USERNAME;
    const expectedPassword = process.env.DASHBOARD_PASSWORD;
    
    if (!expectedUsername || !expectedPassword) {
      console.error('Dashboard credentials not configured');
      throw new UnauthorizedException('Dashboard not configured');
    }

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }

    // Verificar que sea Basic Auth
    if (!authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Basic authentication required');
    }

    // Decodificar las credenciales
    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    // Verificar credenciales
    if (username === expectedUsername && password === expectedPassword) {
      return true;
    }

    throw new UnauthorizedException('Invalid credentials');
  }
} 