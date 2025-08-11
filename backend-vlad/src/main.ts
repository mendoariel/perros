import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AtGuard } from './common/guards';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, POST, DELETE, PATCH',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Serve static files from public directory
  app.use('/pets/files', express.static(join(process.cwd(), 'public', 'files')));

  // const reflector = new Reflector(); 
  // app.useGlobalGuards(new AtGuard(reflector));
  await app.listen(process.env.BACKPORT);
}
bootstrap();
