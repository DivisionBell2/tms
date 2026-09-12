<script lang="ts">
	import { page } from '$app/state';
    import type { Snippet } from 'svelte';

    let { children } = $props();
</script>

<div class="sandbox">
    <header class="sandbox-head">
        <p class="badge">
            <span class="icon" aria-hidden="true">construction</span>
            Песочница компонентов - данные фиктивные, запросов к API нет
        </p>

        {#if page.url.pathname !== '/dev'}
            <a class="back" href="/dev">
                <span class="icon" aria-hidden="true">arrow_back</span>
                Все песочницы
            </a>
        {/if}
    </header>

    {@render children()}
</div>

<style>
    .sandbox {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }

    .sandbox-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-lg);
    }

    .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        margin: 0;
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        color: var(--text-muted);
        font-size: 0.875rem;
    }

    .back {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        color: var(--text);
        text-decoration: none;
        font-weight: 500;
    }
</style>