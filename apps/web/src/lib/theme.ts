export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'tms-theme';

export function getStoredTheme(): ThemeMode {
    if (typeof localStorage === 'undefined') return 'system';

    const value = localStorage.getItem(STORAGE_KEY);

    if (value === 'light' || value === 'dark' || value === 'system') return value;

    return 'system';
}

export function setStoredTheme(mode: ThemeMode): void {
    localStorage.setItem(STORAGE_KEY, mode);
}

export function applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;

    if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.dataset.theme = prefersDark ? 'dark' : 'light';
        root.dataset.themeMode = 'system';
        return;
    }

    root.dataset.theme = mode;
    root.dataset.themeMode = mode;
}

const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

export function nextTheme(current: ThemeMode): ThemeMode {
    const index = ORDER.indexOf(current);
    return ORDER[(index + 1) % ORDER.length] ?? 'system';
}

export function themeIcon(mode: ThemeMode): string {
    if (mode === 'dark') return 'dark_mode';
    if (mode === 'light') return 'light_mode';
    return 'contrast';
}