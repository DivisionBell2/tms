export interface UploadItem {
    key: string;
    name: string;
    progress: number;
}

// Заглушка
export function validateFile(_file: File): string | null {
    return null;
}