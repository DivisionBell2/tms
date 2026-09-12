<script lang="ts" generics="T extends Record<string, string | undefined>">
    import type { Snippet } from "svelte";

	interface Column {
		key: keyof T & string;
		label: string;
		multiline?: boolean;
        
	}

	interface Props {
		columns: Column[];
		rows: T[];
		onChange: (rows: T[]) => void;
        onAdd: () => void;
        addLabel?: string;
        leading?: Snippet<[number]>;
        leadingLabel?: string;
        onRowDragOver?: (e: DragEvent) => void;
        onRowDrop?: (index: number, e: DragEvent) => void;
	}

	let {
        columns,
        rows,
        onChange,
        onAdd,
        addLabel = 'Добавить строку',
        leading,
        leadingLabel = '',
        onRowDragOver,
        onRowDrop,
    }: Props = $props();

	function updateCell(index: number, key: keyof T & string, value: string) {
		onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
	}

    function removeRow(index: number) {
        onChange(rows.filter((_, i) => i !== index));
    }

    function rowKey(row: T, index: number): string | number {
        const id = (row as Record<string, string | undefined>).id;
        return id || index;
    }
</script>

<div class="wrap">
	<table class="table">
		<thead>
			<tr>
                {#if leading}
                    <th class="col-leading">{leadingLabel}</th>
                {/if}
				{#each columns as col (col.key)}
					<th>{col.label}</th>
				{/each}
                <th class="col-actions" aria-label="Действия"></th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, index (rowKey(row, index))}
				<tr
                    ondragenter={onRowDragOver}
                    ondragover={onRowDragOver}
                    ondrop={onRowDrop ? (e) => onRowDrop(index, e) : undefined}
                >
                    {#if leading}
                        <td class="col-leading">{@render leading(index)}</td>
                    {/if}
					{#each columns as col (col.key)}
						<td>
							{#if col.multiline}
								<textarea
									rows="2"
									value={row[col.key] ?? ''}
									oninput={(e) => updateCell(index, col.key, e.currentTarget.value)}
								></textarea>
							{:else}
								<input
									type="text"
									value={row[col.key] ?? ''}
									oninput={(e) => updateCell(index, col.key, e.currentTarget.value)}
								/>
							{/if}
						</td>
					{/each}
                    <td class="col-actions">
                        <button
                            type="button"
                            class="icon-btn"
                            aria-label="Удаить строку"
                            onclick={() => removeRow(index)}
                        >
                            <span class="icon" aria-hidden="true">delete</span>
                        </button>
                    </td>
				</tr>
			{/each}
		</tbody>
	</table>
    <button type="button" class="add-btn" onclick={onAdd}>
        <span class="icon" aria-hidden="true">add</span>
        {addLabel}
    </button>
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		background: var(--surface);
		border-radius: var(--radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-1);
	}

    th,
    td {
        padding: var(--space-sm) var(--space-md);
		text-align: left;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
        vertical-align: top;
    }

	th {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

    input,
    textarea {
        width: 100%;
        box-sizing: border-box;
        font: inherit;
        color: var(--text);
        background: var(--bg);
        border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
        border-radius: var(--radius-sm);
        padding: var(--space-xs) var(--space-sm);
        resize: vartical;
    }

    .col-leading {
        width: 2.5rem;
        text-align: center;
    }

    .col-actions {
        width: 3rem;
        text-align: center;
    }

    .icon-btn,
    .add-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs);
        border: none;
        background: transparent;
        color: var(--text);
        cursor: pointer;
        font: inherit;
    }

    .icon-btn:hover {
        color: var(--danger);
    }

    .add-btn {
        align-self: flex-start;
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-sm);
        background: var(--accent);
        color: var(--on-accent);
        font-weight: 500;
    }
</style>
