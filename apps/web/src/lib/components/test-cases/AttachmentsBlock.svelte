<script lang="ts">
	import type { UploadItem } from "$lib/test-cases/attachments";
	import type { TestCaseAttachmentDto } from "@tms/contracts";

    interface Props {
        items: TestCaseAttachmentDto[];
        uploads?: UploadItem[];
        error?: string;
        onUpload: (files: File[]) => void | Promise<void>;
        onRemove: (item: TestCaseAttachmentDto) => void;
    }

    // Заглушка
    let { items }: Props = $props();
</script>

<section aria-label="Вложения">
    <h2>Вложения</h2>
    <ul class="list">
        {#each items as item (item.id)}
            <li class="item"></li>
        {:else}
            <li class="empty">Файлов пока нет</li>
        {/each}
    </ul>
</section>

<style>
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
</style>