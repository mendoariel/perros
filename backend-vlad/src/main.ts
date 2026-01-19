import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AtGuard } from './common/guards';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    disableErrorMessages: false,
    // Permitir multipart/form-data
    skipNullProperties: false,
    skipUndefinedProperties: false
  }));
  
  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, POST, DELETE, PATCH',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Serve static files from public directory (BEFORE global prefix)
  app.use('/pets/files', express.static(join(process.cwd(), 'public', 'files')));
  app.use('/images/partners', express.static(join(process.cwd(), 'public', 'images', 'partners')));
  app.use('/images/partners/gallery', express.static(join(process.cwd(), 'public', 'images', 'partners', 'gallery')));
  
  // Set global prefix for all routes (AFTER static files)
  app.setGlobalPrefix('api');

  // const reflector = new Reflector(); 
  // app.useGlobalGuards(new AtGuard(reflector));
  const port = process.env.BACKPORT || 3333;
  console.log(`Application is running on port ${port}`);
  await app.listen(port);
}
bootstrap();
