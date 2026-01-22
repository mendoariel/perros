import { Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Logger, NotFoundException, Param, Post, Put, Query, Req, Response, UploadedFile, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { PetsServicie } from "./pets.service";
import { GetCurrentUser, GetCurrentUserId, Public } from "src/common/decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { FILE_UPLOAD_DIR } from "src/constans";
import { fileNameEditor, imageFileFilter } from "src/file.util";
import { CreateFileDto, UpdateMedalDto, CreateMedalForExistingUserDto } from "./dto";

@Controller('pets')
export class PetsController {
    constructor(private petService: PetsServicie) { }

    @Public()
    @Get('')
    allPets(
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const pageNumber = page ? Number(page) : 1;
        const limitNumber = limit ? Number(limit) : 10;

        // Final safety check to avoid NaN
        return this.petService.allPet(
            isNaN(pageNumber) ? 1 : pageNumber,
            isNaN(limitNumber) ? 10 : limitNumber
        );
    }


    @Get('mine')
    @HttpCode(HttpStatus.OK)
    miPets(@GetCurrentUser() user: any) {
        return this.petService.getMyPets(user.email);
    }

    @Get('pending-scanned-medals')
    @HttpCode(HttpStatus.OK)
    getPendingScannedMedals(@GetCurrentUserId() userId: number) {
        return this.petService.getPendingScannedMedals(userId);
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
            destination: FILE_UPLOAD_DIR
        }),
        limits: {
            fileSize: 1000 * 1000 * 10
        },
        fileFilter: imageFileFilter
    }))
    @HttpCode(HttpStatus.OK)
    loadProfilePicture(
        @GetCurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
        @Body(new ValidationPipe({ transform: false, whitelist: false, skipMissingProperties: true })) body: any
    ) {
        try {
            Logger.log('[loadProfilePicture] Iniciando carga de imagen');
            Logger.log('[loadProfilePicture] User:', user?.email || 'no user');
            Logger.log('[loadProfilePicture] File:', file?.filename || 'no file');
            Logger.log('[loadProfilePicture] File mimetype:', file?.mimetype || 'no mimetype');
            Logger.log('[loadProfilePicture] File size:', file?.size || 'no size');
            Logger.log('[loadProfilePicture] Body:', body);
            Logger.log('[loadProfilePicture] Body type:', typeof body);
            Logger.log('[loadProfilePicture] Body keys:', body ? Object.keys(body) : 'no body');
            Logger.log('[loadProfilePicture] req.body:', req.body);

            if (!user) {
                Logger.error('[loadProfilePicture] Usuario no autenticado');
                throw new NotFoundException('Usuario no autenticado');
            }

            if (!file) {
                Logger.error('[loadProfilePicture] No se recibió el archivo');
                throw new NotFoundException('No se recibió el archivo');
            }

            if (!file.filename) {
                Logger.error('[loadProfilePicture] El archivo no tiene filename. File object:', JSON.stringify(file, null, 2));
                throw new NotFoundException('Error al procesar el archivo');
            }

            // Con multipart/form-data, los campos pueden venir en body o en req.body
            // Intentar múltiples formas de obtener el medalString
            let medalString: string | undefined;

            // Primero intentar desde body
            if (body && body.medalString) {
                if (typeof body.medalString === 'string') {
                    medalString = body.medalString;
                } else if (Array.isArray(body.medalString) && body.medalString.length > 0) {
                    medalString = String(body.medalString[0]);
                } else if (typeof body.medalString === 'object' && body.medalString.value) {
                    medalString = String(body.medalString.value);
                } else {
                    medalString = String(body.medalString);
                }
            }

            // Si no se encontró en body, intentar desde req.body (puede estar parseado diferente)
            if ((!medalString || medalString.trim() === '') && req.body && req.body.medalString) {
                if (typeof req.body.medalString === 'string') {
                    medalString = req.body.medalString;
                } else if (Array.isArray(req.body.medalString) && req.body.medalString.length > 0) {
                    medalString = String(req.body.medalString[0]);
                } else {
                    medalString = String(req.body.medalString);
                }
            }

            if (!medalString || medalString.trim() === '') {
                Logger.error('[loadProfilePicture] No se recibió el medalString');
                Logger.error('[loadProfilePicture] Body recibido:', JSON.stringify(body));
                Logger.error('[loadProfilePicture] req.body recibido:', JSON.stringify(req.body));
                throw new NotFoundException('No se recibió el medalString');
            }

            Logger.log('[loadProfilePicture] Llamando loadImage con:', { filename: file.filename, medalString: medalString.trim() });
            return this.petService.loadImage(file.filename, medalString.trim());
        } catch (error) {
            Logger.error('[loadProfilePicture] Error capturado:', error);
            Logger.error('[loadProfilePicture] Error message:', error?.message);
            Logger.error('[loadProfilePicture] Error stack:', error?.stack);
            console.error('[loadProfilePicture] Error completo:', error);

            // Si el error ya es una excepción HTTP, relanzarlo
            if (error instanceof NotFoundException || (error && error.status)) {
                throw error;
            }
            // Si es otro tipo de error, convertirlo en un error interno
            const errorMessage = error?.message || error?.toString() || 'Error desconocido';
            Logger.error('[loadProfilePicture] Lanzando InternalServerErrorException:', errorMessage);
            throw new InternalServerErrorException('Error al procesar la carga de imagen: ' + errorMessage);
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

    @Get('files/:fileName/social')
    @Public()
    getSocialFile(
        @Param('fileName') fileName: string,
        @Response() res
    ) {
        return this.petService.getSocialFileByFileName(fileName, res)
    }

    @Get('files/:fileName/whatsapp')
    @Public()
    getWhatsAppFile(
        @Param('fileName') fileName: string,
        @Query('pet') petId: string,
        @Response() res
    ) {
        return this.petService.getWhatsAppFileByFileName(fileName, petId, res)
    }

    @Put('update-medal')
    updateMedal(
        @Body() dto: UpdateMedalDto,
        @GetCurrentUser() user: any
    ) {
        Logger.log('dto from controller', dto);
        return this.petService.updateMedal(user.email, dto)
    }

    @Public()
    @Put('test-update-medal')
    testUpdateMedal(
        @Body() dto: UpdateMedalDto
    ) {
        Logger.log('test dto from controller', dto);
        return this.petService.updateMedal(dto.email, dto)
    }

    @Post('create-medal-for-existing-user')
    @HttpCode(HttpStatus.CREATED)
    createMedalForExistingUser(
        @GetCurrentUser() user: any,
        @Body() dto: CreateMedalForExistingUserDto
    ) {
        return this.petService.createMedalForExistingUser(user.sub, dto);
    }

}