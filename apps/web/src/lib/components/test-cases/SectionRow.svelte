<script lang="ts">
    import type { SectionNode } from "$lib/test-cases/sections";

    interface Props {
        node: SectionNode;
        depth: number;
        colspan: number;
    }

    let { node, depth, colspan }: Props = $props();
</script>

<td class="section-cell" {colspan}>
    <div class="section-inner" style={`--depth: ${depth}`}>
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
    }

    .folder {
        color: var(--text-muted);
    }

    .name {
        font-weight: 600;
    }
</style>