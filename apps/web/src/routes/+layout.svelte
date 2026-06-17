<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { applyTheme, getStoredTheme } from '$lib/theme';
	import AppShell from '$lib/components/AppShell.svelte';
	import { currentUser } from '$lib/stores/authStore';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data, children } = $props();

	$effect(() => {
		currentUser.set(data.user);
	});
	
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

{#snippet actions()}
	<UserMenu />
	<ThemeToggle />
{/snippet}

<AppShell headerActions={actions}>
	{@render children()}
</AppShell>