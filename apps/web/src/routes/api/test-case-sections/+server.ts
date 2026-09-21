import { gatewayFetch } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { CreateTestCaseSectionRequestDto, ListTestCaseSectionsResponseDto, TestCaseSectionDto } from "@tms/contracts";

export const GET: RequestHandler = async ({ url, cookies }) => {
    try {
        const qs = url.search;
        const res = await gatewayFetch(`/test-case-sections${qs}`, {}, cookies);

        if (!res.ok) return json({items: [] }, { status: res.status });

        return json((await res.json()) as ListTestCaseSectionsResponseDto);
    } catch {
        return json({ message: 'Сервис временно недоступен' }, { status: 503 });
    }
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const body = (await request.json()) as CreateTestCaseSectionRequestDto;
        const res = await gatewayFetch(
            '/test-case-sections',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            },
            cookies
        );

        if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

        return json((await res.json()) as TestCaseSectionDto);
    } catch {
        return json({ message: 'Сервис временно недоступен' }, { status: 503 });
    }
}