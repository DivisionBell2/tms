import type { Cookies } from "@sveltejs/kit";

const GATEWAY = process.env.GATEWAY_URL ?? 'http://localhost:3000';

export function authHeaders(cookies: Cookies): HeadersInit {
    const token = cookies.get('access_token');
    
    return token ? { Authorization: `Bearer ${token}`} : {}
}

export { GATEWAY }