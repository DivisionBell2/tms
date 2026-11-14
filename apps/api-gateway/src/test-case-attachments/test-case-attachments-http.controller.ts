import { Controller, Delete, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ClientProxy } from "@nestjs/microservices";
import {
    CMD_FILE_GET_META,
    CMD_TEST_CASE_ATTACHMENT_LIST,
    FileMetaDto,
    ListTestCaseAttachmentLinksRequestDto,
    ListTestCaseAttachmentsResponseDto,
    TestCaseAttachmentLinkDto
} from "@tms/contracts";
import { firstValueFrom } from "rxjs";

@UseGuards(JwtAuthGuard)
@Controller('test-cases/:id/attachments')
export class TestCaseAttachmentsHttpController {
    constructor(@Inject('NATS_CLIENT') private readonly nats: ClientProxy) {}

    @Get()
    async list(@Param('id') id: string): Promise<ListTestCaseAttachmentsResponseDto> {
        const request: ListTestCaseAttachmentLinksRequestDto = { testCaseId: id };

        const links = await firstValueFrom(
            this.nats.send<TestCaseAttachmentLinkDto[]>(CMD_TEST_CASE_ATTACHMENT_LIST, request)
        );

        await Promise.all(
            links.map((link) =>
                firstValueFrom(this.nats.send<FileMetaDto>(CMD_FILE_GET_META, { fileId: link.fileId }))
            )
        );
        
        return { items: [] }
    }

    @Delete(':attachmentId')
    async remove(
        @Param('id') _id: string,
        @Param('attachmentId') _attachmentId: string
    ): Promise<{ ok: true }> {
        return { ok: true };
    }
}