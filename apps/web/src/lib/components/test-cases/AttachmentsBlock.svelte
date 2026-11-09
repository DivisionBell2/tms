<script lang="ts">
	import { fileIcon, formatFileSize, type UploadItem } from "$lib/test-cases/attachments";
	import type { TestCaseAttachmentDto } from "@tms/contracts";

    interface Props {
        items: TestCaseAttachmentDto[];
        uploads?: UploadItem[];
        error?: string;
        onUpload: (files: File[]) => void | Promise<void>;
        onRemove: (item: TestCaseAttachmentDto) => void;
    }

    let { items, onRemove }: Props = $props();
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
</style>