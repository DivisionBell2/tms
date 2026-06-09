import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CMD_PING, type PingResponseDto } from '@tms/contracts';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ public: { limit: 3, ttl: 60_000 }})
  @Get('ping')
  async ping(): Promise<PingResponseDto> {
    return firstValueFrom(
      this.natsClient.send<PingResponseDto>(CMD_PING, {}),
    );
  }
}