import type { UserPublicDto } from "@tms/contracts";
import type { LayoutServerLoad } from "./$types";
import { authHeaders, GATEWAY } from "$lib/server/gateway";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ cookies, url }) => {
    let user: UserPublicDto | null = null;

    if (cookies.get('access_token')) {
        const res = await fetch(`${GATEWAY}/auth/me`, { headers: authHeaders(cookies)});

        if (res.ok) user = await res.json();
    }

    const isPrivate = url.pathname.startsWith('/profile');

    if (isPrivate && !user) {
        throw redirect(302, '/login');
    }

    return { user };
}