<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'button' | 'submit';
		disabled?: boolean;
		variant?: 'filled' | 'text';
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	}

	let {
		type = 'button',
		disabled = false,
		variant = 'filled',
		onclick,
		children
	}: Props = $props();
</script>

<button {type} class="btn" class:btn-text={variant === 'text'} {disabled} {onclick}>
	{@render children()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		border: none;
		border-radius: var(--radius-md);
		background: var(--accent);
		color: var(--text);
		font: inherit;
		font-weight: 500;
		cursor: pointer;
		box-shadow: var(--shadow-1);
		transition: box-shadow 0.2s ease;
	}

	.btn:hover:not(:disabled) {
		box-shadow: var(--shadow-2);
		filter: brightness(0.9);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

    .btn-text {
        background: transparent;
        box-shadow: none;
        color: var(--text);
    }
</style>
