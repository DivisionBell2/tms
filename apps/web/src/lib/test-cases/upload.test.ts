import { afterEach } from "node:test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadFile } from "./upload";

class FakeXhr {
    static last: FakeXhr;

    method = '';
    url = '';
    body: unknown = null;
    upload: { onprogress: ((e: ProgressEvent) => void) | null } = { onprogress: null };
    onload: (() => void) | null = null;
    status = 0;
    responseText = '';

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