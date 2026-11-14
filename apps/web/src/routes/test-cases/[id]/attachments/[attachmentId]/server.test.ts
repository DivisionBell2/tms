import { gatewayFetch } from "$lib/server/gateway";
import { beforeEach } from "node:test";
import { describe, expect, it, vi } from "vitest";
import { DELETE } from "./+server";
import { POST } from "../+server";

vi.mock('$lib/server/gateway', () => ({ gatewayFetch: vi.fn() }));

const gateway = vi.mocked(gatewayFetch);
const cookies = {} as never;
const event = { params: { id: 'tc1', attachmentId: 'a1' }, cookies } as never;

beforeEach(() => {
    gateway.mockReset();
});

describe('DELETE /api/test-cases/[id]/attachments/[attachmentId]', () => {
    it('шлет DELETE в gateway на адрес вложения', async () => {
        gateway.mockResolvedValueOnce(new Response('{"ok":true}'));

        await DELETE(event);

        expect(gateway).toHaveBeenCalledWith(
            '/test-cases/tc1/attachments/a1',
            { method: 'DELETE' },
            cookies
        );
    });

    it('при успехе отвечает { ok: true }', async () => {
        gateway.mockResolvedValueOnce(new Response('{"ok":true}'));

        const res = await DELETE(event);

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true });
    });

    it('при ошибке отдает тело и статус gateway', async () => {
        gateway.mockResolvedValueOnce(new Response('{"message":"Attachment not found"}', { status: 404 }));

        const res = await DELETE(event);

        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({ message: 'Attachment not found' });
    });

    it('если тело ошибки не JSON, отдает пустой объект', async () => {
        gateway.mockResolvedValueOnce(new Response('oops', { status: 502 }));

        const res = await DELETE(event);

        expect(res.status).toBe(502);
        expect(await res.json()).toEqual({});
    });
});