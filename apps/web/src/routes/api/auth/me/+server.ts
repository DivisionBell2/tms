import { authHeaders, GATEWAY } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { UpdateProfileRequestDto, UserPublicDto } from "@tms/contracts";

export const GET: RequestHandler = async ({ cookies }) => {
    const token = cookies.get('access_token');

    if (!token) return json(null);

    const res = await fetch(`${GATEWAY}/auth/me`, {
        headers: {...authHeaders(cookies), 'Content-Type': 'application/json' }
    });

    if (!res.ok) return json(null, { status: res.status });

    return json((await res.json()) as UserPublicDto);
}

export const PATCH: RequestHandler = async ({ request, cookies }) => {
    const body = (await request.json()) as Omit<UpdateProfileRequestDto, 'userId'>;
    const res = await fetch(`${GATEWAY}/auth/me`, {
        method: 'PATCH',
        headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json((await res.json()) as UserPublicDto);
}