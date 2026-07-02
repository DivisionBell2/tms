import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { createPrismaModule } from '@tms/nest-common';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [createPrismaModule(PrismaService), FilesModule],
})
export class AppModule {}
