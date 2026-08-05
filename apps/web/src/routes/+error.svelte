<script lang="ts">
	import { page } from "$app/stores";
	import { onMount } from "svelte";

    let attempt = $state(0);
    let stopped = $state(false);

    const maxAttempts = 20;
    const intervalMs = 1500;

    const status = $derived($page.status);
    const message = $derived($page.error?.message ?? 'Что-то пошло не так');
    const isTransient = $derived(status === 503 || status === 500);

    async function probeAndReload() {
        attempt += 1;

        if (attempt > maxAttempts) {
            stopped = true;
            return false;
        }

        try {
            const res = await fetch('/api/health');
            if (res.ok) {
                location.reload();
                return true;
            }
        } catch {
        }

        return false;
    }

    function reloadNow() {
        location.reload();
    }

    onMount(() => {
        if (!isTransient) return;

        const id = setInterval(() => probeAndReload().then((done) => {
            if (done || stopped) clearInterval(id); 
        }), intervalMs);

        void probeAndReload();

        return () => clearInterval(id);
    });
</script>

<section class="error-page" aria-live="polite">
    <h1 class="title">
        {#if isTransient}
            Сервисы перезапускаются
        {:else}
            Ошибка {status}
        {/if}
    </h1>
    <p class="message">{message}</p>

    {#if isTransient && !stopped}
        <p class="hint">
            Попытка {Math.min(attempt, maxAttempts)} из {maxAttempts}. Страница обновится сама, когда gateway снова ответит.
        </p>
        <div class="spinner" aria-hidden="true"></div>
    {:else if isTransient && stopped}
        <p class="hint">Не удалось дождаться сервисов. Обнови страницу вручную</p>
    {/if}

    <button type="button" class="reload" onclick={reloadNow}>Обновить страницу</button>
</section>

<style>
    .error-page {
        min-height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-md, 1rem);
        padding: var(--space-lg, 1.5rem);
        text-align: center;
        color: var(--text);
    }

    .title {
        margin: 0;
        font-size: 1.5rem;
    }

    .message,
    .hint {
        margin: 0;
        max-width: 28rem;
        color: var(--text-muted);
    }

    .spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid color-mix(in srgb, var(--accent) 40%, transparent);
        border-top-color: var(--accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .reload {
        margin-top: var(--space-sm, 0.5rem);
        padding: 0.5rem 1rem;
        border: none;
        border-radius: var(--radius-sm, 6px);
        background: var(--accent);
        color: var(--text);
        cursor: pointer;
        font: inherit;
    }

    .reload:hover {
        filter: brightness(1.05);
    }
</style>