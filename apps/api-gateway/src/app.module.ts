import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller.js';

const natsUrl = process.env.NATS_URL ?? 'nats://localhost:4222';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_CLIENT',
        transport: Transport.NATS,
        options: {
          servers: [natsUrl],
        },
      },
    ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
