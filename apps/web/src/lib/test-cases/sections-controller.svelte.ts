import type { CreateTestCaseRequestDto, CreateTestCaseSectionRequestDto, TestCaseDto, TestCaseSectionDto } from "@tms/contracts"
import { flattenVisible, collectPinned as collectPinned, type SectionNode, type SectionTableRow, getHightlightedRowIds, getGroupEdges, collectDescendantIds, rowClassName, sectionPath } from "./sections";

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

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function readMessage(res: Response, fallback: string): Promise<string> {
    const body = await res.json().catch(() => ({}));

    return body.message ?? fallback;
}

export function createSectionsController(deps: SectionViewDeps): SectionsController {
    const request = deps.request ?? fetch;

    let highlightedSectionId = $state<string | null>(null);

    const pinnedNodes = $derived(collectPinned(deps.getTree()));
    const pinnedIds = $derived(new Set(pinnedNodes.map((n) => n.id)));

    const tableRows = $derived<SectionTableRow[]>([
        ...flattenVisible(pinnedNodes, deps.getExpanded(), deps.getSectionCases),
        ...flattenVisible(deps.getTree(), deps.getExpanded(), deps.getSectionCases, 0, pinnedIds),
        ...deps.getRootCases().map((tc) => ({
            kind: 'case' as const,
            id: `c:${tc.id}`,
            testCase: tc,
            depth: 0
        }))
    ]);

    const highlightedRowIds = $derived(
        getHightlightedRowIds(deps.getTree(), highlightedSectionId, deps.getSectionCases, pinnedIds)
    );

    const groupEdges = $derived(getGroupEdges(tableRows, highlightedRowIds));

    function selectSection(node: SectionNode) {
        if (!deps.getExpanded().has(node.id)) return;

        highlightedSectionId = highlightedSectionId === node.id ? null : node.id;
    }

    function onCollapsed(node: SectionNode) {
        if (highlightedSectionId === null) return;

        if (highlightedSectionId === node.id || collectDescendantIds(node).includes(highlightedSectionId)) {
            highlightedSectionId = null;
        }
    }

    async function togglePin(node: SectionNode): Promise<void> {
        try {
            const res = await request(`/api/test-case-sections/${node.id}/pin`, {
                method: 'PATCH',
                headers: JSON_HEADERS,
                body: JSON.stringify({ isPinned: !node.isPinned })
            });

            if (!res.ok) throw new Error('Не удалось изменить закрепление');

            await deps.reloadSections();
        } catch (e) {
            deps.onError(e instanceof Error ? e.message : 'Ошибка');
        }
    }

    async function createSection(data: CreateTestCaseSectionRequestDto): Promise<void> {
        const res = await request('/api/test-case-sections', {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error(await readMessage(res, 'Не удалось создать раздел'));

        await deps.reloadSections();
    }

    async function createTestCase(data: NewTestCaseInput): Promise<void> {
        const sectionId = highlightedSectionId;

        const res = await request('/api/test-cases', {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ ...data, sectionId })
        });

        if (!res.ok) throw new Error(await readMessage(res, 'Не удалось создать тест-кейс'));

        if (sectionId) await deps.reloadSectionCases(sectionId);
        else await deps.reloadRootCases();
    }

    return {
        get highlightedSectionId() {
            return highlightedSectionId;
        },
        get selectedPath() {
            return highlightedSectionId ? sectionPath(deps.getSections(), highlightedSectionId) : null;
        },
        get tableRows(): SectionTableRow[] {
            return tableRows
        },
        rowClass: (row) => rowClassName(row, highlightedRowIds, groupEdges),
        labelOf: (node) => (node.isPinned ? sectionPath(deps.getSections(), node.id) : undefined),
        selectSection,
        onCollapsed,
        togglePin,
        createSection,
        createTestCase,
    }
}