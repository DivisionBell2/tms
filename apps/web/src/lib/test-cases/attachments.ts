import { MAX_ATACHMENT_SIZE } from "@tms/contracts";

export interface UploadItem {
    key: string;
    name: string;
    progress: number;
}

const SIZE_UNITS = ['Б', 'КБ', 'МБ'];

export function formatFileSize(bytes: number): string {
    let value = bytes;
    let unit = 0;

    while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
        value /= 1024;
        unit += 1;
    }

    const text = String(Math.round(value * 10) / 10).replace('.', ',');

    return `${text} ${SIZE_UNITS[unit]}`;
}

export function fileIcon(mime: string): string {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'movie';
    if (mime === 'application/pdf') return 'picture_as_pdf';
    if (mime.includes('zip') || mime.includes('compressed')) return 'folder_zip';
    if (mime.startsWith('text/csv')) return 'table_chart';
    if (mime.startsWith('application/vnd')) return 'table_chart';
    if (mime.startsWith('text/')) return 'description';
    if (mime.startsWith('audio/')) return 'audio_file';

    return 'draft';
}

// Заглушка
export function validateFile(file: Pick<File, 'name' | 'size'>): string | null {
    if (file.size === 0) {
        return `Файл "${file.name}" пустой`;
    }

    if (file.size > MAX_ATACHMENT_SIZE) {
        return `Файл "${file.name}" больше ${formatFileSize(MAX_ATACHMENT_SIZE)}`;
    }

    return null;
}