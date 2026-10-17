<script lang="ts">
	import { page } from '$app/stores';
	import AttachmentsBlock from '$lib/components/test-cases/AttachmentsBlock.svelte';
	import StatusBadge from '$lib/components/test-cases/StatusBadge.svelte';
	import StepsTable, { type StepRow } from '$lib/components/test-cases/StepsTable.svelte';
	import TaskList from '$lib/components/test-cases/TaskList.svelte';
	import { TEST_CASE_STATUS_OPTIONS } from '$lib/test-cases/status';
	import {
		TestCaseStatus,
		type TestCaseTaskDto,
		type TestCaseDetailDto,
		type ListTestCaseTasksResponseDto,

		TestCaseTaskStatus

	} from '@tms/contracts';
    import { goto } from '$app/navigation';

	const id = $derived($page.params.id);

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

	let saveError = $state('');
	let savingCase = $state(false);

	let savingSteps = $state(false);
	let steps = $state<StepRow[]>([]);

	let tasksBusy = $state(false);
	let tasks = $state<TestCaseTaskDto[]>([]);

	async function loadAll() {
		loading = true;
		error = '';

		try {
			const [caseRes, tasksRes] = await Promise.all([
				fetch(`/api/test-cases/${id}`),
				fetch(`/api/test-cases/${id}/tasks`)
			]);

			if (!caseRes.ok) {
				throw new Error('Не удалось загрузить тест-кейс');
			}

			const data = (await caseRes.json()) as TestCaseDetailDto;
			status = data.status;
			authorName = data.authorName;
			updatedAt = data.updatedAt;
			steps = data.steps.map((s) => ({
				id: s.id,
				action: s.action,
				expectedResult: s.expectedResult
			}));
			title = data.title;
			description = data.description;
			preconditions = data.preconditions;
			tagsText = data.tags.join(', ');
			isCritical = data.isCritical;

			if (tasksRes.ok) {
				const t = (await tasksRes.json()) as ListTestCaseTasksResponseDto;
				tasks = t.items;
			} else {
				tasks = [];
			}
		} catch (e) {
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

	function parseTags(raw: string): string[] {
		return raw
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
	}

	async function saveCase() {
		savingCase = true;
		saveError = '';

		try {
			const res = await fetch(`/api/test-cases/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					description,
					preconditions,
					status,
					tags: parseTags(tagsText),
					isCritical
				})
			});

			if (!res.ok) {
				const b = await res.json().catch(() => ({}));
				throw new Error(b.message ?? 'Не удалось сохранить');
			}

			const data = (await res.json()) as TestCaseDetailDto;
			tagsText = data.tags.join(', ');
			isCritical = data.isCritical;
			updatedAt = data.updatedAt;
		} catch (e) {
			saveError = e instanceof Error ? e.message : 'Ошибка сохранения';
		} finally {
			savingCase = false;
		}
	}

	async function saveSteps() {
		savingSteps = true;
		saveError = '';

		try {
			const res = await fetch(`/api/test-cases/${id}/steps`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					steps: steps.map((s, index) => ({
						id: s.id,
						order: index + 1,
						action: s.action,
						expectedResult: s.expectedResult
					}))
				})
			});

			if (!res.ok) {
				const b = await res.json().catch(() => ({}));
				throw new Error(b.message ?? 'Не удалось сохранить шаги');
			}

			const saved = (await res.json()) as {
				id: string;
				action: string;
				expectedResult: string;
			}[];

			steps = saved.map((s) => ({
				id: s.id,
				action: s.action,
				expectedResult: s.expectedResult
			}));
		} catch (e) {
			saveError = e instanceof Error ? e.message : 'Ошибка сохранения шагов';
		} finally {
			savingSteps = false;
		}
	}

    async function createTask(taskTitle: string) {
        tasksBusy = true;

        try {
            const res = await fetch(`/api/test-cases/${id}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: taskTitle })
            });

            if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                throw new Error(b.message ?? 'Не удалось создать задачу');
            }
            const created = (await res.json()) as TestCaseTaskDto;
            tasks = [...tasks, created];
        } finally {
            tasksBusy = false;
        }
    }

    async function toggleTask(task: TestCaseTaskDto) {
        tasksBusy = true;

        try {
            const nextStatus = task.status === TestCaseTaskStatus.Done
                ? TestCaseTaskStatus.Open
                : TestCaseTaskStatus.Done;

            const res = await fetch(`/api/test-cases/${id}/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });

            if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                throw new Error(b.message ?? 'Не удалось обновить задачу');
            }

            const updated = (await res.json()) as TestCaseTaskDto;
            tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
        } finally {
            tasksBusy = false;
        }
    }

    async function deleteTask(task: TestCaseTaskDto) {
        tasksBusy = true;

        try {
            const res = await fetch(`/api/test-cases/${id}/tasks/${task.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                throw new Error(b.message ?? 'Не удалось удалить задачу');
            }

            tasks = tasks.filter((t) => t.id !== task.id);
        } finally {
            tasksBusy = false;
        }
    }

    async function removeCase() {
    if (!confirm('Удалить тест-кейс вместе с шагами и задачами?')) return;
    const res = await fetch(`/api/test-cases/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      saveError = b.message ?? 'Не удалось удалить';
      return;
    }
    await goto('/test-cases');
  }
</script>

<div class="page">
	<header class="top">
		<a class="back" href="/test-cases">
			<span class="icon" aria-hidden="true">arrow_back</span>
			К списку
		</a>
        <div class="top-actions">
            <button type="button" class="btn danger" onclick={removeCase}>
                <span class="icon" aria-hidden="true">delete</span>
                Удалить
            </button>
        </div>
	</header>
	{#if loading}
		<p>Загрузка...</p>
	{:else if error}
		<p class="text-danger">{error}</p>
	{:else}
		{#if saveError}
			<p class="text-danger">{saveError}</p>
		{/if}
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
				<textarea rows="4" bind:value={description}></textarea>
			</label>

			<label class="field">
				<span>Предусловия</span>
				<textarea rows="3" bind:value={preconditions}></textarea>
			</label>

			<label class="field">
				<span>Теги (через запятую)</span>
				<input bind:value={tagsText} placeholder="smoke, regression" autocomplete="off" />
			</label>

			<label class="field checkbox">
				<input type="checkbox" bind:checked={isCritical} />
				<span>Критичный тест-кейс</span>
			</label>

			<button type="button" class="btn primary" disabled={savingCase} onclick={saveCase}>
				<span class="icon" aria-hidden="true">save</span>
				{savingCase ? 'Сохранение...' : 'Сохранить'}
			</button>
		</section>

		<section class="card">
			<StepsTable {steps} onChange={(next) => (steps = next)} />
			<button type="button" class="btn primary" disabled={savingSteps} onclick={saveSteps}>
				<span class="icon" aria-hidden="true">save</span>
				{savingCase ? 'Сохранение шагов..' : 'Сохранить шаги'}
			</button>
		</section>

		<section class="grid">
            <div class="card">
                <TaskList
                    {tasks}
                    busy={tasksBusy}
                    onCreate={createTask}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                />
            </div>
            <div class="card">
                <AttachmentsBlock />
            </div>
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
		gap: var(--space-md);
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

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		align-self: flex-start;
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font: inherit;
		font-weight: 500;
		cursor: pointer;
	}

	.btn.primary {
		background: var(--accent);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-md);
    }

    .btn.danger {
        background: transparent;
        color: var(--danger);
    }

    @media(max-width: 800px) {
        .grid {
            grid-template-columns: 1fr;
        }
    }
</style>
