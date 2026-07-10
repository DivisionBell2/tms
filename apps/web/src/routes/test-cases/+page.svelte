<script lang="ts">
	import Button from "$lib/components/ui/Button.svelte";
	import CreateTestCaseModal from "$lib/components/test-cases/CreateTestCaseModal.svelte";
	import DataTable from "$lib/components/ui/DataTable.svelte";
	import StatusBadge from "$lib/components/test-cases/StatusBadge.svelte";
	import { TestCaseStatus, type CreateTestCaseRequestDto, type ListTestCasesResponseDto, type TestCaseDto } from "@tms/contracts";
    
    let rows = $state<TestCaseDto[]>([]);
    let page = $state(1);
    const pageSize = 20;
    let sort = $state<'createdAt' | 'updatedAt' | 'title'>('createdAt');
    let order = $state<'asc' | 'desc'>('desc');
    let total = $state(0);
    let loading = $state(false);
    let error = $state('');

    let modalOpen = $state(false);

    let authorFilter = $state('');
    let titleFilter = $state('');
    let statusFilter = $state<'' | TestCaseStatus>('');
    type DateOp = '' | 'eq' | 'gt' | 'lt';
    let createdOp = $state<DateOp>('');
    let createdDate = $state('');
    let updatedOp = $state<DateOp>('');
    let updatedDate = $state('');

    function onDateOpChange(which: 'created' | 'updated', op: DateOp) {
        if (which === 'created' && createdOp === op) createdDate = '';
        if (which === 'updated' && updatedOp === op) updatedDate = '';
        
        page = 1;
    }

    const columns = [
        { key: 'title', label: 'Название', sortable: true },
        { key: 'status', label: 'Статус' },
        { key: 'authorName', label: 'Автор'},
        { key: 'createdAt', label: 'Создан', sortable: true },
        { key: 'updatedAt', label: 'Изменен', sortable: true },
    ];

    const STATUS_FILTER_OPTIONS: { value: '' | TestCaseStatus; label: string }[] = [
        { value: '', label: 'Все статусы' },
        { value: TestCaseStatus.Draft, label: 'Черновик' },
        { value: TestCaseStatus.Manual, label: 'Ручной' },
        { value: TestCaseStatus.Automated, label: 'Автоматизирован' },
    ]

    const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);
    const shortcutLabel = isMac ? '% + N' : 'Ctrl + N';

    function dateBounds(op: DateOp, date: string): { from?: string; to?: string } {
        if (!op || !date) return {};

        const [y, m, d] = date.split('-').map(Number);

        const start = new Date(y, m - 1, d);
        const next = new Date(y, m - 1, d + 1);

        if (op === 'eq') {
            const end = new Date(`${date}T23:59:59.999`);
            
            return { from: start.toISOString(), to: new Date(next.getTime() - 1).toISOString() };
        }

        if (op === 'gt') {
            return { from: next.toISOString() };
        }

        return { to: start.toISOString() };
    }

    async function loadList() {
        loading = true;
        error = '';

        try {
            const qs = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
                sort,
                order
            });

            if (titleFilter.trim()) qs.set('filter', titleFilter.trim());
            if (statusFilter) qs.set('status', statusFilter);
            if (authorFilter.trim()) qs.set('author', authorFilter.trim());

            const created = dateBounds(createdOp, createdDate);
            
            if (created.from) qs.set('createdFrom', created.from);
            if (created.to) qs.set('createdTo', created.to);

            const updated = dateBounds(updatedOp, updatedDate);

            if (updated.from) qs.set('updatedFrom', updated.from);
            if (updated.to) qs.set('updatedTo', updated.to);

            const res = await fetch(`/api/test-cases?${qs.toString()}`);

            if (!res.ok) throw new Error('Не удалось загрузить список тест-кейсов');
            
            const data = (await res.json()) as ListTestCasesResponseDto;
            rows = data.items;
            total = data.total;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Ошибка';
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        void page;
        void sort;
        void order;
        void titleFilter;
        void statusFilter,
        void authorFilter,
        void createdOp,
        void createdDate,
        void updatedOp,
        void updatedDate,
        loadList();
    });

    const SORTABLE = ['title', 'status', 'authorName', 'createdAt', 'updatedAt'] as const;

    function onSort(key: string) {
        if (!SORTABLE.includes(key as (typeof SORTABLE)[number])) return;

        if (sort === key) {
            order = order === 'asc' ? 'desc' : 'asc';
        } else {
            sort = key as typeof sort;
            order = 'desc'
        }
        page = 1;
    }

    function onPageChange(next: number) {
        page = next;
    }

    async function createTestCase(data: Omit<CreateTestCaseRequestDto, 'authorId' | 'authorName'>) {
        const res = await fetch('/api/test-cases', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const b = await res.json().catch(() => ({}));
            throw new Error(b.message ?? 'Не удалось создать тест-кейс');
        }

        page = 1;
        await loadList();
    }

    function onKeydown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            modalOpen = true;
        }
    }

    function fmtDate(iso: string) {
        return new Date(iso).toLocaleString();
    }

</script>

<svelte:window onkeydown={onKeydown} />

<div class="page">
    <header class="page-head">
        <h1>Тест-кейсы</h1>
    </header>

    {#if error}<p class="text-danger">{error}</p>{/if}

    <button type="button" class="create-btn" onclick={() => (modalOpen = true)}>
        <span class="icon" aria-hidden="true">add</span>
        Создать тест-кейс ({shortcutLabel})
    </button>

    <!-- <div class="toolbar">
        <label class="search">
            <span class="icon" aria-hidden="true">search</span>
            <input
                placeholder="Поиск по названию"
                bind:value={filter}
                oninput={() => (page = 1)}
            />
        </label>
    </div> -->
    <DataTable
        {columns}
        {rows}
        sortKey={sort}
        {order}
        {onSort}
        {page}
        {pageSize}
        {total}
        {onPageChange}
    >
        {#snippet filterRow()}
            <th>
                <input placeholder="Название" bind:value={titleFilter} oninput={() => (page = 1)} />
            </th>
            <th>
                <select bind:value={statusFilter} onchange={() => page = 1} aria-label="Фильтр по статусу">
                    {#each STATUS_FILTER_OPTIONS as opt (opt.value)}
                        <option value={opt.value}>{opt.label}</option>
                    {/each}
                </select>
            </th>
            <th><input  placeholder="Автор" bind:value={authorFilter} oninput={() => (page = 1)} /></th>
            <th>
                <div class="date-cell">
                    <select bind:value={createdOp} onchange={() => page = 1} aria-label="Условие по дате создания">
                        <option value="">— не фильтровать</option>
                        <option value="eq">= точно</option>
                        <option value="gt">&gt; позже</option>
                        <option value="lt">&lt; раньше</option>
                    </select>
                    <input type="date" bind:value={createdDate} oninput={() => (page = 1)} />
                </div>
            </th>
            <th>
                <div class="date-cell">
                    <select bind:value={updatedOp} onchange={() => page = 1} aria-label="Условие по дате создания">
                        <option value="">— не фильтровать</option>
                        <option value="eq">= точно</option>
                        <option value="gt">&gt; позже</option>
                        <option value="lt">&lt; раньше</option>
                    </select>
                    <input type="date" bind:value={updatedDate} oninput={() => (page = 1)} />
                </div>
            </th>
        {/snippet}
        {#snippet row(tc)}
            <td>{tc.title}</td>
            <td><StatusBadge status={tc.status} /></td>
            <td>{tc.authorName || '-'}</td>
            <td class="cell-date">{fmtDate(tc.createdAt)}</td>
            <td class="cell-date">{fmtDate(tc.updatedAt)}</td>
        {/snippet}

        {#snippet empty()}
            {loading ? 'Загрузка...' : 'Пока нет тест-кейсов. Нажмите кнопку "+".'}
        {/snippet}
    </DataTable>
</div>

<CreateTestCaseModal
    open={modalOpen}
    onClose={() => (modalOpen = false)}
    onCreate={createTestCase}
/>

<style>
    .page {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }

    .page-head h1 {
        margin: 0;
    }

    .create-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--space-sm) var(--space-lg);
        border: none;
        border-radius: var(--radius-md);
        background: var(--accent);
        color: var(--text);
        font: inherit;
        font-weight: 500;
        cursor: pointer;
        box-shadow: var(--shadow-1);
        transition: box-shadow 0.2s ease;
    }

    .create-btn:hover {
        box-shadow: var(--shadow-2);
        filter: brightness(0.9);
    }

    .page :global(tbody td) {
        vertical-align: middle;
    }

    .cell-date {
        font-size: 0.875rem;
        color: var(--text-muted);
    }

    .date-cell {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }
</style>