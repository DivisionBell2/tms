import { writable } from "svelte/store";

const STORAGE_KEY = 'tms-sidebar-open';

export const sidebarOpen = writable(true);

function persist(open: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, open ? 'open' : 'closed');
}

export function restoreSidebar(): void {
    if (typeof localStorage === 'undefined') return;
    sidebarOpen.set(localStorage.getItem(STORAGE_KEY) !== 'closed');
}

export function toggleSidebar(): void {
    sidebarOpen.update((open) => {
        persist(!open);
        return !open;
    })
}