import { Controller, Get, Put, Post, UseGuards, Body, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto';
import { AtGuard } from '../common/guards';
import { GetCurrentUserId } from '../common/decorators';
import { FILE_UPLOAD_DIR } from '../constans';

@Controller('users')
@UseGuards(AtGuard)
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get('me')
  async getProfile(@GetCurrentUserId() userId: number) {
    return this.usersService.getProfile(userId);
  }

  @Put('me')
  async updateProfile(
    @GetCurrentUserId() userId: number,
    @Body() dto: UpdateUserProfileDto
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(FILE_UPLOAD_DIR, 'users', 'avatars'),
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16)).join('');
        const ext = extname(file.originalname);
        cb(null, `avatar_${randomName}${ext}`);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async uploadAvatar(
    @GetCurrentUserId() userId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ]
      })
    ) file: Express.Multer.File
  ) {
    if (!file) {
      throw new Error('No se recibió el archivo');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new Error('File is not an image');
    }

    return this.usersService.uploadAvatar(userId, file.filename);
  }
}
