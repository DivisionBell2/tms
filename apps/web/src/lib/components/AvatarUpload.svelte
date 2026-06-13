<script lang="ts">
	import type { UserPublicDto } from "@tms/contracts";

    interface Props {
        user: UserPublicDto;
        onUploaded: (user: UserPublicDto) => void;
    }

    let { user, onUploaded }: Props = $props();
    let uploading = $state(false);
    let error = $state('');

    async function onFile(files: FileList | null) {
        const file = files?.[0];
        
        if (!file) return;

        uploading = true;
        error = '';

        try {
            const form = new FormData();
            form.append('file', file);
            const uploadRes = await fetch('/api/files', {
                method: 'POST',
                body: form
            });

            if (!uploadRes.ok) throw new Error('Не удалось загрузить файл');

            const meta = (await uploadRes.json()) as { id: string };

            const patchRes = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarFileId: meta.id })
            });

            if (!patchRes.ok) throw new Error('Не удалось обновить профиль');

            const updated = (await patchRes.json()) as UserPublicDto;
            onUploaded(updated);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Ошибка'
        } finally {
            uploading = false;
        }
    }

    function onDrop(e: DragEvent) {
        e.preventDefault();
        onFile(e.dataTransfer?.files ?? null);
    }

    async function removeAvatar() {
        if (!user.avatarFileId) return;

        uploading = true;
        error = '';
        
        const oldId = user.avatarFileId;

        try {
            const patchRes = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarFileId: null })
            });

            if (!patchRes.ok) throw new Error('Не удалось обновить профиль');

            const updated = (await patchRes.json()) as UserPublicDto;

            await fetch(`/api/files/${oldId}`, { method: 'DELETE' });

            onUploaded(updated);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Ошибка';
        } finally {
            uploading = false;
        }
    }
</script>

<div
    class="drop-zone"
    role="button"
    tabindex="0"
    ondrop={onDrop}
    ondragover={(e) => e.preventDefault()}
>
    {#if user.avatarFileId}
        <img class="preview" src={`/api/files/${user.avatarFileId}`} alt="" width=96 height=96 />
    {:else}
        <span class="icon" aria-hidden="true">add_a_photo</span>
    {/if}
    <p>{uploading ? 'Загрузка...' : 'Перетащите фото или выберите файл (до 5 Мб)'}</p>
    <input type="file" accept="image/*" hidden onchange={(e) => onFile(e.currentTarget.files)} />

    {#if user.avatarFileId}
        <button type="button" class="remove" onclick={removeAvatar} disabled={uploading}>
            <span class="icon" aria-hidden="true">delete</span>
        </button>
    {/if}

    {#if error}
        <p class="text-danger">{error}</p>
    {/if}
</div>

<style>
    .drop-zone {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
        padding: var(--space-lg);
        border: 2px dashed var(--accent);
        border-radius: var(--radius-lg);
        cursor: pointer;
        background: var(--bg);
    }

    .preview {
        border-radius: 50%;
        object-fit: cover;
    }

    .remove {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        margin-top: var(--space-md);
        padding: var(--space-xs) var(--space-sm);
        border: none;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--danger);
        cursor: pointer;
        font: inherit;
    }

    .remove:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>