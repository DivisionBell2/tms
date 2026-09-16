import { Controller } from "@nestjs/common";
import { SectionsService } from "./sections.servce";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
    CMD_TEST_CASE_SECTION_CREATE,
    CMD_TEST_CASE_SECTION_LIST,
    CMD_TEST_CASE_SECTION_SET_PIN,
    type CreateTestCaseSectionRequestDto,
    type ListTestCaseSectionsRequestDto,
    type SetTestCaseSectionPinRequestDto
} from "@tms/contracts";

@Controller()
export class SectionsController {
    constructor(private readonly sections: SectionsService) {}

    @MessagePattern(CMD_TEST_CASE_SECTION_CREATE)
    create(@Payload() dto: CreateTestCaseSectionRequestDto) {
        return this.sections.create(dto);
    }

    @MessagePattern(CMD_TEST_CASE_SECTION_LIST)
    list(@Payload() dto: ListTestCaseSectionsRequestDto) {
        return this.sections.list(dto)
    }

    @MessagePattern(CMD_TEST_CASE_SECTION_SET_PIN)
    setPin(@Payload() dto: SetTestCaseSectionPinRequestDto) {
        return this.sections.setPin(dto);
    }
}