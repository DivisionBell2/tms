import { gatewayFetch } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { ListTestCaseAttachmentsResponseDto } from "@tms/contracts";

export const GET: RequestHandler = async ({ params, cookies }) => {
    const res =await gatewayFetch(`/test-cases/${params.id}/attachments`, {}, cookies);

    if (!res.ok) return json({ items: [] }, { status: res.status });

    return json((await res.json()) as ListTestCaseAttachmentsResponseDto);
};

export const POST: RequestHandler = async ({ params, request, cookies }) => {
    const form = await request.formData();

    if (!form.has('file')) return json({ message: 'File is required' }, { status: 400 });

    const res = await gatewayFetch(
        `/test-cases/${params.id}/attachments`,
        { method: 'POST', body: form },
        cookies
    );

    return new Response(await res.text(), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
    });
};