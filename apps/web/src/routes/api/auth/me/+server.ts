import { authHeaders, GATEWAY, gatewayFetch } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { UpdateProfileRequestDto, UserPublicDto } from "@tms/contracts";

export const GET: RequestHandler = async ({ cookies }) => {
    const token = cookies.get('access_token');

    if (!token) return json(null);

    const res = await gatewayFetch('/auth/me', {}, cookies);

    if (!res.ok) return json(null, { status: res.status });

    return json((await res.json()) as UserPublicDto);
}

export const PATCH: RequestHandler = async ({ request, cookies }) => {
    const body = (await request.json()) as Omit<UpdateProfileRequestDto, 'userId'>;
    const res = await gatewayFetch(
        '/auth/me',
        {
            method: 'PATCH',
            headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        },
        cookies
    );

    if (!res.ok) return json(await res.json().catch(() => ({})), { status: res.status });

    return json((await res.json()) as UserPublicDto);
}