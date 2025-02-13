import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { QrService } from "./qr-checking.service";
import { Public } from "src/common/decorators";
import { PostMedalDto, QRCheckingDto } from "./dto";
import { MedalStatus } from "./types";


@Controller('qr')
export class QRCheckingController {
    constructor(private qrService: QrService) {}

    @Public()
    @Post('checking')
    @HttpCode(HttpStatus.CREATED)
    chekingMedal(@Body() dto: QRCheckingDto): Promise<MedalStatus | string> {
        console.log('from controller dto ===> ', dto)
        return this.qrService.QRCheking(dto);
    }
    @Public()
    @Post('pet')
    @HttpCode(HttpStatus.CREATED)
    loadMedal(@Body() dto: PostMedalDto): Promise<any> {
        console.log('dto====> ', dto)
        return this.qrService.postMedal(dto);
    }
}
