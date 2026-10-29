import { describe, expect, it } from "vitest";
import { buildTree, collectPinned, sectionPath, findNode, type SectionNode, flattenVisible, getHighlightedRowIds, getGroupEdges, type SectionTableRow, rowClassName } from "./sections";
import { makeCase, makeSection } from "./sections.fixtures";
import type { TestCaseDto } from "@tms/contracts";

const ids = (nodes: SectionNode[]) => nodes.map((n) => n.id);

describe('collectPinned', () => {
    it('для пустого дерева возвращает пустой список', () => {
        expect(collectPinned([])).toEqual([]);
    });

    it('находит закрепленные на любой глубине в порядке дерева', () => {
        const tree = buildTree([
            makeSection('a'),
            makeSection('a1', 'a2', 'a', true),
            makeSection('a2', 'a2', 'a'),
            makeSection('b', 'b', null, true),
            makeSection('c')
        ]);

        expect(ids(collectPinned(tree))).toEqual(['a1', 'b']);
    });

    it('не спускается внутрь закрепленного: закрепленный подраздел не дублируется', () => {
        const tree = buildTree([
            makeSection('b', 'b', null, true),
            makeSection('b1', 'b1', 'b', true)
        ]);

        expect(ids(collectPinned(tree))).toEqual(['b']);
    });
});

describe('secionPath', () => {
    const items = [
        makeSection('s3', 'Карты', 's2'),
        makeSection('s2', 'Оплата', 's1'),
        makeSection('s1', 'Регресс')
    ];

    it('для корневого раздела - его имя', () => {
        expect(sectionPath(items, 's1')).toBe('Регресс');
    });

    it('собирает путь от корня независимо от порядка в списке', () => {
        expect(sectionPath(items, 's3')).toBe('Регресс / Оплата / Карты');
    });

    it('для неизвестного id - пустая строка', () => {
        expect(sectionPath(items, 'нет-такого')).toBe('');
    });
});

describe('findNode', () => {
    const tree = buildTree([makeSection('a'), makeSection('b', 'b', 'a'), makeSection('c', 'c', 'b')]);

    it('находит корневой узел', () => {
        expect(findNode(tree, 'a')?.id).toBe('a');
    });

    it('находит глубоко вложенный узел вместе с детьми', () => {
        expect(findNode(tree, 'b')?.children.map((n) => n.id)).toEqual(['c']);
        expect(findNode(tree, 'c')?.id).toBe('c');
    });

    it('для неизвестного id возвращает undefinedэ', () => {
        expect(findNode(tree, 'нет-такого')).toBeUndefined();
    });
});

describe('flattenVisible: skip', () => {
    const tree = buildTree([makeSection('a'), makeSection('b', 'b', 'a'), makeSection('c')]);
    const expandedA = new Set(['a']);
    const noCases = () => [];

    it('без skip рисует все, как раньше', () => {
        expect(flattenVisible(tree, expandedA, noCases).map((r) => r.id)).toEqual(['s:a', 's:b', 's:c']);
    });

    it('пропускает раздел из skip вместе со всем его поддеревом', () => {
        const rows = flattenVisible(tree, expandedA, noCases, 0, new Set(['a']));

        expect(rows.map((r) => r.id)).toEqual(['s:c']);
    });
});

describe('getHighlightedRowIds', () => {
    const tree = buildTree([makeSection('a'), makeSection('b', 'b', 'a'), makeSection('c')]);
    const cases: Record<string, TestCaseDto[]> = {
        a: [makeCase('a1')],
        b: [makeCase('b1')],
        c: [makeCase('c1')],
    }

    const caseOf = (id: string) => cases[id] ?? [];

    it('без подсветки - пусто', () => {
        expect(getHighlightedRowIds(tree, 'нет-такого', caseOf).size).toBe(0)
    });

    it('для неизвестного раздела - пусто', () => {
        expect(getHighlightedRowIds(tree, 'нет-такого', caseOf).size).toBe(0);
    });

    it('раздел, его кейсы, вложенные разделы и их кейсы; соседей нет', () => {
        const result = getHighlightedRowIds(tree, 'a', caseOf);
        
        expect([...result].sort()).toEqual(['c:a1', 'c:b1', 's:a', 's:b']);
    });

    it('закрепленный потомок в группу не входит: его строки уехали наверх', () => {
        const result = getHighlightedRowIds(tree, 'a', caseOf, new Set(['b']));

        expect([...result].sort()).toEqual(['c:a1', 's:a']);
    });

    it('сам подсвеченный раздел остается в группе, даже если он закреплен', () => {
        const result = getHighlightedRowIds(tree, 'b', caseOf, new Set(['b']));

        expect([...result].sort()).toEqual(['c:b1', 's:b']);
    });
});

describe('getGroupEdges', () => {
    const tree = buildTree([makeSection('a'), makeSection('b', 'b', 'a'), makeSection('c')]);
    const rows = flattenVisible(tree, new Set(['a']), (id) => (id === 'a' ? [makeCase('a1')] : []));

    it('первая и последняя строки группы', () => {
        const edges = getGroupEdges(rows, new Set(['s:a', 'c:a1', 's:b']));

        expect(edges).toEqual({ first: 's:a', last: 's:b' });
    });

    it('для пустой группы краев нет', () => {
        expect(getGroupEdges(rows, new Set())).toEqual({ first: undefined, last: undefined });
    });
});

describe('rowClassName', () => {
    const sectionRow: SectionTableRow = {
        kind: 'section',
        id: 's:a',
        node: { ...makeSection('a'), children: [] },
        depth: 0
    }

    const caseRow = (id: string, isCritical = false): SectionTableRow => ({
        kind: 'case',
        id: `c:${id}`,
        testCase: makeCase(id, { isCritical }),
        depth: 1
    });

    const none = new Set<string>();

    it('раздел - section-row', () => {
        expect(rowClassName(sectionRow, none, {})).toBe('section-row');
    });

    it('критичный кейс - row-critical, обычный - без класса', () => {
        expect(rowClassName(caseRow('x', true), none, {})).toBe('row-critical');
        expect(rowClassName(caseRow('x'), none, {})).toBeUndefined();
    });

    it('строка внутри группы - in-group', () => {
        const edges = { first: 's:a', last: 'c:z'};

        expect(rowClassName(caseRow('x'), new Set(['c:x']), edges)).toBe('in-group');
    });

    it('первая строка группы получает group-start, последняя - group-end', () => {
        const group = new Set(['s:a', 'c:z']);
        const edges = { first: 's:a', last: 'c:z' };

        expect(rowClassName(sectionRow, group, edges)).toBe('section-row in-group group-start');
        expect(rowClassName(caseRow('z'), group, edges)).toBe('in-group group-end');
    });

    it('группа из одной строки получает оба края', () => {
        const edges = { first: 's:a', last: 's:a' };

        expect(rowClassName(sectionRow, new Set(['s:a']), edges)).toBe(
            'section-row in-group group-start group-end'
        );
    });

    it('критичная строка в группе остается критичной', () => {
        const edges = {first: 'c:x', last: 'c:x' };

        expect(rowClassName(caseRow('x', true), new Set(['c:x']), edges)).toBe(
            'row-critical in-group group-start group-end' 
        );
    });
});