import { gatewayFetch } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { TestCaseDetailDto, UpdateTestCaseRequestDto } from "@tms/contracts";

export const GET: RequestHandler = async ({ params, cookies }) => {
    const res = await gatewayFetch(`/test-cases/${params.id}`, {}, cookies)
    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json((await res.json()) as TestCaseDetailDto);
}

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
    const body = (await request.json()) as Omit<UpdateTestCaseRequestDto, 'id'>;
    const res = await gatewayFetch(
        `/test-cases/${params.id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json' },
                body: JSON.stringify(body)
        },
        cookies
    );

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json((await res.json()) as TestCaseDetailDto);
}

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    const res = await gatewayFetch(
        `/test-cases/${params.id}`,
        { method: 'DELETE' },
        cookies
    );

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json(await res.json());
}