import { describe, expect, it } from "vitest";
import { fileIcon, formatFileSize, validateFile } from "./attachments";
import { MAX_ATACHMENT_SIZE } from "@tms/contracts";

describe('validateFile', () => {
    it('отклоняет пустой файл', () => {
        expect(validateFile({ name: 'a.png', size: 0 })).toBe('Файл "a.png" пустой');
    });

    it('отклоняет файл больше лимита и называет лимит', () => {
        expect(validateFile({ name: 'big.zip', size: MAX_ATACHMENT_SIZE + 1 })).toBe('Файл "big.zip" больше 5 МБ');
    });

    it('пропускает обычный файл', () => {
        expect(validateFile({ name: 'a.png', size: 100 })).toBeNull();
    });

    it('пропускает файл ровно в лимит', () => {
        expect(validateFile({ name: 'a.png', size: MAX_ATACHMENT_SIZE})).toBeNull();
    });
});

describe('formatFileSize', () => {
    it('до килобайта показывает байты', () => {
        expect(formatFileSize(0)).toBe('0 Б');
        expect(formatFileSize(1023)).toBe('1023 Б');
    });

    it('переходит в килобайты с одним знаком и запятой', () => {
        expect(formatFileSize(1024)).toBe('1 КБ');
        expect(formatFileSize(1536)).toBe('1,5 КБ');
    });

    it('переходит в мегабайты', () => {
        expect(formatFileSize(MAX_ATACHMENT_SIZE)).toBe('5 МБ');
        expect(formatFileSize(1024 * 1024 * 2.25)).toBe('2,3 МБ');
    });
});

describe('fileIcon', () => {
    it.each([
        ['image/png', 'image'],
        ['video/mp4', 'movie'],
        ['application/pdf', 'picture_as_pdf'],
        ['application/zip', 'folder_zip'],
        ['text/plain', 'description'],
        ['application/octet-stream', 'draft'],
        ['audio/mpeg', 'audio_file'],
        ['audio/wav', 'audio_file'],
        ['text/csv', 'table_chart'],
        ['application/vnd.ms-excel', 'table_chart'],
        ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'table_chart'],
    ])('для %s берет иконку %s', (mime, icon) => {
        expect(fileIcon(mime)).toBe(icon);
    })
})