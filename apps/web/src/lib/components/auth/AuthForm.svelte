<script lang="ts">
	import type { LoginRequestDto, RegisterRequestDto } from "@tms/contracts";
	import Card from "../ui/Card.svelte";
	import Button from "../ui/Button.svelte";

    interface Props {
        mode: 'login' | 'register';
        onSubmit: (payload: LoginRequestDto | RegisterRequestDto) => Promise<void>;
    }

    let { mode, onSubmit }: Props = $props();

    let email = $state('');
    let password = $state('');
    let displayName = $state('');
    let error = $state('');
    let loading = $state(false);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        error = '';
        loading = true;

        try {
            const payload =
                mode ==='register'
                ? { email, password, displayName }
                : { email, password };
            await onSubmit(payload);
        } catch (err) {
            error = err instanceof Error ? err.message: 'Ошибка запроса';
        } finally {
            loading = false;
        }
    }
</script>

<Card>
    <h1>{mode === 'login' ? 'Вход' : 'Региcтрация'}</h1>
    <form class="form" onsubmit={handleSubmit}>
        {#if mode === 'register'}
            <label class="field">
                <span>Имя</span>
                <input bind:value={displayName} required autocomplete="name" />
            </label>
        {/if}

        <label class="field">
            <span>Email</span>
            <input type="email" bind:value={email} required autocomplete="email" />
        </label>

        <label class="field">
            <span>Пароль</span>
            <input
                type="password"
                bind:value={password}
                required
                minlength="8"
                autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
        </label>

        {#if error}
            <p class="text-danger">{error}</p>
        {/if}

        <Button type="submit" disabled={loading}>
            {loading ? 'Отправка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </Button>
    </form>
</Card>

<style>
    h1 {
        text-align: center;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin-top: var(--space-md);
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }

    .field input {
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--accent);
        border-radius: var(--radius-md);
        background: var(--bg);
        color: var(--text);
        font: inherit;
    }
</style>