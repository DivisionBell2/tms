<script lang="ts">
	import { TestCaseStatus, TestCaseTaskStatus, type TestCaseTaskDto } from "@tms/contracts";


    interface Props {
        tasks: TestCaseTaskDto[];
        busy?: boolean;
        onToggle: (task: TestCaseTaskDto) => Promise<void>
        onDelete: (task: TestCaseTaskDto) => Promise<void>
        onCreate: (title: string) => Promise<void>
    }

    let { tasks, busy = false, onToggle, onDelete, onCreate }: Props = $props();

    let error = $state('');
    let draft = $state('');
    let saving = $state(false);

    function statusIcon(status: TestCaseTaskStatus): string {
        return status === TestCaseTaskStatus.Done
            ? 'check_circle'
            : 'radio_button_unchecked'
    }

    async function toggle(task: TestCaseTaskDto) {
        error = '';
        try {
            await onToggle(task);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Не удалось обновить задачу';
        }
    }

    async function remove(task: TestCaseTaskDto) {
        error = '';
        try {
            await onDelete(task);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Не удалось удалить задачу';
        }
    }

    async function submit(e: SubmitEvent) {
        e.preventDefault();
        const title = draft.trim();
        if (!title) return;

        saving = true;
        error = '';

        try {
            await onCreate(title);
            draft = '';
        } catch (err) {
            error = err instanceof Error ? err.message : 'Не удалось создать задачу';
        } finally {
            saving = false;
        }
    }
</script>

<section class="tasks">
    <header class="head">
        {#if error}
            <p class="text-danger">{error}</p>
        {/if}
        <h2>
            <span class="icon" aria-hidden="true">task_alt</span>
            Задачи
        </h2>
    </header>
    <ul class="list">
        {#each tasks as task}
            <li class="item" class:done={task.status === TestCaseTaskStatus.Done}>
                <button
                    type="button"
                    class="toggle"
                    aria-label="Переключить статус"
                    disabled={busy || saving}
                    onclick={() => toggle(task)}
                >
                    <span class="icon" aria-hidden="true">{statusIcon(task.status)}</span>
                </button>
                <span class="title">{task.title}</span>
                <button
                    type="button"
                    class="icon-btn"
                    aria-label="Удалить задачу"
                    disabled={busy || saving}
                    onclick={() => remove(task)}
                >
                    <span class="icon" aria-hidden="true">delete</span>
                </button>
            </li>
        {:else}
            <li class="empty">Пока нет задач</li>
        {/each}
    </ul>
    <form class="add" onsubmit={submit}>
        <input
            type="text"
            placeholder="Новая задача"
            bind:value={draft}
            maxLength="200"
            disabled={busy || saving}
        />
        <button type="submit" disabled={busy || saving || !draft.trim()}>
            <span class="icon" aria-hidden="true">add</span>
            Добавить
        </button>
    </form>
</section>

<style>
    .tasks {
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

    .list {
        list-style: none;
        margin: 0;
        padding: 0;
        background: var(--surface);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-1);
        overflow: hidden;
    }

    .item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
    }

    .item:last-child {
        border-bottom: none;
    }

    .empty {
        padding: var(--space-md);
        color: var(--text-muted);
    }

    .title {
        flex: 1;
    }

    .toggle,
    .icon-btn {
        display: inline-flex;
        border: none;
        background: transparent;
        color: var(--text);
        cursor: pointer;
        padding: var(--space-xs);
    }

    .icon-btn:hover {
        color: var(--danger);
    }

    .item.done .title {
        text-decoration: line-through;
        color: var(--text-muted);
    }

    .item.done .toggle {
        color: var(--success);
    }

    .add {
        display: flex;
        gap: var(--space-sm);
    }

    .add input {
        flex: 1;
        font: inherit;
        color: var(--text);
        background: var(--bg);
        border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
        border-radius: var(--radius-sm);
        padding: var(--space-sm);
    }

    .add button {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        border: none;
        border-radius: var(--radius-sm);
        background: var(--accent);
        color: var(--on-accent);
        font: inherit;
        font-weight: 500;
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
    }

    .add button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>