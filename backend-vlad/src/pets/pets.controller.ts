import { Body, Controller, Get, HttpCode, HttpStatus, Logger, NotFoundException, Param, Post, Put, Response, UploadedFile, UseInterceptors } from "@nestjs/common";
import { PetsServicie } from "./pets.service";
import { GetCurrentUser, Public } from "src/common/decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { FILE_UPLOAD_DIR } from "src/constans";
import { fileNameEditor, imageFileFilter } from "src/file.util";
import { CreateFileDto } from "./dto/create-file.dto";
import { UpdateMedalDto } from "./dto/update-medal.dto";
import { join } from 'path';

@Controller('pets')
export class PetsController {
    constructor(private petService: PetsServicie) {
        // Ensure upload directory exists at startup
        const fs = require('fs');
        const uploadDir = join(process.cwd(), 'backend-vlad', 'public', 'files');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    }

    @Public()
    @Get('') 
    allPets() {
        return this.petService.allPet();
    }

    @Get('mine')
    @HttpCode(HttpStatus.OK)
    miPets(@GetCurrentUser() user: any) {
        return this.petService.getMyPets(user.email);
    }

    @Get('my/:medalString')
    @HttpCode(HttpStatus.OK)
    miPet(@GetCurrentUser() user: any, @Param('medalString') medalString: string) {
        return this.petService.getMyPet(user.email, medalString);
    }

    @Post('profile-picture')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            filename: fileNameEditor,
            destination: join(process.cwd(), 'backend-vlad', 'public', 'files')
        }),
        limits: {
            fileSize: 1000 * 1000 * 10 // 10MB limit
        },
        fileFilter: imageFileFilter
    }))
    @HttpCode(HttpStatus.OK)
    loadProfilePicture(
        @GetCurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateFileDto
    ) {
        if(user && file && dto.medalString) {
            console.log('File uploaded to:', file.path);
            return this.petService.loadImage(file.filename, dto.medalString);    
        } else {
            throw new NotFoundException('Error al cargar archivos');
        }
    }

    @Get('files/:fileName')
    @Public()
    getFile(
        @Param('fileName') fileName: string,
        @Response() res
    ) {
        return this.petService.getFileByFileName(fileName, res)
    }

    @Put('update-medal')
    updateMedal(
        @Body() dto: UpdateMedalDto,
        @GetCurrentUser() user: any
    ) {
        Logger.log('dto from controller', dto);
        return this.petService.updateMedal(user.email, dto)
    }
}