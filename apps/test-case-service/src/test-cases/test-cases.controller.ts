import { Controller } from "@nestjs/common";
import { TestCasesService } from "./test-cases.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
    CMD_TEST_CASE_CREATE,
    CMD_TEST_CASE_LIST,
    type CreateTestCaseRequestDto,
    type ListTestCasesRequestDto
} from "@tms/contracts";

@Controller()
export class TestCasesController {
    constructor(private readonly testCases: TestCasesService) {}

    @MessagePattern(CMD_TEST_CASE_CREATE)
    create(@Payload() dto: CreateTestCaseRequestDto) {
        return this.testCases.create(dto);
    }

    @MessagePattern(CMD_TEST_CASE_LIST)
    list(@Payload() dto: ListTestCasesRequestDto) {
        return this.testCases.list(dto);
    }
}