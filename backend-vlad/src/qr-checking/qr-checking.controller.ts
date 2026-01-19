import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { QrService } from "./qr-checking.service";
import { Public } from "src/common/decorators";
import { PostMedalDto, QRCheckingDto, ValidateEmailDto } from "./dto";
import { MedalStatus } from "./types";
import { of } from "rxjs";
import { PrismaPromise } from "@prisma/client";


@Controller('qr')
export class QRCheckingController {
    constructor(private qrService: QrService) {}

    @Public()
    @Post('checking')
    @HttpCode(HttpStatus.CREATED)
    async chekingMedal(@Body() dto: QRCheckingDto): Promise<MedalStatus | string> {
        const startTime = Date.now();
        try {
            const result = await this.qrService.QRCheking(dto);
            const endTime = Date.now();
            console.log(`QR Check completed in ${endTime - startTime}ms for medal: ${dto.medalString}`);
            return result;
        } catch (error) {
            const endTime = Date.now();
            console.error(`QR Check failed in ${endTime - startTime}ms for medal: ${dto.medalString}`, error);
            throw error;
        }
    }

    @Public()
    @Post('validate-email')
    @HttpCode(HttpStatus.OK)
    async validateEmail(@Body() dto: ValidateEmailDto): Promise<any> {
        const startTime = Date.now();
        try {
            const result = await this.qrService.validateEmailForMedal(dto);
            const endTime = Date.now();
            console.log(`Email validation completed in ${endTime - startTime}ms for email: ${dto.email}`);
            return result;
        } catch (error) {
            const endTime = Date.now();
            console.error(`Email validation failed in ${endTime - startTime}ms for email: ${dto.email}`);
            console.error(`Error details:`, {
                message: error?.message,
                code: error?.code,
                stack: error?.stack
            });
            // Si es un error de Prisma, proporcionar más información
            if (error?.code === 'P2022' || error?.message?.includes('does not exist')) {
                console.error('Prisma error - column or table does not exist');
            }
            throw error;
        }
    }

    // create a medal and a user
    @Public()
    @Post('pet')
    @HttpCode(HttpStatus.CREATED)
    loadMedal(@Body() dto: PostMedalDto): Promise<any> {
        return this.qrService.postMedal(dto);
    }

    // get a public pet
    @Public()
    @Get('pet/:medalString')
    @HttpCode(HttpStatus.OK)
    async getPet(@Param('medalString') medalString: string): Promise<any> {
        const startTime = Date.now();
        try {
            const result = await this.qrService.getPet(medalString);
            const endTime = Date.now();
            console.log(`GetPet completed in ${endTime - startTime}ms for medal: ${medalString}`);
            return result;
        } catch (error) {
            const endTime = Date.now();
            console.error(`GetPet failed in ${endTime - startTime}ms for medal: ${medalString}`, error);
            throw error;
        }
    }

    @Public()
    @Get('this-email-is-taken/:email')
    @HttpCode(HttpStatus.OK)
    isThisEmailUsed(@Param('email') email: string): Promise<any> {
        return this.qrService.isThisEmailTaken(email);
    }

    @Public()
    @Get('test-email/:email/:hash/:medal')
    @HttpCode(HttpStatus.OK)
    checkEmailService(
        @Param('email') email: string,
        @Param('hash') hash: string,
        @Param('medal') medal: string
    ) {
        return this.qrService.sendEmailConfirmAccount(email, hash, medal);
    }

    @Public()
    @Get('test-password-recovery/:email')
    @HttpCode(HttpStatus.OK)
    testPasswordRecovery(@Param('email') email: string) {
        return this.qrService.testPasswordRecovery(email);
    }

    @Public()
    @Get('test-medal-confirmation/:email/:medal')
    @HttpCode(HttpStatus.OK)
    testMedalConfirmation(
        @Param('email') email: string,
        @Param('medal') medal: string
    ) {
        return this.qrService.testMedalConfirmation(email, medal);
    }

    @Public()
    @Get('resend-confirmation/:email')
    @HttpCode(HttpStatus.OK)
    resendConfirmationEmail(@Param('email') email: string) {
        return this.qrService.resendConfirmationEmail(email);
    }

    @Public()
    @Get('user-status/:email')
    @HttpCode(HttpStatus.OK)
    getUserStatus(@Param('email') email: string) {
        return this.qrService.getUserStatus(email);
    }

    @Public()
    @Post('reset-request')
    @HttpCode(HttpStatus.OK)
    async requestMedalReset(@Body() dto: { medalString: string; reason: string; email: string }): Promise<any> {
        const startTime = Date.now();
        try {
            const result = await this.qrService.requestMedalReset(dto.medalString, dto.reason, dto.email);
            const endTime = Date.now();
            console.log(`Reset request completed in ${endTime - startTime}ms for medal: ${dto.medalString}`);
            return result;
        } catch (error) {
            const endTime = Date.now();
            console.error(`Reset request failed in ${endTime - startTime}ms for medal: ${dto.medalString}`, error);
            throw error;
        }
    }

    @Public()
    @Post('process-reset')
    @HttpCode(HttpStatus.OK)
    async processMedalReset(@Body() dto: { medalString: string; userEmail: string }): Promise<any> {
        const startTime = Date.now();
        try {
            const result = await this.qrService.processMedalReset(dto.medalString, dto.userEmail);
            const endTime = Date.now();
            console.log(`Process reset completed in ${endTime - startTime}ms for medal: ${dto.medalString}`);
            return result;
        } catch (error) {
            const endTime = Date.now();
            console.error(`Process reset failed in ${endTime - startTime}ms for medal: ${dto.medalString}`, error);
            throw error;
        }
    }

    @Public()
    @Post('send-unlock-apology')
    @HttpCode(HttpStatus.OK)
    async sendUnlockApology(@Body() dto: { medalString: string; userEmail: string; userName: string }): Promise<any> {
        const startTime = Date.now();
        try {
            const result = await this.qrService.sendUnlockApology(dto.medalString, dto.userEmail, dto.userName);
            const endTime = Date.now();
            console.log(`Send unlock apology completed in ${endTime - startTime}ms for medal: ${dto.medalString}`);
            return result;
        } catch (error) {
            const endTime = Date.now();
            console.error(`Send unlock apology failed in ${endTime - startTime}ms for medal: ${dto.medalString}`, error);
            throw error;
        }
    }

    @Public()
    @Get('preview-unlock-apology/:medalString/:userEmail/:userName')
    @HttpCode(HttpStatus.OK)
    async previewUnlockApology(
        @Param('medalString') medalString: string,
        @Param('userEmail') userEmail: string,
        @Param('userName') userName: string
    ): Promise<any> {
        try {
            const result = await this.qrService.previewUnlockApology(medalString, userEmail, userName);
            return result;
        } catch (error) {
            console.error(`Preview unlock apology failed for medal: ${medalString}`, error);
            throw error;
        }
    }



    // @Public()
    // @Post('creator')
    // qrCreator() {
    //     return this.qrService.creatQr()
    // }
}
