import type { TestCaseAttachmentDto } from "@tms/contracts";
import { describe, expect, it, vi } from "vitest";
import { createAttachementsController } from "./attachements-controller.svelte";

function makeAttachement(
    id: string,
    overrides: Partial<TestCaseAttachmentDto> = {}
): TestCaseAttachmentDto {
    return {
        id,
        testCaseId: 'tc1',
        fileId: `f-${id}`,
        filename: `${id}.png`,
        mime: 'image/png',
        size: 1024,
        createdAt: '2026-01-01T00:00:00.000Z',
        ...overrides
    }
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status })
}

function setup() {
    const request = vi.fn<typeof fetch>(async () => jsonResponse({ items: [] }));
    const controller = createAttachementsController({ getTestCaseId: () => 'tc1', request });

    return { controller, request }
}

describe('load', () => {
    it('просит у прокси список вложений нужного файла', async () => {
        const { controller, request } = setup();

        await controller.load();

        expect(request).toHaveBeenCalledWith('/api/test-cases/tc1/attachments');
    });

    it('кладет полученные вложения в items', async () => {
        const { controller, request } = setup();
        request.mockResolvedValueOnce(
            jsonResponse({ items: [makeAttachement('a1'), makeAttachement('a2')] })
        );

        await controller.load();

        expect(controller.items.map((i) => i.id)).toEqual(['a1', 'a2']);
    });

    it('при ошибке сервера пишет сообщение и оставляет items пустым', async () => {
        const { controller, request } = setup();
        request.mockResolvedValueOnce(jsonResponse({}, 500));

        await controller.load();

        expect(controller.error).toBe('Не удалось загрузить вложения');
        expect(controller.items).toEqual([]);
    });

    it('при обрыве сети не падает, а пишет ошибку', async () => {
        const { controller, request } = setup();
        request.mockRejectedValueOnce(new TypeError('fetch failed'));

        await controller.load();
        
        expect(controller.error).not.toBe('');
    })
});

describe('remove', () => {
    async function withItems() {
        const ctx = setup();
        ctx.request.mockResolvedValueOnce(
            jsonResponse({ items: [makeAttachement('a1'), makeAttachement('a2')] })
        );
        await ctx.controller.load();

        return ctx;
    }

    it('шлет DELETE на адрес вложения', async () => {
        const { controller, request } = await withItems();

        await controller.remove(controller.items[0]);

        expect(request).toHaveBeenCalledWith(`/api/test-cases/tc1/attachments/a1`, { method: 'DELETE' });
    });

    it('после успеха убирает вложение из списка', async () => {
        const { controller } = await withItems();

        await controller.remove(controller.items[0]!);

        expect(controller.items.map((i) => i.id)).toEqual(['a2']);
    });

    it('при ошибке оставляет список и показывает сообщение сервера', async () => {
        const { controller, request } = await withItems();
        request.mockResolvedValueOnce(jsonResponse({ message: 'Attachment not found' }, 404));

        await controller.remove(controller.items[0]!);

        expect(controller.items).toHaveLength(2);
        expect(controller.error).toBe('Attachment not found');
    });

    it('без сообщения от сервера пишет текст по умолчанию', async () => {
        const { controller, request } = await withItems();
        request.mockResolvedValueOnce(jsonResponse({}, 500));

        await controller.remove(controller.items[0]!);

        expect(controller.error).toBe('Не удалось удалить вложение');
    });

    it('при двойном вызове контроллера запрос вызвался только один раз', async () => {
        const { controller, request } = await withItems();

        const first = controller.remove(controller.items[0]!);
        const second = controller.remove(controller.items[0]!);

        await Promise.all([first, second]);

        const deleteCalls = request.mock.calls.filter(([, init]) => init?.method === 'DELETE');

        expect(deleteCalls).toEqual([
            [`/api/test-cases/tc1/attachments/a1`, { method: 'DELETE' }],
        ]);
    });
});