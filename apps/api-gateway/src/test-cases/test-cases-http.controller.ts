import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ClientProxy } from "@nestjs/microservices";
import type { AuthedRequest } from "../auth/auth-http.controller";
import {
    CMD_TEST_CASE_CREATE,
    CMD_TEST_CASE_DELETE,
    CMD_TEST_CASE_GET,
    CMD_TEST_CASE_LIST,
    CMD_TEST_CASE_UPDATE,
    CMD_USER_GET_BY_ID,
    DeleteTestCaseRequestDto,
    GetTestCaseRequestDto,
    TestCaseDetailDto,
    UpdateTestCaseRequestDto,
    type CreateTestCaseRequestDto,
    type ListTestCasesRequestDto,
    type ListTestCasesResponseDto,
    type TestCaseDto,
    type TestCaseStatus,
    type UserPublicDto,
} from "@tms/contracts";
import { firstValueFrom } from "rxjs";

@UseGuards(JwtAuthGuard)
@Controller('test-cases')
export class TestCasesHttpController {
    constructor(@Inject('NATS_CLIENT') private readonly nats: ClientProxy) {}

    @Post()
    async create(
        @Req() req: AuthedRequest,
        @Body() body: Omit<CreateTestCaseRequestDto, 'authorId' | 'authorName'>
    ): Promise<TestCaseDto> {
        const author = await firstValueFrom(
            this.nats.send<UserPublicDto>(CMD_USER_GET_BY_ID, { userId: req.userId })
        )
        const dto: CreateTestCaseRequestDto = {
            authorId: req.userId,
            authorName: author?.displayName ?? '',
            ...body
        }
        
        return firstValueFrom(this.nats.send<TestCaseDto>(CMD_TEST_CASE_CREATE, dto))
    }

    @Get()
    list(
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
        @Query('sort') sort?: ListTestCasesRequestDto['sort'],
        @Query('order') order?: ListTestCasesRequestDto['order'],
        @Query('filter') filter?: string,
        @Query('authorId') authorId?: string,
        @Query('status') status?: TestCaseStatus,
        @Query('author') author?: string,
        @Query('createdFrom') createdFrom?: string,
        @Query('createdTo') createdTo?: string,
        @Query('updatedFrom') updatedFrom?: string,
        @Query('updatedTo') updatedTo?: string,
        @Query('tag') tag?: string,
        @Query('isCritical') isCritical?: string
    ): Promise<ListTestCasesResponseDto> {
        const dto: ListTestCasesRequestDto = {
            page: Number(page) || 1,
            pageSize: Number(pageSize) || 20,
            sort,
            order,
            filter: filter || undefined,
            authorId: authorId || undefined,
            status: status || undefined,
            author: author || undefined,
            createdFrom: createdFrom || undefined,
            createdTo: createdTo || undefined,
            updatedFrom: updatedFrom || undefined,
            updatedTo: updatedTo || undefined,
            tag: tag || undefined,
            isCritical: isCritical === 'true' ? true : isCritical === 'false' ? false: undefined
        };
        
        return firstValueFrom(
            this.nats.send<ListTestCasesResponseDto>(CMD_TEST_CASE_LIST, dto)
        )
    }

    @Get(':id')
    get(@Param('id') id: string): Promise<TestCaseDto> {
        const dto: GetTestCaseRequestDto = { id }
        return firstValueFrom(
            this.nats.send<TestCaseDto>(CMD_TEST_CASE_GET, dto)
        )
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: Omit<UpdateTestCaseRequestDto, 'id'>): Promise<TestCaseDto> {
        const dto: UpdateTestCaseRequestDto = { id, ...body };
        return firstValueFrom(
            this.nats.send<TestCaseDetailDto>(CMD_TEST_CASE_UPDATE, dto)
        )
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<{ ok: true }> {
        const dto: DeleteTestCaseRequestDto = { id };
        return firstValueFrom(
            this.nats.send<{ ok: true }>(CMD_TEST_CASE_DELETE, dto)
        );
    }
}