import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CMD_PING, type PingResponseDto } from '@tms/contracts';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
  ) {}

  @Get('ping')
  async ping(): Promise<PingResponseDto> {
    return firstValueFrom(
      this.natsClient.send<PingResponseDto>(CMD_PING, {}),
    );
  }
}