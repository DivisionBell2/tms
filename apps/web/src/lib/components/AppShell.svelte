<script lang="ts">
	import type { Snippet } from 'svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import UserMenu from './UserMenu.svelte';
	import ImageLightbox from './ImageLightbox.svelte';

	let {
		children,
	}: {
		children: Snippet;
	} = $props();
</script>

<div class="shell">
	<header class="header">
		<div class="brand">
			<span class="icon" aria-hidden="true">science</span>
			<span>TMS</span>
		</div>
		<div class="header-actions">
			<UserMenu />
			<ThemeToggle />
		</div>
	</header>
	<main class="main">
		{@render children()}
	</main>
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

	.main {
		flex: 1;
		padding: var(--space-lg);
		max-width: 48rem;
		margin: 0 auto;
		width: 100%;
	}
</style>
