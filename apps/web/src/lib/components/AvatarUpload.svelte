<script lang="ts">
	import type { UserPublicDto } from '@tms/contracts';
	import Button from './Button.svelte';
	import { openLightbox } from '$lib/stores/lightboxStore';

	interface Props {
		user: UserPublicDto;
		onUploaded: (user: UserPublicDto) => void;
	}

	let { user, onUploaded }: Props = $props();

	let selectedFile = $state<File | null>(null);
	let localPreview = $state<string | null>(null);
	let uploading = $state(false);
	let error = $state('');
	let fileInput = $state<HTMLInputElement | null>(null);

	let previewSrc = $derived(
		localPreview ?? (user.avatarFileId ? `/api/files/${user.avatarFileId}` : null)
	);

	function pickFile(files: FileList | null) {
		const file = files?.[0];

		if (!file) return;
		if (localPreview) URL.revokeObjectURL(localPreview);

		selectedFile = file;
		localPreview = URL.createObjectURL(file);
		error = '';
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		pickFile(e.dataTransfer?.files ?? null);
	}

	function cancel() {
		if (localPreview) URL.revokeObjectURL(localPreview);

		selectedFile = null;
		localPreview = null;
		error = '';
	}

	async function save() {
		if (!selectedFile) return;

		uploading = true;
		error = '';

		try {
			const form = new FormData();
			form.append('file', selectedFile);

			const uploadRes = await fetch('/api/files', { method: 'POST', body: form });

			if (!uploadRes.ok) throw new Error('Не удалось загрузить файл');

			const meta = (await uploadRes.json()) as { id: string };

			const patchRes = await fetch('/api/auth/me', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ avatarFileId: meta.id })
			});

			if (!patchRes.ok) throw new Error('Не удалось обновить профиль');

			const updated = (await patchRes.json()) as UserPublicDto;

			if (localPreview) URL.revokeObjectURL(localPreview);

			selectedFile = null;
			localPreview = null;
			onUploaded(updated);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Ошибка';
		} finally {
			uploading = false;
		}
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

	function openPicker() {
		fileInput?.click();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openPicker();
		}
	}

	function zoomPreview(e: MouseEvent) {
		e.stopPropagation();
		if (previewSrc) openLightbox(previewSrc)
    }
</script>

<div
	class="drop-zone"
	role="button"
	tabindex="0"
	onclick={openPicker}
	onkeydown={onKeydown}
	ondrop={onDrop}
	ondragover={(e) => e.preventDefault()}
>
	{#if previewSrc}
		<button
			type="button"
			class="preview-btn"
			onclick={zoomPreview}
		>
			<img
				class="preview"
				src={previewSrc}
				alt=""
				width="96"
				height="96"
			/>
		</button>
	{:else}
		<span class="icon" aria-hidden="true">add_a_photo</span>
	{/if}
	<p>{uploading ? 'Загрузка...' : 'Перетащите фото или выберите файл (до 5 Мб)'}</p>
	<input 
        type="file"
        accept="image/*"
        hidden
        bind:this={fileInput}
        onchange={(e) => pickFile(e.currentTarget.files)}
    />
</div>

{#if selectedFile}
	<div class="actions">
		<Button onclick={save} disabled={uploading}>
			{uploading ? 'Сохранение...' : 'Сохранить'}
		</Button>
		<Button variant="text" onclick={cancel} disabled={uploading}>Отмена</Button>
	</div>
{/if}

{#if user.avatarFileId && !selectedFile}
	<div class="remove-actions">
		<Button variant="text" onclick={removeAvatar} disabled={uploading}>
			<span class="icon" aria-hidden="true">delete</span>
			Удалить аватар
		</Button>
	</div>
{/if}

{#if error}
	<p class="text-danger">{error}</p>
{/if}

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

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}

	.preview-btn {
		padding: 0;
		border: none;
		background: none;
		cursor: zoom-in;
		line-height: 0;
	}

	.preview {
		border-radius: 50%;
		object-fit: cover;
	}

	.remove-actions {
		margin-top: var(--space-md);
	}

	.remove-actions :global(.btn) {
		width: 100%;
		justify-content: center;
	}
</style>
