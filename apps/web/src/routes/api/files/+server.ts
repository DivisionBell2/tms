import { authHeaders, GATEWAY, gatewayFetch } from "$lib/server/gateway";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
    const form = await request.formData();
    const rest = await gatewayFetch('/files', { method: 'POST', body: form }, cookies);

    return new Response(await rest.text(), { status: rest.status, headers: {
        'Content-Type': 'application/json' 
    }});
}