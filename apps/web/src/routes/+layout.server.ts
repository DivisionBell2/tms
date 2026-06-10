import type { UserPublicDto } from "@tms/contracts";
import type { LayoutServerLoad } from "./$types";
import { authHeaders, GATEWAY, gatewayFetch } from "$lib/server/gateway";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ cookies, url }) => {
    let user: UserPublicDto | null = null;

    if (cookies.get('access_token') || cookies.get('refresh_token')) {
        const res = await gatewayFetch('/auth/me', {}, cookies);

        if (res.ok) user = await res.json() as UserPublicDto;
    }

    const isPrivate = url.pathname.startsWith('/profile');

    if (isPrivate && !user) {
        throw redirect(303, '/login');
    }

    return { user };
}