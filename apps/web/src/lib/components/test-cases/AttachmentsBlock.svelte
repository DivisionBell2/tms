<script lang="ts">
	import type { UploadItem } from "$lib/test-cases/attachements";
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
    <p>Заглушка: файлов {items.length}</p>
</section>

<style>
</style>