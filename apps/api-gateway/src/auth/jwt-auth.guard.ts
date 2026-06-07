import type { CanActivate} from "@nestjs/common";
import { Inject, UnauthorizedException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import type { AuthedRequest } from "./auth-http.controller";
import { firstValueFrom } from "rxjs";
import type { ValidateTokenResponseDto } from "@tms/contracts";
import { CMD_AUTH_VALIDATE_TOKEN } from "@tms/contracts";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(@Inject('NATS_CLIENT') private readonly nats: ClientProxy) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<AuthedRequest & { headers: Record<string, string | undefined>}>();
        const header = req.headers.authorization;
        const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

        if (!token) throw new UnauthorizedException('Missing access token');

        const result = await firstValueFrom(
            this.nats.send<ValidateTokenResponseDto>(CMD_AUTH_VALIDATE_TOKEN, { accessToken: token })
        );

        if (!result.valid || !result.userId) throw new UnauthorizedException('Invalid access token');

        req.userId = result.userId;
        
        return true;
    }
}