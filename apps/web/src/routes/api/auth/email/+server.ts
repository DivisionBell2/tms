import { gatewayFetch } from "$lib/server/gateway";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import type { ChangeEmailRequesDto, UserPublicDto } from "@tms/contracts";

export const PATCH: RequestHandler = async ({ request, cookies }) => {
    const body = (await request.json()) as Omit<ChangeEmailRequesDto, 'userId'>;
    const res = await gatewayFetch(
        '/auth/me/email',
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        },
        cookies
    );

    if (!res.ok)
        return json(await res.json().catch(() => ({})), { status: res.status });

    return json((await res.json()) as UserPublicDto);
}