import type { Cookies } from "@sveltejs/kit";
import type { AuthResponseDto, AuthTokensDto } from "@tms/contracts";

const GATEWAY = process.env.GATEWAY_URL ?? 'http://localhost:3000';

export function authHeaders(cookies: Cookies): HeadersInit {
    const token = cookies.get('access_token');
    
    return token ? { Authorization: `Bearer ${token}`} : {}
}

export function setAuthCookies(cookies: Cookies, tokens: AuthTokensDto): void {
    cookies.set('access_token', tokens.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15
    });

    cookies.set('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    });
}

export function clearAuthCookies(cookies: Cookies): void {
    cookies.delete('access_token', { path: '/' });
    cookies.delete('refresh_token', { path: '/' });
}

async function tryRefresh(cookies: Cookies): Promise<boolean> {
    const refreshToken = cookies.get('refresh_token');

    if (!refreshToken) return false;

    const res = await fetch(`${GATEWAY}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) {
        clearAuthCookies(cookies);
        return false;
    }

    const data = (await res.json()) as AuthResponseDto;
    setAuthCookies(cookies, data.tokens);
    return true;
}

export async function gatewayFetch(
    path: string,
    init: RequestInit,
    cookies: Cookies
): Promise<Response> {
    const withAuth = (): RequestInit => ({
        ...init,
        headers: { ...(init.headers ?? {}), ...authHeaders(cookies) }
    });

    let res = await fetch(`${GATEWAY}${path}`, withAuth());

    if (res.status === 401 && cookies.get('refresh_token')) {
        const ok = await tryRefresh(cookies);

        if (ok) res = await fetch(`${GATEWAY}${path}`, withAuth());
    }

    return res;
}

export { GATEWAY }