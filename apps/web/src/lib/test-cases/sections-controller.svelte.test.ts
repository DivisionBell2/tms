import type { TestCaseDto, TestCaseSectionDto } from "@tms/contracts";
import { buildTree, type SectionNode } from "./sections";
import { makeCase, makeSection } from "./sections.fixtures";
import { describe, expect, it, vi, type Mock } from "vitest";
import { createSectionsController, type NewTestCaseInput } from "./sections-controller.svelte";

interface Init {
    sections?: TestCaseSectionDto[];
    expanded?: string[];
    sectionCases?: Record<string, TestCaseDto[]>;
    rootCases?: TestCaseDto[];
}

function ok(): Response {
    return new Response('{}', { status: 200 });
}

function fail(message?: string): Response {
    return new Response(JSON.stringify(message ? { message } : {}), { status: 400 });
}

function node(id: string, overrides: Partial<SectionNode> = {}): SectionNode {
    return { ...makeSection(id), children: [], ...overrides };
}

function sentBody(request: Mock<typeof fetch>, call = 0): unknown {
    return JSON.parse(String(request.mock.calls[call]?.[1]?.body));
}

function setup(init: Init = {}) {
    const state = $state({
        sections: init.sections ?? [],
        expanded: new Set(init.expanded ?? []),
        sectionCases: init.sectionCases ?? {},
        rootCases: init.rootCases ?? []
    });

    const request = vi.fn<typeof fetch>(async () => ok());

    const deps = {
        getSections: () => state.sections,
        getTree: () => buildTree(state.sections),
        getExpanded: () => state.expanded,
        getSectionCases: (id: string) => state.sectionCases[id] ?? [],
        getRootCases: () => state.rootCases,
        reloadSections: vi.fn(async () => { }),
        reloadSectionCases: vi.fn(async (_id: string) => { }),
        reloadRootCases: vi.fn(async () => { }),
        onError: vi.fn(),
        request
    };

    return { controller: createSectionsController(deps), deps, state, request }
}

describe('selectSection', () => {
    it('не подсвечивает свернутый раздел', () => {
        const { controller } = setup();

        controller.selectSection(node('s1'));

        expect(controller.highlightedSectionId).toBeNull();
    });

    it('подсвечивает развернутый раздел, повторный выбор снимает подсветку', () => {
        const { controller } = setup({ expanded: ['s1']});

        controller.selectSection(node('s1'));
        expect(controller.highlightedSectionId).toBe('s1');

        controller.selectSection(node('s1'));
        expect(controller.highlightedSectionId).toBeNull();
    });

    it('переносит подсветку на другой раздел: двух сразу не бывает', () => {
        const { controller } = setup({ expanded: ['s1', 's2']});

        controller.selectSection(node('s1'));
        controller.selectSection(node('s2'));

        expect(controller.highlightedSectionId).toBe('s2');
    });
});

describe('onCollapsed', () => {
    it('снимает подсветку со свернутого раздела', () => {
        const { controller } = setup({ expanded: ['s1']});

        controller.selectSection(node('s1'));
        controller.onCollapsed(node('s1'));

        expect(controller.highlightedSectionId).toBeNull();
    });

    it('снимает подсветку с потомка свернутого раздела', () => {
        const child = node('s2');
        const parent = node('s1', { children: [child] })
        const { controller } = setup({ expanded: ['s1', 's2']});

        controller.selectSection(child);
        controller.onCollapsed(parent);

        expect(controller.highlightedSectionId).toBeNull();
    });

    it('не трогает подсветку постороннего раздела', () => {
        const { controller } = setup({ expanded: ['s1', 's2']});

        controller.selectSection(node('s1'));
        controller.onCollapsed(node('s2'));

        expect(controller.highlightedSectionId).toBe('s1');
    });
});

describe('togglePin', () => {
    it('закрепляет: шлет PATCH с isPinned: true и перечитывает разделы', async () => {
        const { controller, deps, request } = setup();

        await controller.togglePin(node('s1', { isPinned: false }));

        expect(request).toHaveBeenCalledWith('/api/test-case-sections/s1/pin', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPinned: true })
        });

        expect(deps.reloadSections).toHaveBeenCalledTimes(1);
    });

    it('открепляет: шлет isPinned: false', async () => {
        const { controller, request } = setup();

        await controller.togglePin(node('s1', { isPinned: true }));
        
        expect(sentBody(request)).toEqual({ isPinned: false });
    });

    it('при ошибке сообщает onError и не перечитывает разделы', async () => {
        const { controller, deps, request } = setup();
        request.mockResolvedValueOnce(fail());

        await controller.togglePin(node('s1'));

        expect(deps.onError).toHaveBeenCalledWith('Не удалось изменить закрепление');
        expect(deps.reloadSections).not.toHaveBeenCalled();
    });
});

describe('createSection', () => {
    it('шлет POST с телом формы и перечитывает разделы', async () => {
        const { controller, deps, request } = setup();

        await controller.createSection({ name: 'Смоук', parentId: 's1' });

        expect(request).toHaveBeenCalledWith('/api/test-case-sections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Смоук', parentId: 's1' })
        });

        expect(deps.reloadSections).toHaveBeenCalledTimes(1);
    });

    it('пробрасывает сообщение сервера, а не прячет его в onError', async () => {
        const { controller, deps, request } = setup();
        request.mockResolvedValueOnce(fail('Такой раздел уже есть'))

        await expect(controller.createSection({ name: 'Смоук'})).rejects.toThrow('Такой раздел уже есть');

        expect(deps.onError).not.toHaveBeenCalled();
        expect(deps.reloadSections).not.toHaveBeenCalled();
    });

    it('при пустом теле ошибки подставляет текст по умолчанию', async () => {
        const { controller, request } = setup();
        request.mockResolvedValueOnce(fail());

        await expect(controller.createSection({ name: 'Смоук'})).rejects.toThrow('Не удалось создать раздел');
    });
});

describe('createTestCase', () => {
    const data = { title: 'Оплата картой' } as NewTestCaseInput;

    it('без подсветки: sectionId = null, перезагружается список вне разделов', async () => {
        const { controller, deps, request } = setup();

        await controller.createTestCase(data);

        expect(sentBody(request)).toEqual({ title: 'Оплата картой', sectionId: null });
        expect(deps.reloadRootCases).toHaveBeenCalledTimes(1);
        expect(deps.reloadSectionCases).not.toHaveBeenCalled();
    });

    it('с подсветкой: sectionId = id раздела, перезагружается именно этот раздел', async () => {
        const { controller, deps, request } = setup({ expanded: ['s1']});

        controller.selectSection(node('s1'));
        await controller.createTestCase(data);

        expect(sentBody(request)).toEqual({ title: 'Оплата картой', sectionId: 's1' });
        expect(deps.reloadSectionCases).toHaveBeenCalledWith('s1');
        expect(deps.reloadRootCases).not.toHaveBeenCalled();
    });

    it('обновляет тот раздел, куда ушел запрос, даже если подсветку сняли по дороге', async () => {
        const { controller, deps, request } = setup({ expanded: ['s1'] });
        request.mockImplementationOnce(async () => {
            controller.selectSection(node('s1'));
            return ok();
        });

        controller.selectSection(node('s1'));
        await controller.createTestCase(data);

        expect(deps.reloadSectionCases).toHaveBeenCalledWith('s1');
    });

    it('пробрасывает сообщение сервера', async () => {
        const { controller, deps, request } = setup();
        request.mockResolvedValueOnce(fail('Название обязательно'));

        await expect(controller.createTestCase(data)).rejects.toThrow('Название обязательно');

        expect(deps.reloadRootCases).not.toHaveBeenCalled();
    });
});

describe('tableRows', () => {
    it('без закрепленных и подсветки: разделы дерева, затем кейсы вне разделов', () => {
        const { controller } = setup({
            sections: [makeSection('s1')],
            rootCases: [makeCase('c1')]
        });

        expect(controller.tableRows.map((r) => r.id)).toEqual(['s:s1', 'c:c1']);
    });
});

describe('закреплённые и подсветка', () => {
    // a → b (закреплён); c — отдельный корневой раздел. Раздел a развёрнут, у него один кейс.
    const init: Init = {
        sections: [makeSection('a'), makeSection('b', 'b', 'a', true), makeSection('c')],
        expanded: ['a'],
        sectionCases: { a: [makeCase('a1')] }
    };

    it('закреплённый раздел идёт первым и не дублируется на старом месте', () => {
        const { controller } = setup(init);

        expect(controller.tableRows.map((r) => r.id)).toEqual(['s:b', 's:a', 'c:a1', 's:c']);
    });

    it('рамка охватывает раздел и его кейсы, но не закреплённого потомка', () => {
        const { controller } = setup(init);
        const rowOf = (id: string) => controller.tableRows.find((r) => r.id === id)!;

        controller.selectSection(node('a'));

        expect(controller.rowClass(rowOf('s:a'))).toBe('section-row in-group group-start');
        expect(controller.rowClass(rowOf('c:a1'))).toBe('in-group group-end');
        expect(controller.rowClass(rowOf('s:b'))).toBe('section-row');
        expect(controller.rowClass(rowOf('s:c'))).toBe('section-row');
    });

    it('у закреплённого раздела подпись — путь, у остальных подписи нет', () => {
        const { controller } = setup(init);

        expect(controller.labelOf(node('b', { isPinned: true }))).toBe('a / b');
        expect(controller.labelOf(node('c'))).toBeUndefined();
    });

    it('подпись подсказки — путь подсвеченного раздела', () => {
        const { controller } = setup(init);

        expect(controller.selectedPath).toBeNull();

        controller.selectSection(node('a'));

        expect(controller.selectedPath).toBe('a');
    });

    it('после снятия закрепления раздел возвращается на своё место', () => {
        const { controller, state } = setup(init);

        state.sections = [makeSection('a'), makeSection('b', 'b', 'a', false), makeSection('c')];

        expect(controller.tableRows.map((r) => r.id)).toEqual(['s:a', 'c:a1', 's:b', 's:c']);
    });
});