<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

    interface Column {
        key: string;
        label: string;
        sortable?: boolean;
    }

    interface Props {
        columns: Column[];
        rows: T[];

        sortKey?: string;
        order?: 'asc' | 'desc';
        onSort?: (key: string) => void;

        page: number;
        pageSize: number;
        total: number;
        onPageChange?: (page: number) => void;

        row: Snippet<[T]>;

        empty?: Snippet;
        filterRow?: Snippet;
    }

    let {
        columns,
        rows,
        sortKey,
        order = 'desc',
        onSort,
        page,
        pageSize,
        total,
        onPageChange,
        row,
        empty,
        filterRow
    }: Props = $props();

    let pageCount = $derived(Math.max(1, Math.ceil(total / pageSize)));

    function headerClick(col: Column) {
        if (col.sortable && onSort) onSort(col.key);
    }

    function sortIcon(col: Column) {
        if (!col.sortable) return '';
        if (sortKey !== col.key) return 'unfold_more';

        return order === 'asc' ? 'arrow_upward' : 'arrow_downward';
    }

</script>

<div class="table-wrap">
    <table class="table">
        <thead>
            <tr>
                {#each columns as col (col.key)}
                    <th
                        class:sortable={col.sortable}
                        onclick={() => headerClick(col)}
                    >
                        <span class="th-inner">
                            {col.label}
                            {#if col.sortable}
                                <span class="icon sort-icon" aria-hidden="true">{sortIcon(col)}</span>
                            {/if}
                        </span>
                    </th>
                {/each}
            </tr>
            {#if filterRow}
                <tr class="filter-row">
                    {@render filterRow()}
                </tr>
            {/if}
        </thead>
        <tbody>
            {#if rows.length === 0}
                <tr>
                    <td class="empty" colspan={columns.length}>
                        {#if empty}{@render empty()}{:else}Нет данных{/if}
                    </td>
                </tr>
            {:else}
                {#each rows as item, i (i)}
                    <tr>
                        {@render row(item)}
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>

<div class="pager">
    <button
        type="button"
        onclick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
        class="page-btn"
    >
        <span class="icon" aria-hidden="true">chevron_left</span>
    </button>
    <span class="page-info">Стр. {page} из {pageCount}</span>

    <button
        type="button"
        onclick={() => onPageChange?.(page + 1)}
        disabled={page >= pageCount}
        class="page-btn"
    >
        <span class="icon" aria-hidden="true">chevron_right</span>
    </button>
</div>

<style>
    .table-wrap {
        overflow-x: auto;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-1);
        background: var(--surface);
    }

    .table {
        width: 100%;
        border-collapse: collapse;
    }

    .table :global(th),
    .table :global(td) {
        min-width: 200px;
        padding: var(--space-sm) var(--space-md);
        text-align: left;
        border-bottom: 1px solid var(--accent);
        white-space: nowrap;
        vertical-align: center;
    }

    .table :global(th:first-child),
    .table :global(td:first-child) {
        width: 50%;
        min-width: 500px;
        white-space: normal;
        overflow-wrap: anywhere;
        line-height: 1.5;
    }

    .table th {
        font-weight: 600;
        color: var(--text);
        user-select: none;
    }

    .table th.sortable {
        cursor: pointer;
    }

    .th-inner {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
    }

    .sort-icon {
        font-size: 1rem;
        color: var(--text-muted);
    }

    .empty {
        text-align: center;
        color: var(--text-muted);
        padding: var(--space-lg);
    }

    .pager {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        margin-top: var(--space-md);
    }

    .page-btn {
        display: inline-flex;
        padding: var(--space-xs);
        border: none;
        border-radius: var(--radius-sm);
        background: var(--accent);
        color: var(--on-accent);
        cursor: pointer;
    }

    .page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-info {
        color: var(--text-muted);
    }

    .filter-row :global(th) {
        padding-top: var(--space-xs);
        padding-bottom: var(--space-sm);
        font-weight: 400;
        vertical-align: center;
    }

    .filter-row :global(input),
    .filter-row :global(select) {
        width: 100%;
        box-sizing: border-box;
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid var(--accent);
        border-radius: var(--radius-sm);
        background: var(--bg);
        color: var(--text);
        font: inherit;
    }

    .table :global(td) {
        white-space: nowrap;
        overflow: anywhere;
        vertical-align: center;
    }
</style>