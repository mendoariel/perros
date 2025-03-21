import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Message, Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AtGuard, RtGuard } from 'src/common/guards';
import { GetCurrentUser, GetCurrentUserId, Public } from 'src/common/decorators';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { AuthSignInDto } from './dto/auth-signin.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { ConfirmMedalto } from './dto/confirm-medal.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // @Public()
    // @Post('local/signup')
    // @HttpCode(HttpStatus.CREATED)
    // signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    //     /return this.authService.signupLocal(dto);
    // }

    @Post('user')
    @HttpCode(HttpStatus.OK)
    profile(@GetCurrentUser() user: string) {
        return user;
    }

    @Get('is-frias-editor')
    @HttpCode(HttpStatus.OK)
    currentUser(@GetCurrentUser() user: any) {
        return this.authService.isFriasEditor(user.email);
    }
    
    @Public()
    @Post('local/signin')
    @HttpCode(HttpStatus.OK)
    signinLocal(@Body() dto: AuthSignInDto): Promise<Tokens> {
        return this.authService.signinLocal(dto)
    }
  
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@GetCurrentUserId() userId: number) {
        return this.authService.logout(userId)
    }

    @Public()
    @UseGuards(RtGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(
            @GetCurrentUserId() userId: number,
            @GetCurrentUser('refreshToken') refreshToken: string
        ) {
        return this.authService.refreshTokens(userId, refreshToken)
    }

    @Public()
    @Post('password-recovery')
    @HttpCode(HttpStatus.OK)
    passwordRecovery(@Body() dto: PasswordRecoveryDto): Promise<Message> {
        return this.authService.passwordRecovery(dto)
    }

    @Public()
    @Post('new-password')
    @HttpCode(HttpStatus.OK)
    newPassword(@Body() dto: NewPasswordDto): Promise<Message> {
        return this.authService.newPassword(dto);
    }

    @Public()
    @Post('confirm-account')
    @HttpCode(HttpStatus.OK)
    confirmAccount(@Body() dto: ConfirmAccountDto): any {
        return this.authService.confirmAccount(dto);
    }

    @Public()
    @Post('confirm-medal')
    @HttpCode(HttpStatus.OK)
    confirmMedal(@Body() dto: ConfirmMedalto): any {
        return this.authService.confirmMedal(dto);
    }
}
