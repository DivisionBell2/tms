import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
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
    type UpsertTestCaseStepItemDto,
    TestCaseStepDto,
    UpsertTestCaseStepsRequestDto,
    CMD_TEST_CASE_STEP_UPSERT_MANY,
    ListTestCaseTasksResponseDto,
    CMD_TEST_CASE_TASK_LIST,
    CreateTestCaseTaskRequestDto,
    TestCaseTaskDto,
    UpdateTestCaseTaskRequestDto,
    CMD_TEST_CASE_TASK_UPDATE,
    DeleteTestCaseTaskRequestDto,
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
        @Query('isCritical') isCritical?: string,
        @Query('sectionId') sectionId?: string,
    ): Promise<ListTestCasesResponseDto> {
        const section = sectionId === undefined || sectionId === ''
            ? undefined
            : sectionId === 'root'
                ? null
                : sectionId;

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
            isCritical: isCritical === 'true' ? true : isCritical === 'false' ? false: undefined,
            sectionId: section
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

    @Put(':id/steps')
    upsertSteps(
        @Param('id') id: string,
        @Body() body: { steps: UpsertTestCaseStepItemDto[]}
    ): Promise<TestCaseStepDto[]> {
        const dto: UpsertTestCaseStepsRequestDto = {
            testCaseId: id,
            steps: body.steps ?? []
        };
        return firstValueFrom(
            this.nats.send<TestCaseStepDto[]>(CMD_TEST_CASE_STEP_UPSERT_MANY, dto)
        )
    }

    @Get(':id/tasks')
    listTasks(@Param('id') id: string): Promise<ListTestCaseTasksResponseDto> {
        return firstValueFrom(
            this.nats.send<ListTestCaseTasksResponseDto>(CMD_TEST_CASE_TASK_LIST, { testCaseId: id })
        )
    }

    @Post(':id/tasks')
    createTask(
        @Param('id') id: string,
        @Body() body: Omit<CreateTestCaseTaskRequestDto, 'testCaseId'>
    ): Promise<TestCaseTaskDto> {
        const dto: CreateTestCaseTaskRequestDto = { testCaseId: id, ...body };

        return firstValueFrom(
            this.nats.send<TestCaseTaskDto>(CMD_TEST_CASE_CREATE, dto)
        );
    }

    @Patch(':id/tasks/:taskId')
    updateTask(
        @Param('id') id: string,
        @Param('taskId') taskId: string,
        @Body() body: Omit<UpdateTestCaseTaskRequestDto, 'id' | 'testCaseId'>
    ): Promise<TestCaseTaskDto> {
        const dto: UpdateTestCaseTaskRequestDto = {
            id: taskId,
            testCaseId: id,
            ...body
        }

        return firstValueFrom(
            this.nats.send<TestCaseTaskDto>(CMD_TEST_CASE_TASK_UPDATE, dto)
        );
    }

    @Delete(':id/tasks/:taskId')
    deleteTask(
        @Param('id') id: string,
        @Param('taskId') taskId: string
    ): Promise<{ ok: true }> {
        const dto: DeleteTestCaseTaskRequestDto = {
            id: taskId,
            testCaseId: id
        };

        return firstValueFrom(
            this.nats.send<{ ok: true }>(CMD_TEST_CASE_CREATE, dto)
        );
    }


}