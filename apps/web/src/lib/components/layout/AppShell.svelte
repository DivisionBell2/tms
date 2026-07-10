<script lang="ts">
	import type { Snippet } from 'svelte';
	import ImageLightbox from '../ui/ImageLightbox.svelte';

	interface Props {
		children: Snippet;
		headerActions?: Snippet;
		sidebar?: Snippet;
	}

	let { children, headerActions, sidebar }: Props = $props();
</script>

<div class="shell">
	<header class="header">
		<div class="brand">
			<span class="icon" aria-hidden="true">science</span>
			<span>TMS</span>
		</div>
		<div class="header-actions">
			{#if headerActions}
				{@render headerActions()}
			{/if}
		</div>
	</header>
	<div class="body">
		{#if sidebar}
			<aside class="aside">{@render sidebar()}</aside>
		{/if}
		<main class="main">
			{@render children()}
		</main>
	</div>
	<ImageLightbox />
</div>

<style>
	.shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		background: var(--surface);
		box-shadow: var(--shadow-1);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-weight: 600;
		font-size: 1.125rem;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.body {
		flex: 1;
		display: flex;
		align-items: flex-start;
	}

	.aside {
		flex: 0 0 14rem;
		border-right: 1px solid var(--accent);
		align-self: stretch;
	}

	.main {
		flex: 1;
		min-width: 0;
		padding: var(--space-lg);
		width: 100%;
	}
</style>
