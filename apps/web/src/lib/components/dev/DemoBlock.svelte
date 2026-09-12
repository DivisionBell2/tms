<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        title: string;
        snapshot?: unknown;
        snapshotLabel?: string;
        children: Snippet;
    }

    let {
        title,
        snapshot,
        snapshotLabel = 'Данные компонента прямо сейчас',
        children
    }: Props = $props();
</script>

<section class="block">
    <h2>{title}</h2>

    {@render children()}

    {#if snapshot !== undefined}
        <details open>
            <summary>{snapshotLabel}</summary>
            <pre>{JSON.stringify(snapshot, null, 2)}</pre>
        </details>
    {/if}
</section>

<style>
    .block {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        padding: var(--space-md);
        background: var(--surface);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-1);
    }

    h2 {
        margin: 0;
        font-size: 1.25rem;
    }

    summary {
        cursor: pointer;
        color: var(--text-muted);
    }

    pre {
        margin: var(--space-md) 0 0;
        padding: var(--space-sm);
        overflow-x: auto;
        background: (var-bg);
        border-radius: var(--radius-sm);
        fon-size: 0.8135rem;
    }
</style>