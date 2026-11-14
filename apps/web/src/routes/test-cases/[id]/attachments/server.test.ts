import { gatewayFetch } from "$lib/server/gateway";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./+server";

vi.mock('$lib/server/gateway', () => ({ gatewayFetch: vi.fn() }));

const gateway = vi.mocked(gatewayFetch);
const cookies = {} as never;

function reply(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
    gateway.mockReset();
});

describe('GET /api/test-cases/[id]/attachments', () => {
    it('просит у gateway список вложений этого кейса', async () => {
        gateway.mockResolvedValueOnce(reply({ items: [] }));

        await GET({ params: { id: 'tc1' }, cookies } as never);

        expect(gateway).toHaveBeenCalledWith('/test-cases/tc1/attachments', {}, cookies);
    });

    it('отдает список как есть', async () => {
        gateway.mockResolvedValueOnce(reply({ items: [{ id: 'a1' }]}));

        const res = await GET({ params: { id: 'tc1' }, cookies } as never);

        expect(await res.json()).toEqual({ items: [{ id: 'a1' }] });
    });

    it('при ошибке gateway отдает пустой список и тот же статус', async () => {
        gateway.mockResolvedValueOnce(reply({}, 404));

        const res = await GET({ params: { id: 'tc1' }, cookies } as never);

        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({ items: [] });
    });
});

describe('POST /api/test-cases/[id]/attachments', () => {
    const form = new FormData();
    form.append('file', new File(['x'], 'a.txt'));
    const event = { params: { id: 'tc1' }, request: { formData: async () => form }, cookies };

    it('пересылает форму в gateway методом POST', async () => {
        gateway.mockResolvedValueOnce(reply({ id: 'a1' }, 201));

        await POST(event as never);

        expect(gateway).toHaveBeenCalledWith(
            '/test-cases/tc1/attachments',
            { method: 'POST', body: form },
            cookies
        );
    });

    it('возвращает ответ gateway вместе со статусом', async () => {
        gateway.mockResolvedValueOnce(reply({ id: 'a1' }, 201));

        const res = await POST(event as never);

        expect(res.status).toBe(201);
        expect(await res.json()).toEqual({ id: 'a1' });
    });

    it('не прячет ошибку: 413 и текст доходят до браузера', async () => {
        gateway.mockResolvedValueOnce(reply({ message: 'File too large' }, 413));

        const res = await POST(event as never);

        expect(res.status).toBe(413);
        expect(await res.json()).toEqual({ message: 'File too large' });
    });

    it('если в форме нет поля file, не идет в шлюз', async () => {
        const form = new FormData();
        const event = { params: { id: 'tc1' }, request: { formData: async () => form } as never, cookies };
        const res = await POST(event as never);
        
        expect(gateway).not.toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ message: 'File is required' });
    });
});