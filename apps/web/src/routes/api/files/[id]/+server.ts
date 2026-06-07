import { authHeaders, GATEWAY } from "$lib/server/gateway";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, cookies }) => {
    const res = await fetch(`${GATEWAY}/files/${params.id}`, {
        headers: authHeaders(cookies)
    });

    if (!res.ok) return new Response(null, { status: res.status });
    
    const blob = await res.blob();
    
    return new Response(blob, {
        headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream' }
    });
}