import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedalPostsService } from './medal-posts.service';
import { CreateMedalPostDto, UpdateMedalPostDto } from './dto';
import { AtGuard } from '../common/guards/at.guard';
import { Public } from '../common/decorators';

@Controller('medal-posts')
export class MedalPostsController {
  constructor(private readonly medalPostsService: MedalPostsService) {}

  // Endpoints públicos
  @Get('public')
  @Public()
  getActivePosts() {
    return this.medalPostsService.getActivePosts();
  }

  @Get('public/medal-fronts')
  @Public()
  getMedalFronts() {
    return this.medalPostsService.getMedalFronts();
  }

  // Endpoints protegidos (admin)
  @Get()
  @UseGuards(AtGuard)
  getAllPosts() {
    return this.medalPostsService.getAllPosts();
  }

  @Get(':id')
  @UseGuards(AtGuard)
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.medalPostsService.getPostById(id);
  }

  @Post()
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.CREATED)
  createPost(@Body() createPostDto: CreateMedalPostDto) {
    return this.medalPostsService.createPost(createPostDto);
  }

  @Post('upload-image')
  @UseGuards(AtGuard)
  @UseInterceptors(FileInterceptor('image', {
    dest: './public/images/medal-posts',
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    return {
      success: true,
      imagePath: `/images/medal-posts/${file.filename}`,
      filename: file.filename
    };
  }

  @Patch(':id')
  @UseGuards(AtGuard)
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdateMedalPostDto
  ) {
    return this.medalPostsService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.medalPostsService.deletePost(id);
  }
}
