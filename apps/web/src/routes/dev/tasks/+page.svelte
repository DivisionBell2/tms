<script lang="ts">
	import DemoBlock from "$lib/components/dev/DemoBlock.svelte";
	import AttachmentsBlock from "$lib/components/test-cases/AttachmentsBlock.svelte";
	import TaskList from "$lib/components/test-cases/TaskList.svelte";
	import { TestCaseTaskStatus, type TestCaseTaskDto } from "@tms/contracts";

    const MOCK_CASE_ID = 'mock-case';

    let tasks = $state<TestCaseTaskDto[]>([
        {
            id: 'task-1',
            testCaseId: MOCK_CASE_ID,
            title: 'Уточнить предусловия',
            status: TestCaseTaskStatus.Open
        },
        {
            id: 'task-2',
            testCaseId: MOCK_CASE_ID,
            title: 'Согласовать с аналитиком',
            status: TestCaseTaskStatus.Done
        },
    ]);

    let busy = $state(false);
    let failNext = $state(false);

    async function fakeRequest() {
        busy = true;
        try {
            await new Promise((resolve) => setTimeout(resolve, 600));
            if (failNext) {
                throw new Error('Сервер недоступен (это мок)');
            }
        } finally {
            busy = false;
        }
    }

    async function onToggle(task: TestCaseTaskDto) {
        await fakeRequest();
        tasks = tasks.map((t) => 
            t.id === task.id
                ? {
                    ...t,
                    status:
                    t.status === TestCaseTaskStatus.Done
                        ? TestCaseTaskStatus.Open
                        : TestCaseTaskStatus.Done
                }
            : t
        );
    }

    async function onDelete(task: TestCaseTaskDto) {
        await fakeRequest();
        tasks = tasks.filter((t) => t.id !== task.id);
    }

    async function onCreate(title: string) {
        await fakeRequest();
        tasks = [
            ...tasks,
            {
                id: crypto.randomUUID(),
                testCaseId: MOCK_CASE_ID,
                title,
                status: TestCaseTaskStatus.Open
            }
        ];
    }
</script>

<h1>Задачи и вложения</h1>

<DemoBlock title="TaskList - создание, переключение, удаление snapshot={tasks}">
    <label class="switch">
        <input type="checkbox" bind:checked={failNext} />
        Следующая операция падает с ошибкой
    </label>
    <TaskList {tasks} {busy} {onToggle} {onDelete} {onCreate} />
    <AttachmentsBlock />
</DemoBlock>

<style>
    h1 {
        margin: 0;
        font-size: 1.5rem;
    }

    .switch {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
        color: var(--text-muted);
        font-size: 0.875rem;
    }
</style>