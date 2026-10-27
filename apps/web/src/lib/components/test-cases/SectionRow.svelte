<script lang="ts">
    import type { SectionNode } from "$lib/test-cases/sections";

    interface Props {
        node: SectionNode;
        depth: number;
        colspan: number;
        expanded: boolean;
        loading?: boolean;
        label?: string;
        selected?: boolean;
        onToggle: () => void;
        onSelect: () => void;
        onTogglePin: () => void;
    }

    let {
        node,
        depth,
        colspan,
        expanded,
        loading = false,
        label,
        selected = false,
        onToggle,
        onSelect,
        onTogglePin
    }: Props = $props();

    const CLICK_DELAY_MS = 250;

    let clickTimer: ReturnType<typeof setTimeout> | null = null;

    function cancelPendingClick() {
        if (!clickTimer) return;

        clearTimeout(clickTimer);
        clickTimer = null;
    }

    function onClick() {
        cancelPendingClick();

        clickTimer = setTimeout(() => {
            clickTimer = null;
            onSelect();
        }, CLICK_DELAY_MS);
    }

    function onDblClick() {
        cancelPendingClick();
        onToggle();
    }

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
    aria-selected={selected}
    onclick={onClick}
    ondblclick={onDblClick}
    onkeydown={onKeydown}
    >
        <button
            type="button"
            class="chevron"
            class:open={expanded}
            aria-label={expanded ? 'Свернуть раздел' : 'Развернуть раздел'}
            onclick={(e) => { e.stopPropagation(); onToggle(); }}
        >
            <span class="icon" aria-hidden="true">chevron_right</span>
        </button>

        <span class="icon folder" aria-hidden="true">{expanded ? 'folder_open': 'folder'}</span>
        <span class="name">{label || node.name}</span>

        {#if loading}
        <span class="hint">загрузка...</span>
        {/if}
        <button
            type="button"
            class="pin"
            class:active={node.isPinned}
            aria-label={node.isPinned ? 'Открепить раздел' : 'Закрепить раздел'}
            aria-pressed={node.isPinned}
            onclick={(e) => { e.stopPropagation(); onTogglePin(); }}
        >
            <span class="icon" aria-hidden="true">{node.isPinned ? 'keep' : 'keep_off'}</span>
        </button>
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

    .hint {
        color: var(--text-muted);
        font-size: 0.85rem;
        font-weight: 400;
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

    .pin {
        margin-left: auto;
        display: inline-flex;
        padding: var(--space-xs);
        border: none;
        border-radius: var(--radius-sm);
        background: none;
        color: var(--text-muted);
        cursor: pointer;
    }

    .pin.active {
        color: var(--info);
    }

    .pin:hover {
        background: color-mix(in srgb, var(--accent) 60%, var(--bg));
    }

    @media (prefers-reduced-motion: reduce) {
        .chevron {
            transition: none;
        }
    }
</style>