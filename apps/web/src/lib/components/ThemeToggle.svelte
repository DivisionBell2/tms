<script lang="ts">
	import { applyTheme, getStoredTheme, nextTheme, setStoredTheme, themeIcon, type ThemeMode } from "$lib/theme";
	import { onMount } from "svelte";

    let mode = $state<ThemeMode>('system');

    onMount(() => {
        mode = getStoredTheme();
    });

    function cycle() {
        mode = nextTheme(mode);
        setStoredTheme(mode);
        applyTheme(mode);
    }

    const labels: Record<ThemeMode, string> = {
        system: 'Тема: как в системе',
        light: 'Тема: светлая',
        dark: 'Тема: темная'
    }
</script>

<button
    type="button"
    class="toggle"
    aria-label="Переключить тему"
    onclick={cycle}
>
    <span class="icon" aria-hidden="true">{themeIcon(mode)}</span>
</button>

<style>
    .toggle {
        display: inline-flex;
        padding: var(--space-sm);
        border: none;
        border-radius: var(--radius-md);
        background: var(--accent);
        color: var(--on-accent);
        cursor: pointer;
    }
</style>