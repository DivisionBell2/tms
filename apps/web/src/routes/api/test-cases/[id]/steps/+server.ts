import type { TestCaseStepDto, UpsertTestCaseStepItemDto } from "@tms/contracts"
import { gatewayFetch } from "$lib/server/gateway";
import {json, type RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
    const body = (await request.json()) as { steps: UpsertTestCaseStepItemDto[] };
    const res = await gatewayFetch(
        `/test-cases/${params.id}/steps`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        },
        cookies
    );

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json((await res.json()) as TestCaseStepDto[]);
}