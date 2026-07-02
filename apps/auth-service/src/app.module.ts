import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { createPrismaModule } from '@tms/nest-common';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [createPrismaModule(PrismaService), AuthModule],
  controllers: [AppController],
})
export class AppModule {}
