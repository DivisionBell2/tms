import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { uploadFile } from "./upload";

class FakeXhr {
    static last: FakeXhr;

    method = '';
    url = '';
    body: unknown = null;
    upload: { onprogress: ((e: ProgressEvent) => void) | null } = { onprogress: null };
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    status = 0;
    responseText = '';
    timeout = 0;
    ontimeout: (() => void) | null = null;

    constructor() {
        FakeXhr.last = this;
    }

    open(method: string, url: string) {
        this.method = method;
        this.url = url;
    }

    send(body: unknown) {
        this.body = body;
    }

    progress(loaded: number, total: number, lengthComputable = true) {
        this.upload.onprogress?.({ loaded, total, lengthComputable } as ProgressEvent)
    }

    finish(status: number, responseText: string) {
        this.status = status;
        this.responseText = responseText;
        this.onload?.();
    }
}

const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

beforeEach(() => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('uploadFile: запрос', () => {
    it('шлет POST на нужный адрес с файлом в поле file', () => {
        void uploadFile('/api/x', file, () => {} );

        expect(FakeXhr.last.method).toBe('POST');
        expect(FakeXhr.last.url).toBe('/api/x');
        expect(FakeXhr.last.url).toBe('/api/x');
        expect((FakeXhr.last.body as FormData).get('file')).toBe(file);
    });
});

describe('uploadFile: прогресс', () => {
    it('переводит loaded/total в проценты', () => {
        const onProgress = vi.fn();
        void uploadFile('/api/x', file, onProgress);

        FakeXhr.last.progress(1, 4);
        FakeXhr.last.progress(2, 3);

        expect(onProgress).toHaveBeenCalledWith(25);
        expect(onProgress).toHaveBeenCalledWith(67);
    });

    it('молчит, если браузер не знает общий размер', () => {
        const onProgress = vi.fn();
        void uploadFile('/api/x', file, onProgress);

        FakeXhr.last.progress(10, 0, false);

        expect(onProgress).not.toHaveBeenCalled();
    });
});

describe('uploadFile: ответ', () => {
    it('возвращает статус и разобранный JSON', async () => {
        const promise = uploadFile('/api/x', file, () => {});

        FakeXhr.last.finish(201, '{"id": "a1"}');

        await expect(promise).resolves.toEqual({ status: 201, body: { id: 'a1' } });
    });

    it('не падает, если сервер вернул не JSON', async () => {
        const promise = uploadFile('/api/x', file, () => {});

        FakeXhr.last.finish(502, '<html>Bad gateway</html>');

        await expect(promise).resolves.toEqual({ status: 502, body: {} });
    });

    it('отклоняет промис при обрыве сети', async () => {
        const promise = uploadFile('/api/x', file, () => {});

        FakeXhr.last.onerror?.();
        
        await expect(promise).rejects.toThrow('Нет связи с сервером');
    });

    it('отклоняет промис при таймауте', async () => {
        const promise = uploadFile('/api/x', file, () => {});

        FakeXhr.last.ontimeout?.();

        await expect(promise).rejects.toThrow('Сервер не ответил вовремя');
        await expect(FakeXhr.last.timeout).toBe(60_000);
    });
});