import { gatewayFetch } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { CreateTestCaseTaskRequestDto, ListTestCaseTasksResponseDto, TestCaseTaskDto } from "@tms/contracts";

export const GET: RequestHandler = async ({ params, cookies }) => {
    const res = await gatewayFetch(`/test-cases/${params.id}/tasks`, {}, cookies);
    
    if (!res.ok) return json({ items: [] }, { status: res.status });

    return json((await res.json()) as ListTestCaseTasksResponseDto);
};

export const POST: RequestHandler = async ({ params, request, cookies }) => {
    const body = (await request.json()) as Omit<CreateTestCaseTaskRequestDto, 'testCaseId'>;
    const res = await gatewayFetch(`/test-cases/${params.id}/tasks`,
        {method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        },
        cookies
    );

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json((await res.json()) as TestCaseTaskDto);
}