import type { ListTestCaseAttachmentsResponseDto, TestCaseAttachmentDto } from "@tms/contracts";
import { validateFile, type UploadItem } from "./attachments";
import { uploadFile } from "./upload";

export interface AttachementsDeps {
    getTestCaseId: () => string;
    request?: typeof fetch;
    upload?: typeof uploadFile;
}

export interface AttachementsController {
    readonly items: TestCaseAttachmentDto[];
    readonly uploads: UploadItem[];
    readonly error: string;
    load: () => Promise<void>;
    upload: (files: File[]) => Promise<void>;
    remove: (item: TestCaseAttachmentDto) => Promise<void>;
}

async function readMessage(res: Response, fallback: string): Promise<string> {
    const body = await res.json().catch(() => ({}));

    return typeof body.message === 'string' ? body.message : fallback;
}


export function createAttachementsController(deps: AttachementsDeps): AttachementsController {
    const request = deps.request ?? fetch;
    const send = deps.upload ?? uploadFile;

    let items = $state<TestCaseAttachmentDto[]>([]);
    let uploads = $state<UploadItem[]>([]);
    let seq = 0;
    let error = $state('');
    const removing = new Set<string>();

    const baseUrl = () => `/api/test-cases/${deps.getTestCaseId()}/attachments`;

    async function load(): Promise<void> {
        try {
            const res = await request(baseUrl());

            if (!res.ok) throw new Error('Не удалось загрузить вложения');

            items = ((await res.json()) as ListTestCaseAttachmentsResponseDto).items;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось загрузить вложения';
        }
    }

    async function remove(item: TestCaseAttachmentDto): Promise<void> {
        if (removing.has(item.id)) return;

        removing.add(item.id);
        error = '';

        try {
            const res = await request(`${baseUrl()}/${item.id}`, { method: 'DELETE' });

            if (!res.ok) throw new Error(await readMessage(res, 'Не удалось удалить вложение'));

            items = items.filter((i) => i.id !== item.id);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось удалить вложение';
        } finally {
            removing.delete(item.id);
        }
    }

    function setProgress(key: string, progress: number) {
        uploads = uploads.map((u) => (u.key === key ? { ...u, progress } : u));
    }

    async function uploadOne(entry: UploadItem, file: File): Promise<void> {
        try {
            const result = await send(baseUrl(), file, (p) => setProgress(entry.key, p));

            if (result.status === 413) {
                throw new Error(`Файл "${file.name}" больше 5 МБ`);
            }

            if (result.status >= 400) {
                const message = (result.body as { message?: unknown }).message;

                throw new Error(typeof message === 'string' ? message : `Не удалось загрузить "${file.name}"`);
            }

            items = [...items, result.body as TestCaseAttachmentDto];
        } catch (e) {
            error = e instanceof Error ? e.message : `Не удалось загрузить "${file.name}"`;
        } finally {
            uploads = uploads.filter((u) => u.key !== entry.key);
        }
    }

    async function upload(files: File[]): Promise<void> {
        error = '';

        const queue: { entry: UploadItem, file: File }[] = [];
        const problems: string[] = [];

        for (const file of files) {
            const problem = validateFile(file);

            if (problem) {
                problems.push(problem);
                continue;
            }

            queue.push({ entry: { key: `u${++seq}`, name: file.name, progress: 0 }, file });
        }

        if (problems.length > 0) error = problems.join('. ');

        uploads = [...uploads, ...queue.map((q) => q.entry)];

        for (const { entry, file } of queue) {
            await uploadOne(entry, file);
        }
    }
    
    return {
        get items() {
            return items;
        },
        get uploads() {
            return uploads;
        },
        get error() {
            return error;
        },
        load,
        upload,
        remove,
    }
}