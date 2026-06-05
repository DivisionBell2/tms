import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [PrismaModule, FilesModule],
})
export class AppModule {}
