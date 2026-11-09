<script lang="ts">
	import DemoBlock from "$lib/components/dev/DemoBlock.svelte";
	import AttachmentsBlock from "$lib/components/test-cases/AttachmentsBlock.svelte";
	import type { TestCaseAttachmentDto } from "@tms/contracts";

    let items = $state<TestCaseAttachmentDto[]>([
        {
            id: 'a1',
            testCaseId: 'mock-case',
            fileId: 'f1',
            filename: 'Скриншот ошибки.png',
            mime: 'image/png',
            size: 245_760,
            createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
            id: 'a2',
            testCaseId: 'mock-case',
            fileId: 'f2',
            filename: 'requirements.png',
            mime: 'application/pdf',
            size: 2_411_724,
            createdAt: '2026-01-02T00:00:00.000Z',
        },
    ]);

    function onRemove(item: TestCaseAttachmentDto) {
        items = items.filter((i) => i.id !==item.id);
    }
</script>

<h1>Вложения</h1>
<DemoBlock title="AttachmentsBlock - список и удаление" snapshot={{ items }}>
    <AttachmentsBlock {items} onUpload={() => {}} {onRemove} />
</DemoBlock>

<style>
    h1 {
        margin: 0;
        font-size: 1.5rem;
    }
</style>