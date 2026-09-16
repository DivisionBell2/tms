import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestCasesModule } from './test-cases/test-cases.module';
import { createPrismaModule } from '@tms/nest-common';
import { PrismaService } from './prisma/prisma.service';
import { SectionModule } from './sections/sections.module';

@Module({
  imports: [createPrismaModule(PrismaService), TestCasesModule, SectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
