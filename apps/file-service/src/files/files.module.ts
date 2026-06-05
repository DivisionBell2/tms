import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

@Module({
    imports: [],
    controllers: [FilesController],
    providers: [FilesService],
    exports: [],
})
export class FilesModule {}