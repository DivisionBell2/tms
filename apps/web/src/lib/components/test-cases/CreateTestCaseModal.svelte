<script lang="ts">
		import { TestCaseStatus,  type CreateTestCaseRequestDto } from "@tms/contracts";
	import Button from "../ui/Button.svelte";

    type NewTestCase = Omit<CreateTestCaseRequestDto, 'authorId' | 'authorName'>;

    interface Props {
        open: boolean;
        onClose: () => void;
        onCreate: (data: NewTestCase) => Promise<void>;
    }

    let { open, onClose, onCreate }: Props = $props();

    let title = $state('');
    let description = $state('');
    let preconditions = $state('');
    let status = $state<TestCaseStatus>(TestCaseStatus.Draft);
    let error = $state('');
    let saving = $state(false);
    let tagsText = $state('');
    let isCritical = $state(false);

    const STATUS_OPTIONS: { value: TestCaseStatus; label: string }[] = [
        { value: TestCaseStatus.Draft, label: 'Черновик' },
        { value: TestCaseStatus.Manual, label: 'Ручное тестирование' },
        { value: TestCaseStatus.Automated, label: 'Автоматизирован' }
    ];

    function reset() {
        title = '';
        description = '';
        preconditions = '';
        status = TestCaseStatus.Draft;
        error = '';
        tagsText = '';
        isCritical = false;
    }

    function close() {
        reset();
        onClose();
    }

    async function submit(e: SubmitEvent) {
        e.preventDefault();
        saving = true;
        error = '';

        try {
            await onCreate({ title, description, preconditions, status, tags: parseTags(tagsText), isCritical });
            reset();
            onClose();
        } catch (err) {
            error = err instanceof Error ? err.message : 'Не удалось создать тест-кейс';
        } finally {
            saving = false;
        }
    }

    function parseTags(raw: string): string[] {
        return raw
            .split(', ')
            .map((t) => t.trim())
            .filter(Boolean)
    }
</script>

{#if open}
    <div class="backdrop">
        <div class="backdrop-dim" aria-hidden="true"></div>
        <div class="modal" role="dialog" aria-modal="true" tabindex="-1">
            <header class="modal-head">
                <h2>Новый тест-кейс</h2>
                <button type="button" class="close" aria-label="Закрыть" onclick={close}>
                    <span class="icon" aria-hidden="true">close</span>
                </button>
            </header>

            <form class="form" onsubmit={submit}>
                <label class="field">
                    <span>Название</span>
                    <input bind:value={title} required maxlength="1280" />
                </label>
                <label class="field">
                    <span>Статус</span>
                    <select bind:value={status}>
                        {#each STATUS_OPTIONS as opt (opt.value)}
                            <option value={opt.value}>{opt.label}</option>
                        {/each}
                    </select>
                </label>
                <label class="field">
                    <span>Описание</span>
                    <textarea bind:value={description} rows="4"></textarea>
                </label>
                <label class="field">
                    <span>Тэги (через запятую)</span>
                    <input
                        bind:value={tagsText}
                        placeholder="smoke, regression"
                        autocomplete="off"
                    />
                </label>
                <label class="field checkbox">
                    <input type="checkbox" bind:checked={isCritical} />
                    <span>Критичный тест-кейс</span>
                </label>

                {#if error}<p class="text-danger">{error}</p>{/if}

                <div class="actions">
                    <Button type="submit" disabled={saving || title.trim() === ''}>
                        {saving ? 'Создание...' : 'Создать'}
                    </Button>
                    <Button variant="text" onclick={close} disabled={saving}>Отмена</Button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .backdrop {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--space-md);
    }

    .backdrop-dim {
        position: absolute;
        inset: 0;
        background: rgb(0 0 0 / 50%);
        pointer-events: none;
    }

    .modal {
        width: 100%;
        max-width: 1280px;
        max-height: 90vh;
        overflow-y: auto;
        background: var(--surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-2);
        padding: var(--space-lg);
        z-index: 1;
    }

    .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-md);
    }

    .modal-head h2 {
        margin: 0;
        font-size: 1.25rem;
    }

    .close {
        border: none;
        background: none;
        color: var(--text);
        cursor: pointer;
        padding: var(--space-xs);
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }

    .field input,
    .field select,
    .field textarea {
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--accent);
        border-radius: var(--radius-sm);
        background: var(--bg);
        color: var(--text);
        font: inherit;
    }

    .actions {
        display: flex;
        gap: var(--space-sm);
    }

    .field.checkbox {
        flex-direction: row;
        align-items: center;
        gap: var(--space-sm);
    }

    .field.checkbox input {
        width: auto;
    }

    .field select {
        appearance: none;
        background-color: var(--bg);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right var(--space-md) center;
        background-size: 1.25rem;
        padding-right: calc(var(--space-md) + 1.25rem);
    }

    :global([data-theme='dark']) .field select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23e8eaed' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    }
</style>