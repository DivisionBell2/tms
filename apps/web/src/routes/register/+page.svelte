<script lang="ts">
	import { goto } from "$app/navigation";
	import AuthForm from "$lib/components/AuthForm.svelte";
	import { currentUser } from "$lib/stores/authStore";
	import type { LoginRequestDto, RegisterRequestDto, UserPublicDto } from "@tms/contracts";

    async function onSubmit(payload: LoginRequestDto | RegisterRequestDto) {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message ?? 'Не удалось зарегистрироваться');
        }

        const { user } = (await res.json()) as { user: UserPublicDto };
        currentUser.set(user);
        await goto('/profile');
    }
</script>

<div class="page">
    <AuthForm mode="register" {onSubmit} />
    <p class="muted">
        Уже есть аккаунт? <a href="/login">Войти</a>
    </p>
</div>

<style>
    .page {
        max-width: 28rem;
        margin: var(--space-xl) auto;
        padding: 0 var(--space-md);
    }

    .muted {
        margin-top: var(--space-md);
        text-align: center;
        color: var(--text-muted);
    }

    .muted a {
        color: var(--accent);
        font-weight: 500;
        text-decoration: none;
    }

    .muted a:hover {
        text-decoration: underline;
    }
</style>