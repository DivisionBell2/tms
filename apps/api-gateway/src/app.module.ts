import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller.js';
import { FilesHttpController } from './files/files-http.controller.js';
import { AuthHttpController } from './auth/auth-http.controller.js';
import { ThrottlerModule } from '@nestjs/throttler';

const natsUrl = process.env.NATS_URL ?? 'nats://localhost:4222';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'public',
        ttl: 60_000,
        limit: 3
      }
    ]),
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
  controllers: [
    AppController,
    AuthHttpController,
    FilesHttpController
  ],
})
export class AppModule {}
