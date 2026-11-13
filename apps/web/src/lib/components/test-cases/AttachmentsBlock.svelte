<script lang="ts">
	import { fileIcon, formatFileSize, type UploadItem } from "$lib/test-cases/attachments";
	import { MAX_ATACHMENT_SIZE, type TestCaseAttachmentDto } from "@tms/contracts";
	import UploadProgress from "./UploadProgress.svelte";

    interface Props {
        items: TestCaseAttachmentDto[];
        uploads?: UploadItem[];
        error?: string;
        onUpload: (files: File[]) => void | Promise<void>;
        onRemove: (item: TestCaseAttachmentDto) => void;
    }

    let { items, uploads = [], error = '', onUpload, onRemove }: Props = $props();

    let dragOver = $state(false);
    let fileInput = $state<HTMLInputElement | null>(null);

    function onDrop(e: DragEvent) {
        e.preventDefault();
        dragOver = false;

        const files = Array.from(e.dataTransfer?.files ?? []);

        if (files.length > 0) onUpload(files);
    }

    function onDragOver(e: DragEvent) {
        e.preventDefault();
        dragOver = true;
    }

    function onPick(e: Event & { currentTarget: HTMLInputElement }) {
        const files = Array.from(e.currentTarget.files ?? []);

        e.currentTarget.value = '';

        if (files.length > 0) onUpload(files);
    }

    function onPicker() {
        fileInput?.click();
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPicker();
        }
    }
</script>

<section class="attachments" aria-label="Вложения">
    <header class="head">
        <h2>
            <span class="icon" aria-hidden="true">attach_file</span>
            Вложения
            {#if items.length > 0}
                <span>({items.length})</span>
            {/if}
        </h2>
    </header>

    <div
        class="drop"
        class:over={dragOver}
        role="button"
        tabindex="0"
        aria-label="Прикрепить файлы"
        ondrop={onDrop}
        onclick={onPicker}
        ondragover={onDragOver}
        ondragleave={() => (dragOver = false)}
        onkeydown={onKeydown}
    >
        <span class="icon big" aria-hidden="true">upload_file</span>
        {#if uploads.length > 0}
            <p> Загрузка ({uploads.length})</p>
        {:else}
            <p> Перетащите сюда файлы или нажмите, чтобы выбрать (до {formatFileSize(MAX_ATACHMENT_SIZE)})</p>
        {/if}
    </div>
    <input type="file" multiple hidden bind:this={fileInput} onchange={onPick} />

    {#if error}
        <p class="text-danger" role="alert">{error}</p>
    {/if}
    {#if uploads.length > 0}
        <ul class="uploads">
            {#each uploads as upload (upload.key)}
                <li>
                    <UploadProgress name={upload.name} progress={upload.progress} />
                </li>
            {/each}
        </ul>
    {/if}

    <ul class="list">
        {#each items as item (item.id)}
            <li class="item">
                <span class="icon type" aria-hidden="true">{fileIcon(item.mime)}</span>
                <span class="name">{item.filename}</span>
                <span class="size">{formatFileSize(item.size)}</span>
                <a
                    class="icon-btn"
                    href={`/api/files/${item.fileId}`}
                    download={item.filename}
                    aria-label={`Скачать ${item.filename}`}
                >
                    <span class="icon" aria-hidden="true">download</span>
                </a>
                <button
                    type="button"
                    class="icon-btn remove"
                    aria-label={`Удалить ${item.filename}`}
                    onclick={() => onRemove(item)}
                >
                    <span class="icon" aria-hidden="true">delete</span>
                </button>
            </li>
        {:else}
            <li class="empty">Файлов пока нет</li>
        {/each}
    </ul>
</section>

<style>
    .attachments {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .head h2 {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin: 0;
        font-size: 1.125rem;
    }
    .list {
        list-style: none;
        margin: 0;
        padding: 0;
        background: var(--surface);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-1);
        overflow: hidden;
    }

    .empty {
        padding: var(--space-md);
        color: var(--text-secondary);
    }

    .item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
    }

    .item:last-child {
        border-bottom: none;
    }
    .size {
        color: var(--text-muted);
        font-size: 0.875rem;
    }

    .icon-btn {
        display: inline-flex;
        padding: var(--space-xs);
        border: none;
        background: transparent;
        color: var(--text);
        cursor: pointer;
    }

    .icon-btn:hover {
        color: var(--info);
    }
    .icon-btn.remove:hover {
        color: var(--danger);
    }

    .uploads {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }

    .drop {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-lg);
        border: 2px dashed var(--accent);
        border-radius: var(--radius-lg);
        background: var(--bg);
        color: var(--text-muted);
        text-align: center;
        cursor: pointer;
    }

    .drop p {
        margin: 0;
    }

    .big {
        font-size: 2rem;
    }

    .drop.over {
        border-color: var(--info);
        background: color-mix(in srgb, var(--info) 8%, var(--bg));
    }
</style>