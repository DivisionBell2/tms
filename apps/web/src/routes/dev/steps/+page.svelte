<script lang="ts">
	import InlineEditTable from '$lib/components/test-cases/InlineEditTable.svelte';
	import DemoBlock from '$lib/components/dev/DemoBlock.svelte';
	import StepsTable, { type StepRow } from '$lib/components/test-cases/StepsTable.svelte';

	const envColumns = [
		{ key: 'browser' as const, label: 'Браузер' },
		{ key: 'version' as const, label: 'Версия' }
	];

	type EnvRow = { browser: string; version?: string };

	let envRows = $state<EnvRow[]>([
		{ browser: 'Chrome', version: '126' },
		{ browser: 'Safari', version: '17.5' }
	]);

	let steps = $state<StepRow[]>([
		{
			id: 'mock-1',
			action: 'Открыть /login',
			expectedResult: 'Видна форма входа'
		},
		{
			id: 'mock-2',
			action: 'Ввести почту и пароль',
			expectedResult: 'Кнопка «Войти» активна'
		},
		{
			id: 'mock-3',
			action: 'Нажать «Войти»',
			expectedResult: 'Редирект на /test-cases'
		}
	]);
</script>

<DemoBlock title="StepsTable - шаги и drag-and-drop">
	<StepsTable {steps} onChange={(next) => (steps = next)} />
</DemoBlock>

<DemoBlock title="InlineEditTable сама по себе - без ручки DnD">
	<InlineEditTable
		columns={envColumns}
		rows={envRows}
		onChange={(next) => (envRows = next)}
		onAdd={() => (envRows = [...envRows, { browser: '', version: '' }])}
		addLabel="Добавить браузер"
	/>
</DemoBlock>