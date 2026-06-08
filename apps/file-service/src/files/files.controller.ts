import { Controller } from "@nestjs/common";
import { FilesService } from "./files.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
    CMD_FILE_DELETE,
    CMD_FILE_GET_META,
    CMD_FILE_UPLOAD,
    type FileGetMetaRequestDto,
    type FileUploadRequestDto,
    type FileDeleteRequestDto
} from "@tms/contracts";

@Controller()
export class FilesController {
    constructor(private readonly files: FilesService) { }

    @MessagePattern(CMD_FILE_UPLOAD)
    upload(@Payload() dto: FileUploadRequestDto) {
        return this.files.upload(dto);
    }

    @MessagePattern(CMD_FILE_GET_META)
    getMeta(@Payload() dto: FileGetMetaRequestDto) {
        return this.files.getMeta(dto);
    }

    @MessagePattern(CMD_FILE_DELETE)
    delete(@Payload() dto: FileDeleteRequestDto) {
        return this.files.delete(dto);
    }
}