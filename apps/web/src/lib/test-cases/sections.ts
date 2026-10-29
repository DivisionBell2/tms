import type { TestCaseDto, TestCaseSectionDto } from "@tms/contracts";

export interface SectionNode extends TestCaseSectionDto {
    children: SectionNode[];
}

export type SectionTableRow =
    | { kind: 'section'; id: string; node: SectionNode; depth: number }
    | { kind: 'case'; id: string; testCase: TestCaseDto; depth: number };

export interface GroupEdges {
    first?: string;
    last?: string;
}

const STORAGE_KEY = 'tms-test-case-sections-expanded';

export function buildTree(items: TestCaseSectionDto[]): SectionNode[] {
    const byId = new Map<string, SectionNode>();

    for (const item of items) {
        byId.set(item.id, { ...item, children: [] });
    }

    const roots: SectionNode[] = [];

    for (const node of byId.values()) {
        const parent = node.parentId ? byId.get(node.parentId) : undefined;

        if (parent) parent.children.push(node);
        else roots.push(node);
    }

    return roots;
}

export function flattenVisible(
    roots: SectionNode[],
    expanded: Set<string>,
    casesOf: (sectionId: string) => TestCaseDto[],
    depth = 0,
    skip: Set<string> = new Set()
): SectionTableRow[] {
    const out: SectionTableRow[] = [];

    for (const node of roots) {
        if (skip.has(node.id)) continue;

        out.push({ kind: 'section', id: `s:${node.id}`, node, depth });

        if (!expanded.has(node.id)) continue;

        for (const testCase of casesOf(node.id)) {
            out.push({ kind: 'case', id: `c:${testCase.id}`, testCase, depth: depth + 1 });
        }

        out.push(...flattenVisible(node.children, expanded, casesOf, depth + 1, skip));
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

export function collectPinned(roots: SectionNode[]): SectionNode[] {
    const out: SectionNode[] = [];

    for (const node of roots) {
        if (node.isPinned) out.push(node);
        else out.push(...collectPinned(node.children));
    }

    return out;
}

export function sectionPath(items: TestCaseSectionDto[], id: string): string {
    const byId = new Map(items.map((item) => [item.id, item]));
    const parts: string[] = [];

    let current = byId.get(id);

    while (current) {
        parts.unshift(current.name);
        current = current.parentId ? byId.get(current.parentId) : undefined;
    }

    return parts.join(' / ');
}

export function findNode(roots: SectionNode[], id: string): SectionNode | undefined {
    for (const node of roots) {
        if (node.id === id) return node;

        const found = findNode(node.children, id);

        if (found) return found;
    }

    return undefined;
}

export function getHighlightedRowIds(
    roots: SectionNode[],
    highlightedId: string | null,
    casesOf: (sectionId: string) => TestCaseDto[],
    skip: Set<string> = new Set()
): Set<string> {
    const ids = new Set<string>();

    if (!highlightedId) return ids;

    const start = findNode(roots, highlightedId);

    if (!start) return ids;

    const visit = (node: SectionNode) => {
        ids.add(`s:${node.id}`);

        for (const testCase of casesOf(node.id)) ids.add(`c:${testCase.id}`);

        for (const child of node.children) {
            if (!skip.has(child.id)) visit(child);
        }
    };

    visit(start);

    return ids;
}

export function getGroupEdges(rows: SectionTableRow[], ids: Set<string>): GroupEdges {
    const inGroup = rows.filter((row) => ids.has(row.id));

    return { first: inGroup.at(0)?.id, last: inGroup.at(-1)?.id };
}

export function rowClassName(
    row: SectionTableRow,
    highlightedIds: Set<string>,
    edges: GroupEdges
): string | undefined {
    const classes: string[] = [];

    if (row.kind === 'section') classes.push('section-row');
    else if (row.testCase.isCritical) classes.push('row-critical');

    if (highlightedIds.has(row.id)) {
        classes.push('in-group');

        if (row.id === edges.first) classes.push('group-start');
        if (row.id === edges.last) classes.push('group-end');
    }

    return classes.length > 0 ? classes.join(' ') : undefined;
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