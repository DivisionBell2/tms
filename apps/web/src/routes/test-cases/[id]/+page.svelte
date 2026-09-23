<script lang="ts">
    import { page } from "$app/stores";
	import StatusBadge from "$lib/components/test-cases/StatusBadge.svelte";
	import { TEST_CASE_STATUS_OPTIONS } from "$lib/test-cases/status";
	import { TestCaseStatus, type TestCaseDetailDto } from "@tms/contracts";

    const id = $derived($page.params.id)

    let loading = $state(true);
    let error = $state('');

    let status = $state<TestCaseStatus>(TestCaseStatus.Draft);
    let authorName = $state('');
    let updatedAt = $state('');

    let title = $state('');
    let description = $state('');
    let preconditions = $state('');
    let tagsText = $state('');
    let isCritical = $state(false);

    async function loadAll() {
        loading = true;
        error = '';

        try {
            const res = await fetch(`/api/test-cases/${id}`);
            
            if (!res.ok) {
                throw new Error('Не удалось загрузить тест-кейс');
            }

            const data = (await res.json() as TestCaseDetailDto);
            status = data.status;
            authorName = data.authorName;
            updatedAt = data.updatedAt;
            title = data.title;
            description = data.description;
            preconditions = data.preconditions;
            tagsText = data.tags.join(', ');
            isCritical = data.isCritical;
        } catch(e) {
            error = e instanceof Error ? e.message : 'Неизвестная ошибка';
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        void id;
        loadAll();
    });

    function fmtDate(iso: string) {
        return iso ? new Date(iso).toLocaleString() : '';
    }
</script>

<div class="page">
    <header class="top">
        <a class="back" href="/test-cases">
            <span class="icon" aria-hidden="true">arrow_back</span>
            К списку
        </a>
    </header>
    {#if loading}
        <p>Загрузка...</p>
    {:else if error}
        <p class="text-danger">{error}</p>
    {:else}
        <section class="card fields">
            <div class="fields-head">
                <h1>Тест-кейс</h1>
                <StatusBadge {status} />
            </div>

            <p class="meta">
                Автор: {authorName || '-'} · изменен: {fmtDate(updatedAt)}
            </p>

            <label class="field">
                <span>Название</span>
                <input bind:value={title} maxLength="200" />
            </label>

            <label class="field">
                <span>Статус</span>
                <select bind:value={status}>
                    {#each TEST_CASE_STATUS_OPTIONS as opt (opt.value)}
                        <option value={opt.value}>{opt.label}</option>
                    {/each}
                </select>
            </label>

            <label class="field">
                <span>Описание</span>
                <textarea rows="4" bind:value={description} />
            </label>

            <label class="field">
                <span>Предусловия</span>
                <textarea rows="3" bind:value={preconditions} />
            </label>

            <label class="field">
                <span>Теги (через запятую)</span>
                <input bind:value={tagsText} placeholder="smoke, regression" autocomplete="off" />
            </label>

            <label class="field checkbox">
                <input type="checkbox" bind:checked={isCritical} />
                <span>Критичный тест-кейс</span>
            </label>
        </section>
    {/if}
</div>

<style>
    .page {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }

    .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(-space-md);
    }

    .back {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        color: var(--text);
        text-decoration: none;
        font-weight: 500;
    }

    .card {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        padding: var(--space-md);
        background: var(--surface);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-1);
    }

    .fields-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
    }

    .fields-head h1 {
        margin: 0;
        font-size: 1.5rem;
    }

    .meta {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.875rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }

    .field.checkbox {
        flex-direction: row;
        align-items: center;
        gap: var(--space-sm);
    }

    .field.checkbox input {
        width: auto;
    }

    .field input,
    .field select,
    .field textarea {
        font: inherit;
        color: var(--text);
        background: var(--bg);
        border: 1px solid color-mix(in srgb, var(--text) 20% transparent);
        border-radius: var(--radius-sm);
        padding: var(--space-sm);
    }
</style>