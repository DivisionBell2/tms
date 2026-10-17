<script lang="ts">
    import type { SectionNode } from "$lib/test-cases/sections";

    interface Props {
        node: SectionNode;
        depth: number;
        colspan: number;
        expanded: boolean;
        loading?: boolean;
        onToggle: () => void;
    }

    let { node, depth, colspan, expanded, loading = false, onToggle }: Props = $props();

    function onKeydown(e: KeyboardEvent) {
        if (e.key !== 'Enter' && e.key !== ' ') return;

        e.preventDefault();
        onToggle();
    }
</script>

<td class="section-cell" {colspan}>
    <div
    class="section-inner"
    style={`--depth: ${depth}`}
    role="button"
    tabindex="0"
    aria-expanded={expanded}
    ondblclick={onToggle}
    onkeydown={onKeydown}
    >
        {#if loading}
        <span class="hint">загрузка...</span>
        {/if}
        <button
            type="button"
            class="chevron"
            class:open={expanded}
            aria-label={expanded ? 'Сввернуть раздел' : 'Развернуть раздел'}
            onclick={(e) => { e.stopPropagation(); onToggle(); }}
        >
            <span class="icon" aria-hidden="true">chevron_right</span>
        </button>
        <span class="icon folder" aria-hidden="true">folder</span>
        <span class="name">{node.name}</span>
    </div>
</td>

<style>
    .section-cell {
        background-color: color-mix(in srgb, var(--accent) 35%, var(--bg));
        white-space: normal;
    }

    .section-inner {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding-left: calc(var(--space-lg) * var(--depth));
        cursor: pointer;
        user-select: none;
    }

    .folder {
        color: var(--text-muted);
    }

    .name {
        font-weight: 600;
    }

    .chevron {
        display: inline-flex;
        padding: 0;
        border: none;
        background: none;
        color: var(--text);
        cursor: pointer;
        transition: transform 160ms ease;
    }

    .chevron.open {
        transform: rotate(90deg);
    }

    @media (prefers-reduced-motion: reduce) {
        .chevron {
            transition: none;
        }
    }

    .hint {
        color: var(--text-muted);
        font-size: 0.85rem;
        font-weight: 400;
    }
</style>