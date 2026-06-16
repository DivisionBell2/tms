import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(__dirname, '../.env') });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { MicroserviceOptions} from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { AllRpcExceptionsFilter } from './common/all-rpc-exceptions.filter';

async function bootstrap() {
  const natsUrl = process.env.NATS_URL ?? 'nats://localhost:4222';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [natsUrl]
      }
    }
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());
  await app.listen();

  console.log(`auth-service connected to NATS at ${natsUrl}`);
}

bootstrap();