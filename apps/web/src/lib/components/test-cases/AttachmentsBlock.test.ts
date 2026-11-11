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

describe('AttachmentsBlock: загрузка', () => {
    it('показывает строку для каждого файла в очереди', () => {
        setup({
            uploads: [
                { key: 'u1', name: 'one.txt', progress: 10 },
                { key: 'u2', name: 'two.txt', progress: 0 }
            ]
        });

        expect(screen.getByText('one.txt')).toBeInTheDocument();
        expect(screen.getByText('two.txt')).toBeInTheDocument();
        expect(screen.getByText('10%')).toBeInTheDocument();
    });

    it('показывает ошибку', () => {
        setup({ error: 'Файл "a.txt" пустой' });

        expect(screen.getByRole('alert')).toHaveTextContent('Файл "a.txt" пустой');
    });

    it('пока идет загрузка, в зоне пишет сколько файлов в очереди', async () => {
        setup({
            uploads: [
                { key: 'u1', name: 'one.txt', progress: 10 },
                { key: 'u2', name: 'two.txt', progress: 0 }
            ]
        });

        expect(screen.getByText('Загрузка (2)')).toBeInTheDocument();
        expect(screen.queryByText(/Перетащите сюда файлы/)).toBeNull();
    });

    it('без очереди в зоне прежняя подсказка, а не "Загрузка"', () => {
        setup();
        expect(screen.getByText(/Перетащите сюда файлы/)).toBeInTheDocument();
        expect(screen.queryByText(/Загрузка/)).toBeNull();
    });
});

const zone = () => screen.getByRole('button', { name: 'Прикрепить файлы' });
const file = (name = 'a.txt') => new File(['x'], name, { type: 'text/plain' });

describe('AttachmentsBlock: выбор файлов', () => {
    it('drop передает файлы наружу', async () => {
        const { onUpload } = setup();
        const dropped = file();

        await fireEvent.drop(zone(), { dataTransfer: { files: [dropped] } });

        expect(onUpload).toHaveBeenCalledWith([dropped])
    });

    it('drop без файлов ничего не вызывает', async () => {
        const { onUpload } = setup();

        await fireEvent.drop(zone(), { dataTransfer: { files: [] }});

        expect(onUpload).not.toHaveBeenCalled();
    });

    it('при перетаскивании над зоной включается подсветка, при уходе - выключается', async () => {
        setup();

        await fireEvent.dragOver(zone());
        expect(zone()).toHaveClass('over');

        await fireEvent.dragLeave(zone());
        expect(zone()).not.toHaveClass('over');
    });

    it('выбор через диалог передает файлы наружу', async () => {
        const { onUpload, container } = setup();
        const picked = file('picked.txt');
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        await fireEvent.change(input, { target: { files: [picked] } });

        expect(onUpload).toHaveBeenCalledWith([picked]);
    });

    it('клик по зоне открывает диалог выбора', async () => {
        const { container } = setup();
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const click = vi.spyOn(input, 'click');

        await fireEvent.click(zone());

        expect(click).toHaveBeenCalled();
    });

    it('enter и пробел открывают диалог выбора', async () => {
        const { container } = setup();
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const click = vi.spyOn(input, 'click');

        await fireEvent.keyDown(zone(), { key: 'Enter' });
        await fireEvent.keyDown(zone(), { key: ' ' });
        await fireEvent.keyDown(zone(), { key: 'a' });

        expect(click).toHaveBeenCalledTimes(2);
    });
});