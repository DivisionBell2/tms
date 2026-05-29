<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import { applyTheme, getStoredTheme } from '$lib/theme';

	let { children } = $props();

	onMount(() => {
		applyTheme(getStoredTheme());

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const onSystemChange = () => {
			if (getStoredTheme() === 'system') applyTheme('system');
		}

		media.addEventListener('change', onSystemChange);
		return () => media.removeEventListener('change', onSystemChange);
	});
</script>

<div class="app-shell">
	<header class="app-header">
		<div class="app-brand">
			<span class="icon" aria-hidden="true">science</span>
			<span>TMS</span>
		</div>
		<ThemeToggle />
	</header>

	<main class="app-main">
		{@render children()}
	</main>
</div>