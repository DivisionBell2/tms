import { Controller } from "@nestjs/common";
import { TestCasesService } from "./test-cases.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
    CMD_TEST_CASE_CREATE,
    CMD_TEST_CASE_GET,
    CMD_TEST_CASE_LIST,
    CMD_TEST_CASE_UPDATE,
    CMD_TEST_CASE_DELETE,
    CMD_TEST_CASE_STEP_UPSERT_MANY,
    CMD_TEST_CASE_TASK_LIST,
    CMD_TEST_CASE_TASK_CREATE,
    CMD_TEST_CASE_TASK_DELETE,
    CMD_TEST_CASE_TASK_UPDATE,
    type GetTestCaseRequestDto,
    type CreateTestCaseRequestDto,
    type ListTestCasesRequestDto,
    type UpdateTestCaseRequestDto,
    type DeleteTestCaseRequestDto,
    type UpsertTestCaseStepsRequestDto,
    type ListTestCaseTasksRequestDto,
    type CreateTestCaseTaskRequestDto,
    type UpdateTestCaseTaskRequestDto,
    type DeleteTestCaseTaskRequestDto,
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

    @MessagePattern(CMD_TEST_CASE_STEP_UPSERT_MANY)
    upsertSteps(@Payload() dto: UpsertTestCaseStepsRequestDto) {
        return this.testCases.upsertSteps(dto);
    }

    @MessagePattern(CMD_TEST_CASE_TASK_LIST)
    listTasks(@Payload() dto: ListTestCaseTasksRequestDto) {
        return this.testCases.listTasks(dto);
    }

    @MessagePattern(CMD_TEST_CASE_TASK_CREATE)
    createTask(@Payload() dto: CreateTestCaseTaskRequestDto) {
        return this.testCases.createTask(dto);
    }

    @MessagePattern(CMD_TEST_CASE_TASK_UPDATE)
    updateTask(@Payload() dto: UpdateTestCaseTaskRequestDto) {
        return this.testCases.updateTask(dto);
    }

    @MessagePattern(CMD_TEST_CASE_TASK_DELETE)
    deleteTask(@Payload() dto: DeleteTestCaseTaskRequestDto) {
        return this.testCases.deleteTask(dto);
    }
}