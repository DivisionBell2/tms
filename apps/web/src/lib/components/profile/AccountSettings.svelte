<script lang="ts">
	import type { UserPublicDto } from '@tms/contracts';
	import { untrack } from 'svelte';
	import Button from '../ui/Button.svelte';

	interface Props {
		user: UserPublicDto;
		onEmailChanged: (user: UserPublicDto) => void;
	}

	let { user, onEmailChanged }: Props = $props();

	let currentPassword = $state('');
	let newPassword = $state('');
	let pwdSaving = $state(false);
	let pwdError = $state('');
	let pwdOk = $state(false);

	async function savePassword(e: SubmitEvent) {
		e.preventDefault();
		pwdSaving = true;
		pwdError = '';
		pwdOk = false;

		try {
			const res = await fetch('/api/auth/password', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword })
			});

			if (!res.ok) {
				const b = await res.json().catch(() => ({}));
				throw new Error(b.message ?? 'Не удалось сменить пароль');
			}

			pwdOk = true;
			currentPassword = '';
			newPassword = '';
		} catch (err) {
			pwdError = err instanceof Error ? err.message : 'Ошибка';
		} finally {
			pwdSaving = false;
		}
	}

	let newEmail = $state(untrack(() => user.email));
	let emailPassword = $state('');
	let emailSaving = $state(false);
	let emailError = $state('');

	async function saveEmail(e: SubmitEvent) {
		e.preventDefault();
		emailSaving = true;
		emailError = '';

		try {
			const res = await fetch('/api/auth/email', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ newEmail, password: emailPassword })
			});

			if (!res.ok) {
				const b = await res.json().catch(() => ({}));
				throw new Error(b.message ?? 'Не удалось сменить почту');
			}

			const updated = (await res.json()) as UserPublicDto;
			emailPassword = '';
		} catch (err) {
			emailError = err instanceof Error ? err.message : 'Ошибка';
		} finally {
			emailSaving = false;
		}
	}
</script>

<section class="settings">
	<form class="block" onsubmit={savePassword}>
		<h2>Смена пароля</h2>
		<label class="field">
			<span>Текущий пароль</span>
			<input
				type="password"
				bind:value={currentPassword}
				required
				minlength="8"
				autocomplete="current-password"
			/>
		</label>
		<label class="field">
			<span>Новый пароль</span>
			<input
				type="password"
				bind:value={newPassword}
				required
				minlength="8"
				autocomplete="new-password"
			/>
		</label>

		{#if pwdError}<p class="text-danger">{pwdError}</p>{/if}
		{#if pwdOk}<p class="ok">Пароль изменен</p>{/if}

		<Button type="submit" disabled={pwdSaving}>
			{pwdSaving ? 'Сохранение...' : 'Сменить пароль'}
		</Button>
	</form>

	<form class="block" onsubmit={saveEmail}>
		<h2>Смена почты</h2>
		<label class="field">
			<span>Новая почта</span>
			<input type="email" bind:value={newEmail} required autocomplete="email" />
		</label>
		<label class="field">
			<span>Пароль для подтверждения</span>
			<input
				type="password"
				bind:value={emailPassword}
				required
				minlength="8"
				autocomplete="current-password"
			/>
		</label>

		{#if emailError}<p class="text-danger">{emailError}</p>{/if}

		<Button type="submit" disabled={emailSaving || newEmail === user.email}>
			{emailSaving ? 'Сохранение...' : 'Сменить почту'}
		</Button>
	</form>
</section>

<style>
    .settings {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
        margin-top: var(--space-lg);
    }

    .block {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }

    .block h2 {
        margin: 0;
        font-size: 1.1rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }

    .field input {
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--accent);
        border-radius: var(--radius-sm);
        background: var(--bg);
        color: var(--text);
        font: inherit;
    }

    .ok {
        color: var(--text-muted);
    }
</style>
