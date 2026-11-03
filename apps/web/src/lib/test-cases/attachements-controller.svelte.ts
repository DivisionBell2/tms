import type { TestCaseAttachmentDto } from "@tms/contracts";
import type { UploadItem } from "./attachements";

export interface AttachementsDeps {
    getTestCaseId: () => string;
}

export interface AttachementsController {
    readonly items: TestCaseAttachmentDto[];
    readonly uploads: UploadItem[];
    readonly error: string;
    load: () => Promise<void>;
    upload: (files: File[]) => Promise<void>;
    remove: (item: TestCaseAttachmentDto) => Promise<void>;
}

// Заглушка
export function createAttachementsController(_deps: AttachementsDeps): AttachementsController {
    return {
        get items() {
            return [];
        },
        get uploads() {
            return [];
        },
        get error() {
            return '';
        },
        load: async () => {},
        upload: async () => {},
        remove: async () => {},
    }
}