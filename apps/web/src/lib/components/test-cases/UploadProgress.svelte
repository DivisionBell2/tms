<script lang="ts">
	interface Props {
		name: string;
		progress: number;
	}

	let { name, progress }: Props = $props();
</script>

<div class="upload">
	<span class="name">{name}</span>
	<div
		class="track"
		role="progressbar"
		aria-label={`Загрузка ${name}`}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={progress}
	>
		<div class="fill" style:width="{progress}%"></div>
	</div>
	{#if progress < 100}
		<span class="percent">{progress}%</span>
	{:else}
		<span class="percent">обработка</span>
	{/if}
</div>

<style>
	.track {
		height: 0.5rem;
		overflow: hidden;
		background: var(--bg);
		border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
		border-radius: var(--radius-sm);
	}

	.fill {
		height: 100%;
		background: var(--accent);
		transition: width 0.15s ease;
	}

	.upload {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 8rem 6.5rem;
		align-items: center;
		gap: var(--space-sm);
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.percent {
		color: var(--text-muted);
		font-size: 0.875rem;
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		text-align: left;
	}
</style>
