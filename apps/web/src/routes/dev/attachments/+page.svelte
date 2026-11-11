<script lang="ts">
	import DemoBlock from "$lib/components/dev/DemoBlock.svelte";
	import AttachmentsBlock from "$lib/components/test-cases/AttachmentsBlock.svelte";
	import type { UploadItem } from "$lib/test-cases/attachments";
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

    let uploads = $state<UploadItem[]>([]);
    let error = $state('');

    let seq = 0;

    function fakeUpload(file: File) {
        const n = ++seq;
        const key = `u${n}`;

        uploads = [...uploads, { key, name: file.name, progress: 0 }];

        const timer = setInterval(() => {
            const current = uploads.find((u) => u.key === key);

            if (!current) return clearInterval(timer);

            if (current.progress >= 100) {
                clearInterval(timer);
                uploads = uploads.filter((u) => u.key !== key);
                items = [
                    ...items,
                    {
                        id: `m${n}`,
                        testCaseId: 'mock-case',
                        fileId: `mf${n}`,
                        filename: file.name,
                        mime: file.type || 'application/octet-stream',
                        size: file.size,
                        createdAt: new Date().toISOString()
                    }
                ];

                return;
            }

            uploads = uploads.map((u) => (u.key === key ? { ...u, progress: u.progress + 20 } : u));
        }, 300);
    }

    function onUpload(files: File[]) {
        error = '';
        files.forEach(fakeUpload);
    }

    function onRemove(item: TestCaseAttachmentDto) {
        items = items.filter((i) => i.id !==item.id);
    }
</script>

<h1>Вложения</h1>
<DemoBlock title="AttachmentsBlock - список и удаление" snapshot={{ items, uploads, error }}>
    <label class="switch">
        <input
            type="checkbox"
            checked={error !== ''}
            onchange={(e) => (error = e.currentTarget.checked ? 'Файл "big.zip" больше 5 МБ' : '')}
        />
        Показать сообщение об ошибке
    </label>
    <AttachmentsBlock {items} {uploads} {error} {onUpload} {onRemove} />
</DemoBlock>

<style>
    h1 {
        margin: 0;
        font-size: 1.5rem;
    }

    .switch {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
        color: var(--text-muted);
        font-size: 0.875rem;
    }
</style>