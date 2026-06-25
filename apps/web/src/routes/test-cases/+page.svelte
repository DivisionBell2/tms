<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import CreateTestCaseModal from "$lib/components/CreateTestCaseModal.svelte";
	import DataTable from "$lib/components/DataTable.svelte";
	import StatusBadge from "$lib/components/StatusBadge.svelte";
	import type { CreateTestCaseRequestDto, ListTestCasesResponseDto, TestCaseDto } from "@tms/contracts";
    
    let rows = $state<TestCaseDto[]>([]);
    let page = $state(1);
    const pageSize = 20;
    let sort = $state<'createdAt' | 'updatedAt' | 'title'>('createdAt');
    let order = $state<'asc' | 'desc'>('desc');
    let total = $state(0);
    let filter = $state('');
    let loading = $state(false);
    let error = $state('');

    let modalOpen = $state(false);

    const columns = [
        { key: 'title', label: 'Название', sortable: true },
        { key: 'status', label: 'Статус' },
        { key: 'createdAt', label: 'Создан', sortable: true },
        { key: 'updatedAt', label: 'Изменен', sortable: true },
    ];

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

            if (filter.trim()) qs.set('filter', filter.trim());

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
        void filter;
        loadList();
    })

    function onSort(key: string) {
        if (key !== 'title' && key !== 'createdAt' && key !== 'updatedAt') return;

        if (sort === key) {
            order = order === 'asc' ? 'desc' : 'asc';
        } else {
            sort = key;
            order = 'desc'
        }
        page = 1;
    }

    function onPageChange(next: number) {
        page = next;
    }

    async function createTestCase(data: Omit<CreateTestCaseRequestDto, 'authorId'>) {
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

    function fmtDate(iso: string) {
        return new Date(iso).toLocaleString();
    }

</script>

<div class="page">
    <header class="page-head">
        <h1>Тест-кейсы</h1>
        <Button onclick={() => (modalOpen = true)}>
            <span class="icon" aria-hidden="true">add</span>
        </Button>
    </header>

    <div class="toolbar">
        <label class="search">
            <span class="icon" aria-hidden="true">search</span>
            <input
                placeholder="Поиск по названию"
                bind:value={filter}
                oninput={() => (page = 1)}
            />
        </label>
    </div>
    {#if error}<p class="text-danger">{error}</p>{/if}
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
        {#snippet row(tc)}
            <td>{tc.title}</td>
            <td><StatusBadge status={tc.status} /></td>
            <td>{fmtDate(tc.createdAt)}</td>
            <td>{fmtDate(tc.updatedAt)}</td>
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

    .page-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .page-head h1 {
        margin: 0;
    }

    .toolbar {
        display: flex;
        gap: var(--space-sm);
    }

    .search {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid var(--accent);
        border-radius: var(--radius-sm);
        background: var(--bg);
        flex: 1;
        max-width: 24rem;
    }

    .search input {
        border: none;
        background: none;
        color: var(--text);
        font: inherit;
        flex: 1;
        outline: none;
    }
</style>