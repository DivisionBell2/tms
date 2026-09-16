import { Module } from "@nestjs/common";
import { SectionsController } from "./sections.controller";
import { SectionsService } from "./sections.servce";

@Module({
    controllers: [SectionsController],
    providers: [SectionsService]
})
export class SectionModule {}