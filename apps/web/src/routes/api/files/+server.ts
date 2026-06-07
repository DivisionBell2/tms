import { authHeaders, GATEWAY } from "$lib/server/gateway";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
    const form = await request.formData();
    const rest = await fetch(`${GATEWAY}/files`, {
        method: 'POST',
        headers: authHeaders(cookies),
        body: form
    });

    return new Response(await rest.text(), { status: rest.status, headers: {
        'Content-Type': 'application/json' 
    }});
}