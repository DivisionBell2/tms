import type { ListTestCaseAttachmentsResponseDto, TestCaseAttachmentDto } from "@tms/contracts";
import type { UploadItem } from "./attachements";

export interface AttachementsDeps {
    getTestCaseId: () => string;
    request?: typeof fetch;
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

    let items = $state<TestCaseAttachmentDto[]>([]);
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

    return {
        get items() {
            return items;
        },
        get uploads() {
            return [];
        },
        get error() {
            return error;
        },
        load,
        upload: async () => {},
        remove,
    }
}