import type { TestCaseDto, TestCaseSectionDto } from "@tms/contracts";

export function makeSection(
    id: string,
    name: string = id,
    parentId: string | null = null,
    isPinned = false
): TestCaseSectionDto {
    return {
        id,
        name,
        parentId,
        isPinned,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    }
}

export function makeCase(id: string, overrides: Partial<TestCaseDto> = {}): TestCaseDto {
    return {
        id, title: id, tags: [], isCritical: false, ...overrides
    } as TestCaseDto;
}