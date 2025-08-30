import { Module } from '@nestjs/common';
import { MedalPostsService } from './medal-posts.service';
import { MedalPostsController } from './medal-posts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MedalPostsController],
  providers: [MedalPostsService],
  exports: [MedalPostsService],
})
export class MedalPostsModule {}
