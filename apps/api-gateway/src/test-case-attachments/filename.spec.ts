import { decodeFilename } from "./filename";

describe('decodeFilename', () => {
    it('чинит кириллицу, которую multer прочитал как latin1', () => {
        const mangled = Buffer.from('Скриншот ошибки.png', 'utf8').toString('latin1');

        expect(decodeFilename(mangled)).toBe('Скриншот ошибки.png');
    });

    it('латиницу и цифры не меняет', () => {
        expect(decodeFilename('report-2026.pdf')).toBe('report-2026.pdf');
    });
});