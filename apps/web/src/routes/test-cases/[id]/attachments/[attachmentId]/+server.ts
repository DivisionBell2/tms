import { gatewayFetch } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    const res = await gatewayFetch(
        `/test-cases/${params.id}/attachments/${params.attachmentId}`,
        { method: 'DELETE' },
        cookies
    );

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json({ ok: true });
};