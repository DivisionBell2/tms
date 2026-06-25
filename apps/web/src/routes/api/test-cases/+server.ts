import { gatewayFetch } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { CreateTestCaseRequestDto, ListTestCasesResponseDto, TestCaseDto } from "@tms/contracts";

export const GET: RequestHandler = async ({ url, cookies }) => {
    const qs = url.search;
    const res = await gatewayFetch(`/test-cases{qs}`, {}, cookies);

    if (!res.ok) return json({ items: [], total: 0, page: 1, pageSize: 20 }, { status: res.status });

    return json((await res.json()) as ListTestCasesResponseDto);
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    const body = (await request.json()) as Omit<CreateTestCaseRequestDto, 'authorId'>;
    const res = await gatewayFetch(
        '/test-cases',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        },
        cookies
    );

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json((await res.json()) as TestCaseDto);
}