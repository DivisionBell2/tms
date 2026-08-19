<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import ImageLightbox from '../ui/ImageLightbox.svelte';
	import { restoreSidebar, sidebarOpen, toggleSidebar } from '$lib/stores/storeSidebar';

	interface Props {
		children: Snippet;
		headerActions?: Snippet;
		sidebar?: Snippet;
	}

	let { children, headerActions, sidebar }: Props = $props();

	onMount(restoreSidebar);

	function onKeydown(e: KeyboardEvent) {
		if (!sidebar) return;
		if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
		if (e.code !== 'KeyB' && e.code !== 'KeyL') return;

		e.preventDefault();
		toggleSidebar();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="shell">
	<header class="header">
		<div class="brand">
			{#if sidebar}
				<button
					type="button"
					class="menu-btn"
					aria-label={$sidebarOpen ? 'Скрыть меню' : 'Показать меню'}
					aria-expanded={$sidebarOpen}
					aria-controls="side-nav"
					title="Меню (%/Ctrl + B)"
					onclick={toggleSidebar}
				>
					<span class="icon" aria-hidden="true">{$sidebarOpen ? 'menu_open' : 'menu'}</span>
				</button>
			{/if}
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
			<aside
				id="side-nav"
				class="aside"
				class:collapsed={!$sidebarOpen}
				inert={!$sidebarOpen}
			>
				<div class="aside-inner">{@render sidebar()}</div>
			</aside>
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

	.menu-btn {
		display: flex;
		padding: var(--space-sm);
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text);
		cursor: pointer;
	}

	.menu-btn:hover {
		background: var(--accent);
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
		overflow: hidden;
		transition:
			flex-basis 160ms ease,
			border-right-color 160ms ease;
	}

	.aside.collapsed {
		flex-basis: 0;
		border-right-color: transparent;
	}

	.aside-inner {
		width: 14rem;
	}

	.main {
		flex: 1;
		min-width: 0;
		padding: var(--space-lg);
		width: 100%;
	}

	@media (prefers-reduced-motion: reduce) {
		.aside {
			transition: none;
		}
	}
</style>
