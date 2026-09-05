import { gatewayFetch } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { TestCaseTaskDto, UpdateTestCaseTaskRequestDto } from "@tms/contracts"

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
    const body = (await request.json()) as Omit<UpdateTestCaseTaskRequestDto, 'id' | 'testCaseId'>;

    const res = await gatewayFetch(
        `/test-cases/${params.id}/tasks/${params.taskId}`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        },
        cookies
    );

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json((await res.json()) as TestCaseTaskDto);
}

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    const res = await gatewayFetch(
        `/test-cases/${params.id}/tasks/${params.taskId}`,
        { method: 'DELETE' },
        cookies,
    );

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json(await res.json());
}