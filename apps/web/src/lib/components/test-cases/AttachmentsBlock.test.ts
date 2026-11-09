import type { TestCaseAttachmentDto } from "@tms/contracts";
import type { ComponentProps } from "svelte";
import AttachmentsBlock from "./AttachmentsBlock.svelte";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

const attachment = (overrides: Partial<TestCaseAttachmentDto> = {}): TestCaseAttachmentDto => ({
    id: 'a1',
    testCaseId: 'tc1',
    fileId: 'f1',
    filename: 'screenshot.png',
    mime:'image/png',
    size: 1536,
    createdAt: '2026-01-01T00:00:000.000Z',
    ...overrides
});

function setup(props: Partial<ComponentProps<typeof AttachmentsBlock>> = {}) {
    const handlers = { onUpload: vi.fn(), onRemove: vi.fn() };

    const view = render(AttachmentsBlock, { props: { items: [], ...handlers, ...props }});

    return { ...handlers, ...view };
}

describe('AttachmentsBlock: список', () => {
    it('без файлов пишет, что их нет', () => {
        setup();

        expect(screen.getByText('Файлов пока нет')).toBeInTheDocument();
    });

    it('показывает имя и размер файла', () => {
        setup({ items: [attachment() ]});

        expect(screen.getByText('screenshot.png' )).toBeInTheDocument();
        expect(screen.getByText('1,5 КБ')).toBeInTheDocument();
        expect(screen.queryByText('Файлов пока нет')).toBeNull();
    });

    it('рисует иконку по типу файла', () => {
        setup({ items: [attachment()] });

        expect(screen.getByText('image')).toBeInTheDocument();
    });

    it('у списка с вложениями есть счетчик вложений', () => {
        setup({ items: [attachment()] });

        expect(screen.getByRole('heading', { name: 'Вложения (1)' })).toBeInTheDocument();
    });

    it('у списка без вложений нет счетчика вложений', () => {
        setup();

        expect(screen.getByRole('heading', { name: 'Вложения' })).toBeInTheDocument();
    });
});

describe('AttachmentsBlock: скачать и удалить', () => {
    it('ссылка "Скачать" ведет на файл и подсказывает имя', () => {
        setup({ items: [attachment()] });
        const link = screen.getByRole('link', { name: 'Скачать screenshot.png' });

        expect(link).toHaveAttribute('href', '/api/files/f1');
        expect(link).toHaveAttribute('download', 'screenshot.png');
    });

    it('кнопка "Удалить" передает вложение наружу', async () => {
        const { onRemove } = setup({ items: [attachment()] });

        await fireEvent.click(screen.getByRole('button', { name: 'Удалить screenshot.png' }));

        expect(onRemove).toHaveBeenCalledWith(attachment());
    });
});