import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';
<<<<<<< HEAD
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
=======

@Module({
  imports: [PrismaModule],
>>>>>>> gary
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {} 