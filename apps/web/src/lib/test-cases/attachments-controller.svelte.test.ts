import type { TestCaseAttachmentDto } from "@tms/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAttachementsController } from "./attachments-controller.svelte";
import type { UploadResult } from "./upload";
import { validateFile } from "./attachments";

vi.mock('./attachments', () => ({ validateFile: vi.fn(() => null) }));

function makeAttachment(
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

function makeFile(name = 'a.png'): File {
    return new File(['x'], name, { type: 'image/png' });
}

function setup() {
    const request = vi.fn<typeof fetch>(async () => jsonResponse({ items: [] }));
    const upload = vi.fn<(url: string, file: File, onProgress: (p: number) => void) => Promise<UploadResult>>(
        async () => ({ status: 201, body: makeAttachment('new') })
    )
    const controller = createAttachementsController({ getTestCaseId: () => 'tc1', request, upload });

    return { controller, request, upload }
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
            jsonResponse({ items: [makeAttachment('a1'), makeAttachment('a2')] })
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
            jsonResponse({ items: [makeAttachment('a1'), makeAttachment('a2')] })
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

describe('upload', () => {

    beforeEach(() => {
        vi.mocked(validateFile).mockReset();
        vi.mocked(validateFile).mockReturnValue(null);
    });

    it('отправляет файл на адрес вложений кейса', async () => {
        const { controller, upload } = setup();
        const file = makeFile();

        await controller.upload([file]);

        expect(upload).toHaveBeenCalledWith('/api/test-cases/tc1/attachments', file, expect.any(Function));
    });

    it('после успеха добавляет вложение в конец списка', async () => {
        const { controller } = setup();

        await controller.upload([makeFile()]);

        expect(controller.items.map((i) => i.id)).toEqual(['new']);
    });

    it('пока файл уходит, показывает его в uploads с прогрессом', async () => {
        const { controller, upload } = setup();
        let report: (p: number) => void = () => {};
        let finish: (r: UploadResult) => void = () => {};

        upload.mockImplementation((_url, _file, onProgress) => {
            report = onProgress;

            return new Promise((resolve) => {
                finish = resolve;
            });
        });

        const pending = controller.upload([makeFile('big.png')]);

        expect(controller.uploads).toEqual([{ key: 'u1', name: 'big.png', progress: 0 }]);

        report(40);
        expect(controller.uploads[0]?.progress).toBe(40);

        finish({ status: 201, body: makeAttachment('new')});
        await pending;

        expect(controller.uploads).toEqual([]);
    });

    it('грузит несколько файлов по очереди', async () => {
        const { controller, upload } = setup();
        const order: string[] = [];

        upload.mockImplementation(async (_url, file) => {
            order.push(file.name);

            return { status: 201, body: makeAttachment(file.name) };
        });

        await controller.upload([makeFile('one.png'), makeFile('two.png')]);

        expect(order).toEqual(['one.png', 'two.png']);
        expect(controller.items).toHaveLength(2);
    });

    it('не отправляет файл, который не прошел проверку, и пишет почему', async () => {
        const { controller, upload } = setup();
        vi.mocked(validateFile).mockReturnValueOnce('Файл "empty.png" пустой');

        await controller.upload([makeFile('empty.png')]);

        expect(upload).not.toHaveBeenCalled();
        expect(controller.error).toBe('Файл "empty.png" пустой');
    });

    it('плохой файл не мешает хорошему', async () => {
        const { controller, upload } = setup();
        vi.mocked(validateFile).mockReturnValueOnce('Файл "empty.png" пустой');

        await controller.upload([makeFile('empty.png'), makeFile('ok.png')]);

        expect(upload).toHaveBeenCalledTimes(1);
        expect(controller.items).toHaveLength(1);
    });

    it('при обрыве сети очищает очередь и показывает ошибку', async () => {
        const { controller, upload } = setup();
        upload.mockRejectedValueOnce(new Error('Нет связи с сервером'));

        await controller.upload([makeFile()]);

        expect(controller.error).toBe('Нет связи с сервером');
        expect(controller.uploads).toEqual([]);
    });

    it('показывает сообщение сервера, если загрузка отклонена', async () => {
        const { controller, upload } = setup();
        upload.mockResolvedValueOnce({ status: 400, body: { message: 'File is required' }});

        await controller.upload([makeFile()]);

        expect(controller.error).toBe('File is required');
        expect(controller.items).toEqual([]);
        expect(controller.uploads).toEqual([]);
    });

    it('без сообщения от сервера называет файл в ошибке', async () => {
        const { controller, upload } = setup();
        upload.mockResolvedValueOnce({ status: 500, body: {} });

        await controller.upload([makeFile('a.png')]);

        expect(controller.error).toBe('Не удалось загрузить "a.png"');
    });

    it('новая загрузка стирает старую ошибку', async () => {
        const { controller } = setup();
        vi.mocked(validateFile).mockReturnValueOnce('Файл "a.png" пустой');

        await controller.upload([makeFile('a.png')]);

        expect(controller.error).not.toBe('');

        await controller.upload([makeFile('a.png')]);

        expect(controller.error).toBe('');
    });

    it('показывает сообщение сервера, если файл слишком большой', async () => {
        const { controller, upload } = setup();
        upload.mockResolvedValueOnce({ status: 413, body: { message: 'File too large' }});

        await controller.upload([makeFile('huge.png')]);

        expect(controller.error).toBe('Файл "huge.png" больше 5 МБ');
        expect(controller.items).toEqual([]);
        expect(controller.uploads).toEqual([]);
    });
});