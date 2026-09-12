<script lang="ts">
	import InlineEditTable from "./InlineEditTable.svelte";

    export type StepRow = {
        id?: string;
        action: string;
        expectedResult: string;
    }

    interface Props {
        steps: StepRow[];
        onChange: (steps: StepRow[]) => void;
    }

    let { steps, onChange }: Props = $props();

    const columns = [
        { key: 'action' as const, label: 'Действие', multiline: true },
        { 
            key: 'expectedResult' as const,
            label: 'Ожидаемый результат',
            multiline: true
        }
    ];

    function onAdd() {
        onChange([...steps, { id: crypto.randomUUID(), action: '', expectedResult: '' }]);
    }

    let dragFrom = $state<number | null>(null);

    function onDragStart(index: number, e: DragEvent) {
        dragFrom = index;
        e.dataTransfer?.setData('text/plain', String(index));

        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    }

    function onDragOver(e: DragEvent) {
        e.preventDefault();

        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    }

    function onDrop(toIndex: number, e: DragEvent) {
        e.preventDefault();
        const from = dragFrom ?? Number(e.dataTransfer?.getData('text/plain') ?? NaN);
        dragFrom = null;

        if (Number.isNaN(from) || from === toIndex) return;

        const next = [...steps];
        const [moved] = next.splice(from, 1);

        if (!moved) return;

        next.splice(toIndex, 0, moved);
        onChange(next);
    }

    function onDragEnd() {
        dragFrom = null;
    }
    
</script>

<section class="steps">
    <header class="head">
        <h2>
            <span class="icon" aria-hidden="true">format_list_numbered</span>
            Шаги воспроизведения
        </h2>
    </header>
    <InlineEditTable
        {columns}
        rows={steps}
        {onChange}
        {onAdd}
        addLabel="Добавить шаг"
        leadingLabel=""
        onRowDragOver={onDragOver}
        onRowDrop={onDrop}
    >
        {#snippet leading(index)}
            <div
                role="button"
                tabindex="0"
                class="drag-handle"
                draggable="true"
                aria-label="Перетащить шаг"
                ondragstart={(e) => onDragStart(index, e)}
                ondragend={onDragEnd}
            >
                <span class="icon" aria-hidden="true">drag_indicator</span>
            </div>
        {/snippet}
    </InlineEditTable>
</section>

<style>
    .steps {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .head h2 {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin: 0;
        font-size: 1.125rem;
    }

    .drag-handle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        color: var(--text-muted);
        cursor: grab;
        padding: var(--space-xs);
        user-select: none;
        -webkit-user-drag: element;
    }

    .drag-handle:active {
        cursor: grabbing;
    }
</style>