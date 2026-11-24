import { BadRequestException, Controller, Delete, Get, Inject, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ClientProxy } from "@nestjs/microservices";
import {
    CMD_FILE_DELETE_MANY,
    CMD_FILE_GET_META,
    CMD_FILE_UPLOAD,
    CMD_TEST_CASE_ATTACHMENT_DETACH,
    CMD_TEST_CASE_ATTACHMENT_LIST,
    DetachTestCaseFileRequestDto,
    FileDeleteManyRequestDto,
    FileUploadRequestDto,
    type FileMetaDto,
    type ListTestCaseAttachmentLinksRequestDto,
    type ListTestCaseAttachmentsResponseDto,
    type TestCaseAttachmentDto,
    type TestCaseAttachmentLinkDto
} from "@tms/contracts";
import { firstValueFrom } from "rxjs";
import type { AuthedRequest } from "../auth/auth-http.controller";
import { FileInterceptor } from "@nestjs/platform-express";
import { decodeFilename } from "./filename";

function toAttachmentDto(link: TestCaseAttachmentLinkDto, meta: FileMetaDto): TestCaseAttachmentDto {
    return {
        id: link.id,
        testCaseId: link.testCaseId,
        fileId: link.fileId,
        filename: meta.filename,
        mime: meta.mime,
        size: meta.size,
        createdAt: link.createdAt
    }
}

@UseGuards(JwtAuthGuard)
@Controller('test-cases/:id/attachments')
export class TestCaseAttachmentsHttpController {
    constructor(@Inject('NATS_CLIENT') private readonly nats: ClientProxy) { }

    @Get()
    async list(@Param('id') id: string): Promise<ListTestCaseAttachmentsResponseDto> {
        const request: ListTestCaseAttachmentLinksRequestDto = { testCaseId: id };

        const links = await firstValueFrom(
            this.nats.send<TestCaseAttachmentLinkDto[]>(CMD_TEST_CASE_ATTACHMENT_LIST, request)
        );

        const settled = await Promise.all(
            links.map(async (link) => {
                try {
                    const meta = await firstValueFrom(
                        this.nats.send<FileMetaDto>(CMD_FILE_GET_META, { fileId: link.fileId })
                    );
    
                    return toAttachmentDto(link, meta);
                } catch (error) {
                    const statusCode = (error as { statusCode?: number }).statusCode;

                    if (statusCode === 404) return null;
                        
                        throw error;
                }
            })
        );

        return { items: settled.filter((item) => item !== null) }
    }

    @Delete(':attachmentId')
    async remove(
        @Param('id') id: string,
        @Param('attachmentId') attachmentId: string
    ): Promise<{ ok: true }> {
        const dto: DetachTestCaseFileRequestDto = { id: attachmentId, testCaseId: id };

        const link =await firstValueFrom(
            this.nats.send<TestCaseAttachmentLinkDto>(CMD_TEST_CASE_ATTACHMENT_DETACH, dto)
        );

        await this.deleteFiles([link.fileId]);

        return { ok: true };
    }

    private deleteFiles(fileIds: string[]) {
        const dto: FileDeleteManyRequestDto = { fileIds };

        return firstValueFrom(this.nats.send(CMD_FILE_DELETE_MANY, dto));
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @Param('id') _id: string,
        @Req() req: AuthedRequest,
        @UploadedFile() file?: Express.Multer.File
    ): Promise<TestCaseAttachmentDto> {

        if (!file) throw new BadRequestException('File is required');

        const uploadDto: FileUploadRequestDto = {
            ownerId: req.userId,
            filename: decodeFilename(file.originalname),
            mime: file.mimetype,
            dataBase64: file.buffer.toString('base64')
        }

        await firstValueFrom(this.nats.send<FileMetaDto>(CMD_FILE_UPLOAD, uploadDto));

        throw new Error('upload еще не написан')
    }
}