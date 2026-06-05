import { authHeaders, GATEWAY } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { UserPublicDto } from "@tms/contracts";

export const GET: RequestHandler = async ({ cookies }) => {
    const token = cookies.get('access_token');

    if (!token) return json(null);

    const res = await fetch(`${GATEWAY}/auth/me`, {
        headers: {...authHeaders(cookies), 'Content-Type': 'application/json' }
    });

    if (!res.ok) return json(null, { status: res.status });

    return json((await res.json()) as UserPublicDto);
}