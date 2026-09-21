import { gatewayFetch } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { TestCaseSectionDto } from "@tms/contracts";

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
    try {
        const body = (await request.json()) as { isPinned: boolean };
        const res = await gatewayFetch(
            `/test-case-sections/${params.id}/pin`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            },
            cookies
        );

        if (!res.ok) return json((await res.json().catch(() => ({})), { status: res.status}));

        return json((await res.json()) as TestCaseSectionDto);
    } catch {
        return json({ message: 'Сервис временно недоступен' }, { status: 503 });
    }
}