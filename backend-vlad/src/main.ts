import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AtGuard } from './common/guards';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configure static file serving
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, POST, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  
  // const reflector = new Reflector(); 
  // app.useGlobalGuards(new AtGuard(reflector));
  await app.listen(process.env.BACKPORT);
}
bootstrap();
