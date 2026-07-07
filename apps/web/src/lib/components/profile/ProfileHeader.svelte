<script lang="ts">
	import type { UserPublicDto } from "@tms/contracts";
	import { untrack } from "svelte";
	import Button from "../ui/Button.svelte";

    interface Props {
        user: UserPublicDto;
        onSaved: (user: UserPublicDto) => void;
    }

    let { user, onSaved }: Props = $props();

    let displayName = $state(untrack(() => user.displayName));
    let saving = $state(false);
    let error = $state('');

    async function save() {
        saving = true;
        error = '';

        try {
            const res = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName })
            });

            if (!res.ok) throw new Error('Не удалось сохранить имя');

            const updated = (await res.json()) as UserPublicDto;
            onSaved(updated);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Ошибка';
        } finally {
            saving = false;
        }
    }
</script>

<div class="profile-header">
    <h1>Профиль</h1>
    <label class="field">
        <span>Имя</span>
        <input bind:value={displayName} autocomplete="name" />
    </label>

    {#if error}
        <p class="text-danger">{error}</p>
    {/if}

    <Button onclick={save} disabled={saving || displayName .trim() === ''}>
        {saving ? 'Сохранение...' : 'Сохранить'}
    </Button>

</div>

<style>
    .profile-header {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
    }

    h1 {
        margin: 0 auto;
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
        font:inherit;
    }
</style>