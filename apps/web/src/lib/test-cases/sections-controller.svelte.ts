import type { CreateTestCaseRequestDto, CreateTestCaseSectionRequestDto, TestCaseDto, TestCaseSectionDto } from "@tms/contracts"
import { flattenVisible, type SectionNode, type SectionTableRow } from "./sections";

export type NewTestCaseInput = Omit<CreateTestCaseRequestDto, 'authorId' | 'authorName'>;

export interface SectionViewDeps {
    getSections: () => TestCaseSectionDto[];
    getTree: () => SectionNode[];
    getExpanded: () => Set<string>;
    getSectionCases: (sectionId: string) => TestCaseDto[];
    getRootCases: () => TestCaseDto[];
    reloadSections: () => Promise<void>;
    reloadSectionCases: (sectionId: string) => Promise<void>;
    reloadRootCases: () => Promise<void>;
    onError: (message: string) => void;
    request?: typeof fetch;
}

export interface SectionsController {
    readonly highlightedSectionId: string | null,
    readonly selectedPath: string | null,
    readonly tableRows: SectionTableRow[];
    rowClass: (row: SectionTableRow) => string | undefined;
    labelOf: (node: SectionNode) => string | undefined;
    selectSection: (node: SectionNode) => void;
    onCollapsed: (node: SectionNode) => void;
    togglePin: (node: SectionNode) => void;
    createSection: (data: CreateTestCaseSectionRequestDto) => Promise<void>;
    createTestCase: (data: NewTestCaseInput) => Promise<void>;
}

export function createSectionsController(deps: SectionViewDeps): SectionsController {
    return {
        get highlightedSectionId() {
            return null;
        },
        get selectedPath() {
            return null;
        },
        get tableRows(): SectionTableRow[] {
            return [
                ...flattenVisible(deps.getTree(), deps.getExpanded(), deps.getSectionCases),
                ...deps.getRootCases().map((tc) => ({
                    kind: 'case' as const,
                    id: `c:${tc.id}`,
                    testCase: tc,
                    depth: 0
                }))
            ];
        },
        rowClass :(row) =>
            row.kind === 'section' ? 'section-row' : row.testCase.isCritical ? 'row-critical' : undefined,
        labelOf: () => undefined,
        selectSection: () => {},
        onCollapsed: () => {},
        togglePin: async () => {},
        createSection: async () => {
            throw new Error('Заглушка: создание раздела появится на этапе 2');
        },
        createTestCase: async (data) => {
            const res = await fetch('/api/test-cases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const b = await res.json().catch(() => {});
                throw new Error(b?.message ?? 'Не удалось создать тест-кейс');
            }

            await deps.reloadRootCases();
        }
    }
}