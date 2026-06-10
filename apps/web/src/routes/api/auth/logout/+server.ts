import { clearAuthCookies } from "$lib/server/gateway";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies }) => {
    clearAuthCookies(cookies);
    
    return json({ ok: true })
}