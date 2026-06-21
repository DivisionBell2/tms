import { Body, Controller, Get, Inject, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ClientProxy } from "@nestjs/microservices";
import type { AuthedRequest } from "../auth/auth-http.controller";
import {
    CMD_TEST_CASE_CREATE,
    CMD_TEST_CASE_LIST,
    type CreateTestCaseRequestDto,
    type ListTestCasesRequestDto,
    type ListTestCasesResponseDto,
    type TestCaseDto
} from "@tms/contracts";
import { firstValueFrom } from "rxjs";

@UseGuards(JwtAuthGuard)
@Controller('test-cases')
export class TestCasesHttpController {
    constructor(@Inject('NATS_CLIENT') private readonly nats: ClientProxy) {}

    @Post()
    create(
        @Req() req: AuthedRequest,
        @Body() body: Omit<CreateTestCaseRequestDto, 'authorId'>
    ): Promise<TestCaseDto> {
        const dto: CreateTestCaseRequestDto = { authorId: req.userId, ...body }
        
        return firstValueFrom(this.nats.send<TestCaseDto>(CMD_TEST_CASE_CREATE, dto))
    }

    @Get()
    list(
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
        @Query('sort') sort?: ListTestCasesRequestDto['sort'],
        @Query('order') order?: ListTestCasesRequestDto['order'],
        @Query('filter') filter?: string,
        @Query('authorId') authorId?: string
    ): Promise<ListTestCasesResponseDto> {
        const dto: ListTestCasesRequestDto = {
            page: Number(page) || 1,
            pageSize: Number(pageSize) || 20,
            sort,
            order,
            filter: filter || undefined,
            authorId: authorId || undefined
        };
        
        return firstValueFrom(
            this.nats.send<ListTestCasesResponseDto>(CMD_TEST_CASE_LIST, dto)
        )
    }
}