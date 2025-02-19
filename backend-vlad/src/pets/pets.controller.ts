import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Response, UploadedFile, UseInterceptors } from "@nestjs/common";
import { PetsServicie } from "./pets.service";
import { GetCurrentUser, Public } from "src/common/decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { FILE_UPLOAD_DIR } from "src/constans";
import { fileNameEditor, imageFileFilter } from "src/file.util";
import { CreateFileDto } from "./dto/create-file.dto";

@Controller('pets')
export class PetsController {
    constructor(private petService: PetsServicie) {}

    @Get('mine')
    @HttpCode(HttpStatus.OK)
    miPets(@GetCurrentUser() user: any) {
        return this.petService.getMyPets(user.email);
    }

    @Post('my')
    @HttpCode(HttpStatus.OK)
    miPet(@GetCurrentUser() user: any, @Body() registerHash: any) {
        return this.petService.getMyPet(user.email, registerHash.registerHash);
    }

    @Post('profile-picture')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            filename: fileNameEditor,
            destination: FILE_UPLOAD_DIR
        }),
        limits: {
            fileSize: 1000 * 1000 * 10
        },
        fileFilter: imageFileFilter
    }))
    @HttpCode(HttpStatus.OK)
    loadProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateFileDto
    ) {
        return {
            filename: file.filename,
            size: file.size,
            dto
        };
    }

    @Get('files/:fileName')
    @Public()
    getFile(
        @Param('fileName') fileName: string,
        @Response() res
    ) {
        return this.petService.getFileByFileName(fileName, res)
    }


}