import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CMD_PING, type PingResponseDto } from '../../../packages/contracts';

@Controller()
export class AppController {
  @MessagePattern(CMD_PING)
  handlePing(): PingResponseDto {
    return {
      status: 'ok',
      service: 'auth',
      time: new Date().toISOString()
    }
  }
}
