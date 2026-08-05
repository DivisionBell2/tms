import type { UserPublicDto } from "@tms/contracts";
import type { LayoutServerLoad } from "./$types";
import { gatewayFetch } from "$lib/server/gateway";
import { error,redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ cookies, url }) => {
    let user: UserPublicDto | null = null;
    let backendDown = false;

    if (cookies.get('access_token') || cookies.get('refresh_token')) {
        try {
            const res = await gatewayFetch('/auth/me', {}, cookies);

            if (res.ok) user = await res.json() as UserPublicDto;
        } catch {
            // порт шлюза закрыт
            backendDown = true;

        }
        
    }

    const isPrivate = url.pathname.startsWith('/profile') || url.pathname.startsWith('/test-cases');

    // сперва проверяется бэкенд, если он доступен то потом проверяется авторизация
    // на публичных страницах это не нужно, потому что если бэкенд недоступен, то и авторизация не нужна
    if (backendDown && isPrivate) {
        // показываем страницу с ошибкой 503
        throw error(503, 'Сервер временно недоступен. Идет перезапуск...');
    }

    if (isPrivate && !user) {
        throw redirect(303, '/login');
    }

    return { user };
}