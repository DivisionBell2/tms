import { Controller } from "@nestjs/common";
import { TestCasesService } from "./test-cases.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
    CMD_TEST_CASE_CREATE,
    CMD_TEST_CASE_GET,
    CMD_TEST_CASE_LIST,
    CMD_TEST_CASE_UPDATE,
    CMD_TEST_CASE_DELETE,
    type GetTestCaseRequestDto,
    type CreateTestCaseRequestDto,
    type ListTestCasesRequestDto,
    type UpdateTestCaseRequestDto,
    type DeleteTestCaseRequestDto,
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

    @MessagePattern(CMD_TEST_CASE_GET)
    get(@Payload() dto: GetTestCaseRequestDto) {
        return this.testCases.get(dto);
    }

    @MessagePattern(CMD_TEST_CASE_UPDATE)
    update(@Payload() dto: UpdateTestCaseRequestDto) {
        return this.testCases.update(dto);
    }

    @MessagePattern(CMD_TEST_CASE_DELETE)
    delete(@Payload() dto: DeleteTestCaseRequestDto) {
        return this.testCases.delete(dto);
    }
}