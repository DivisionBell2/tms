import { Body, Controller, Get, Inject, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import type {
    UserPublicDto,
    UpdateProfileRequestDto,
    ChangeEmailRequesDto,
    ChangePasswordRequestDto} from "@tms/contracts";
import {
    CMD_AUTH_LOGIN,
    CMD_AUTH_REGISTER,
    type LoginRequestDto,
    type AuthResponseDto,
    type RegisterRequestDto,
    type RefreshTokenRequestDto,
    CMD_USER_GET_BY_ID,
    CMD_USER_UPDATE_PROFILE,
    CMD_AUTH_REFRESH,
    CMD_USER_CHANGE_PASSWORD,
    CMD_USER_CHANGE_EMAIL
} from "@tms/contracts";
import { firstValueFrom } from "rxjs";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";

export type AuthedRequest = { userId: string };

@Controller('auth')
export class AuthHttpController {
    constructor(@Inject('NATS_CLIENT') private readonly nats: ClientProxy) {}

    @UseGuards(ThrottlerGuard)
    @Post('register')
    register(@Body() body: RegisterRequestDto) {
        return firstValueFrom(this.nats.send<AuthResponseDto>(CMD_AUTH_REGISTER, body))
    }

    @UseGuards(ThrottlerGuard)
    @Post('login')
    login(@Body() body: LoginRequestDto) {
        return firstValueFrom(this.nats.send<AuthResponseDto>(CMD_AUTH_LOGIN, body))
    }

    @UseGuards(ThrottlerGuard)
    @Post('refresh')
    refresh(@Body() body: RefreshTokenRequestDto) {
        return firstValueFrom(this.nats.send<AuthResponseDto>(CMD_AUTH_REFRESH, body));
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Req() req: AuthedRequest): Promise<UserPublicDto | null> {
        return firstValueFrom(
            this.nats.send<UserPublicDto | null>(CMD_USER_GET_BY_ID, { userId: req.userId })
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    async updateMe(@Req() req: AuthedRequest, @Body() body: Omit<UpdateProfileRequestDto, 'userId'>) {
        const dto: UpdateProfileRequestDto = { userId: req.userId, ...body };
        
        return firstValueFrom(
            this.nats.send<UserPublicDto>(CMD_USER_UPDATE_PROFILE, dto)
        )
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/password')
    changePassword(
        @Req() req: AuthedRequest,
        @Body() body: Omit<ChangePasswordRequestDto, 'userId'>
    ) {
        const dto: ChangePasswordRequestDto = { userId: req.userId, ...body };

        return firstValueFrom(this.nats.send<UserPublicDto>(CMD_USER_CHANGE_PASSWORD, dto));
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/email')
    changeEmail(
        @Req() req: AuthedRequest,
        @Body() body: Omit<ChangeEmailRequesDto, 'userId'>
    ) {
        const dto: ChangeEmailRequesDto = { userId: req.userId, ...body };

        return firstValueFrom(this.nats.send<UserPublicDto>(CMD_USER_CHANGE_EMAIL, dto));
    }
}