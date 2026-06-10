import type { RequestHandler } from "@sveltejs/kit";
import type { AuthResponseDto, LoginRequestDto } from "@tms/contracts";
import { json } from "@sveltejs/kit";
import { setAuthCookies } from "$lib/server/gateway";

const GATEWAY = process.env.GATEWAY_URL ?? 'http://localhost:3000';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const body = (await request.json()) as LoginRequestDto;

    const res = await fetch(`${GATEWAY}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return json(err, { status: res.status })
    }

    const data = (await res.json()) as AuthResponseDto;

    setAuthCookies(cookies, data.tokens);

    return json({ user: data.user });
}