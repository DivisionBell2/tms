import { GATEWAY } from "$lib/server/gateway";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "../files/$types";

export const GET: RequestHandler = async () => {
    try {
        await fetch(`${GATEWAY}/auth/me`, {
            method: 'GET',
            headers: { Accept: 'application/json' }
        });

        return json({ ok: true });
    } catch {
        return json({ ok: false }, { status: 503 });
    }
}