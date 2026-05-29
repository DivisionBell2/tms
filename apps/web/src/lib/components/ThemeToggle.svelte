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

<button type=button class="btn-filled" onclick={cycle} aria-label={labels[mode]}>
    <span class="icon" aria-hidden="true">{themeIcon(mode)}</span>
</button>