import { authHeaders, GATEWAY, gatewayFetch } from "$lib/server/gateway";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, cookies }) => {
    const res = await gatewayFetch(`/files/${params.id}`, {}, cookies);
    
    if (!res.ok) return new Response(null, { status: res.status });

    const blob = await res.blob();
    
    return new Response(blob, {
        headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream' }
    });
}

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    const res = await gatewayFetch(`/files/${params.id}`, { method: 'DELETE' }, cookies);

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json({ ok: true })
}