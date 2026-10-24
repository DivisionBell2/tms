import type { TestCaseDto, TestCaseSectionDto } from "@tms/contracts";

export interface SectionNode extends TestCaseSectionDto {
    children: SectionNode[];
}

export interface GroupEdges {
    first?: string;
    last?: string;
}

export type SectionTableRow =
    | { kind: 'section'; id: string; node: SectionNode; depth: number }
    | { kind: 'case'; id: string; testCase: TestCaseDto; depth: number };

const STORAGE_KEY = 'tms-test-case-sections-expanded';

export function buildTree(items: TestCaseSectionDto[]): SectionNode[] {
    const byId = new Map<string, SectionNode>();

    for (const item of items) {
        byId.set(item.id, { ...item, children: [] });
    }

    const roots: SectionNode[] = [];

    for (const node of byId.values()) {
        const parent = node.parentId ? byId.get(node.parentId) : undefined;

        if (parent) {
            parent.children.push(node);
        } else {
            roots.push(node);
        }
    }

    return roots;
}

export function flattenVisible(
    roots: SectionNode[],
    expanded: Set<string>,
    caseOf: (sectionId: string) => TestCaseDto[],
    depth = 0,
    _skip: Set<string> = new Set()
): SectionTableRow[] {
    const out: SectionTableRow[] = [];

    for (const node of roots) {
        out.push({ kind: 'section', id: `s:${node.id}`, node, depth });

        if (!expanded.has(node.id)) continue;

        for (const testCase of caseOf(node.id)) {
            out.push({ kind: 'case', id: `c:${testCase.id}`, testCase, depth: depth + 1 });
        }

        out.push(...flattenVisible(node.children, expanded, caseOf, depth + 1));
    }

    return out;
}

export function collectDescendantIds(node: SectionNode): string[] {
    const out: string[] = [];

    for (const child of node.children) {
        out.push(child.id);
        out.push(...collectDescendantIds(child));
    }

    return out;
}

export function restoreExpanded(): Set<string> {
    if (typeof localStorage === 'undefined') return new Set();

    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown;

        if (!Array.isArray(parsed)) return new Set();

        return new Set(parsed.filter((v): v is string => typeof v === 'string'));
    } catch {
        return new Set();
    }
}

export function persistExpanded(expanded: Set<string>): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]));
}

export function collectPinned(_roots: SectionNode[]): SectionNode[] {
    return [];
}

export function sectionPath(_items: TestCaseSectionDto[], _id: string): string {
    return '';
}

export function getHightlightedRowIds(
    _roots: SectionNode[],
    _highhlightedId: string | null,
    _caseOf: (sectionId: string) => TestCaseDto[],
    _skip: Set<string> = new Set()
): Set<string> {
    return new Set();
}

export function getGroupEdges(_rows: SectionTableRow[], _ids: Set<string>): GroupEdges {
    return {}
}

export function rowClassName(
    row: SectionTableRow,
    _highlightedIds: Set<string>,
    _edges: GroupEdges
): string | undefined {
    if (row.kind === 'section') return 'section-row';

    return row.testCase.isCritical ? 'row-critical' : undefined;
}