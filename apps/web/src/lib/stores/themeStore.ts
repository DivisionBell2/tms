import { getStoredTheme, type ThemeMode } from "$lib/theme";
import { writable } from "svelte/store";

export const themeMode = writable<ThemeMode>(
    typeof localStorage === 'undefined' ? 'system' : getStoredTheme()
);