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

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;

    const msg = err.message.toLowerCase();

    return (
        err.name === 'TypeError' ||
        msg.includes('fetch failed') ||
        msg.includes('econnrefused') ||
        msg.includes('econnreset') ||
        msg.includes('enotfound')
    );
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

    const maxAttempts = 3;
    let lastError: unknown;

    // три попытки одного запроса
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            let res = await fetch(`${GATEWAY}${path}`, withAuth());

            // при 401 ошибке обновление токена
            if (res.status === 401 && cookies.get('refresh_token')) {
                const ok = await tryRefresh(cookies);

                // если не ок, то цикл сделает новую попытку
                if (ok) res = await fetch(`${GATEWAY}${path}`, withAuth());
            }

            // при успешных запросах возвращается успешный ответ
            return res;
        } catch (err) {
            lastError = err;

            if (!isNetworkError(err) || attempt === maxAttempts) throw err;
            
            // каждая попытка увеличивает паузу, после количества попыток err назначается ошибкой, которая возвращается из функции
            await sleep(300 * attempt);
        }
    }

    // если это не проблема с сетью и не с жизнью access_token, ошибка уходит вверх
    throw lastError;
}

export { GATEWAY }