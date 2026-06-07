import { Controller, Get, Inject, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { type AuthedRequest } from "../auth/auth-http.controller";
import type { FileMetaDto, FileUploadRequestDto } from "@tms/contracts";
import { CMD_FILE_GET_META, CMD_FILE_UPLOAD } from "@tms/contracts";
import { firstValueFrom } from "rxjs";
import { createReadStream } from "fs";
import { type Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesHttpController {
    constructor(@Inject('NATS_CLIENT') private readonly nats: ClientProxy) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @Req() req: AuthedRequest,
        @UploadedFile() file: Express.Multer.File
    ): Promise<FileMetaDto> {
        const dto: FileUploadRequestDto = {
            ownerId: req.userId,
            filename: file.originalname,
            mime: file.mimetype,
            dataBase64: file.buffer.toString('base64')
        }

        return firstValueFrom(this.nats.send<FileMetaDto>(CMD_FILE_UPLOAD, dto));
    }

    @Get(':id')
    async download(@Param('id') id: string, @Res() res: Response) {
        const meta = await firstValueFrom(this.nats.send<FileMetaDto>(CMD_FILE_GET_META, { fileId: id })
        );

        const path = `../file-service/storage/${meta.id}`;
        res.setHeader('Content-Type', meta.mime);
        createReadStream(path).pipe(res);
    }
}