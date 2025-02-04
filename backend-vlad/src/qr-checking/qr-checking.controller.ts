import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { QrService } from "./qr-checking.service";
import { Public } from "src/common/decorators";
import { QRCheckingDto } from "./dto";
import { MedalStatus } from "./types";


@Controller('qr-checking')
export class QRCheckingController {
    constructor(private qrService: QrService) {}

    @Public()
    @Post('')
    @HttpCode(HttpStatus.CREATED)
    signupLocal(@Body() dto: QRCheckingDto): Promise<MedalStatus | string> {
        return this.qrService.QRCheking(dto);
    }
}
