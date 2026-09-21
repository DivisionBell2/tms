import { Body, Controller, Get, Inject, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ClientProxy } from "@nestjs/microservices";
import {
    CMD_TEST_CASE_SECTION_CREATE,
    CMD_TEST_CASE_SECTION_LIST,
    CMD_TEST_CASE_SECTION_SET_PIN,
    SetTestCaseSectionPinRequestDto,
    TestCaseSectionDto,
    type CreateTestCaseSectionRequestDto,
    type ListTestCaseSectionsRequestDto,
    type ListTestCaseSectionsResponseDto } from "@tms/contracts";
import { firstValueFrom } from "rxjs";

@UseGuards(JwtAuthGuard)
@Controller('test-case-sections')
export class TestcaseSectionsHttpController {
    constructor(@Inject('NATS_CLIENT') private readonly nats: ClientProxy) {}

    @Get()
    list(
        @Query('page') sort?: ListTestCaseSectionsRequestDto['sort'],
        @Query('order') order?: ListTestCaseSectionsRequestDto['order']
    ): Promise<ListTestCaseSectionsResponseDto> {
        const dto: ListTestCaseSectionsRequestDto = { sort, order };

        return firstValueFrom(this.nats.send<ListTestCaseSectionsResponseDto>(CMD_TEST_CASE_SECTION_LIST, dto));
    }

    @Post()
    create(@Body() body: CreateTestCaseSectionRequestDto): Promise<TestCaseSectionDto> {
        const dto: CreateTestCaseSectionRequestDto = {
            name: body.name,
            parentId: body.parentId ?? null
        }

        return firstValueFrom(this.nats.send<TestCaseSectionDto>(CMD_TEST_CASE_SECTION_CREATE, dto))
    }

    @Patch(':id/pin')
    setPin(
        @Param('id') id: string,
        @Body() body: { isPinned: boolean }
    ): Promise<TestCaseSectionDto> {
        const dto: SetTestCaseSectionPinRequestDto = {
            id, isPinned: body.isPinned
        }

        return firstValueFrom(this.nats.send<TestCaseSectionDto>(CMD_TEST_CASE_SECTION_SET_PIN, dto));
    }
}