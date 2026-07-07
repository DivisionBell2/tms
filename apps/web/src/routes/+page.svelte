<script lang="ts">
import type { PingResponse } from "$lib/types/ping";
import Card from "$lib/components/ui/Card.svelte";
import Button from "$lib/components/ui/Button.svelte";

let loading = $state(false);
let result = $state<PingResponse | null>(null);
let error = $state<string | null>(null);

async function checkConnection() {
    loading = true;
    error = null;
    result = null;

    try {
        const response = await fetch('/api/ping');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText} `);
        }

        result = (await response.json()) as PingResponse;
    } catch (e) {
        error = e instanceof Error ? e.message : 'Неизвестная ошибка';
    } finally {
        loading = false;
    }
}
</script>

<Card>
    <h1>Добро пожаловать в TMS</h1>
    <p>Проверь cвязь фронтенда с микросервисами через API Gateway и NATS</p>

    <p style="margin-top: var(--space-lg)">
        <Button disabled={loading} onclick={checkConnection}>
            <span class="icon" aria-hidden="true">wifi_tethering</span>
            {loading ? 'Проверяем...' : 'Проверить связь'}
        </Button>
    </p>

    {#if result}
        <pre class="ping-result" aria-live="polite">{JSON.stringify(result, null, 2)}</pre>
    {/if}

    {#if error}
        <p class="text-danger" role="alert">{error}</p>
    {/if}
</Card>
