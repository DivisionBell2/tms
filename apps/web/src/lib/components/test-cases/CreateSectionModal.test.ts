import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import type { ComponentProps } from 'svelte';
import CreateSectionModal from './CreateSectionModal.svelte';
import { makeSection } from '$lib/test-cases/sections.fixtures';

const sections = [makeSection('s1', 'Регресс'), makeSection('s2', 'Оплата', 's1')];

function setup(props: Partial<ComponentProps<typeof CreateSectionModal>> = {}) {
    const onClose = vi.fn();
    const onCreate = vi.fn(async () => {});

    const view = render(CreateSectionModal, {
        props: { open: true, sections, onClose, onCreate, ...props }
    });

    return { onClose, onCreate, ...view };
}

const nameInput = () => screen.getByLabelText('Название');
const parentSelect = () => screen.getByLabelText('Родительский раздел');
const submitButton = () => screen.getByRole('button', { name: 'Создать'});

describe('CreateSectionModal', () => {
    it('закрытая модалка ничего не рисует', () => {
        setup({ open: false });

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('кнопка "Cоздать" неактивна, пока название пустое', async () => {
        setup();

        expect(submitButton()).toBeDisabled();

        await fireEvent.input(nameInput(), { target: { value: 'Смоук' }});

        expect(submitButton()).toBeEnabled();
    });

    it('создает корневой раздел: parentId = null, затем закрывается', async () => {
        const { onCreate, onClose } = setup();

        await fireEvent.input(nameInput(), { target: { value: 'Смоук' }});
        await fireEvent.click(submitButton());

        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
        expect(onCreate).toHaveBeenCalledWith({ name: 'Смоук', parentId: null });
    });

    it('создает вложенный раздел: parentId - выбранный раздел', async () => {
        const { onCreate } = setup();

        await fireEvent.input(nameInput(), { target: { value: 'Карты' }});
        await fireEvent.change(parentSelect(), { target: { value: 's2' }});
        await fireEvent.click(submitButton());

        await waitFor(() => expect(onCreate).toHaveBeenCalledWith({ name: 'Карты', parentId: 's2' }));
    });

    it('подставляет defaultParentId в список родителей', async () => {
        setup({ defaultParentId: 's1' });

        await waitFor(() => expect(parentSelect()).toHaveValue('s1'));
    });

    it('при ошибке показывает сообщение внутри модалки, не закрывается и не теряет ввод', async () => {
        const onCreate = vi.fn(async () => {
            throw new Error('Такой раздел уже есть');
        });

        const { onClose } = setup({ onCreate });

        await fireEvent.input(nameInput(), { target: { value: 'Смоук' }});
        await fireEvent.click(submitButton());

        expect(await screen.findByText('Такой раздел уже есть')).toBeTruthy();
        expect(onClose).not.toHaveBeenCalled();
        expect(nameInput()).toHaveValue('Смоук');
    });

    it('"Отмена" закрывает модалку и сбрасывает форму', async () => {
        const { onClose, rerender } = setup();
        await fireEvent.input(nameInput(), { target: { value: 'Смоук' }});
        await fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));

        expect(onClose).toHaveBeenCalledTimes(1);

        await rerender({ open: false });
        await rerender({ open: true });

        expect(nameInput()).toHaveValue('');
    });

    it('закрывается только кнопками: клик мимо не теряет введенное', async () => {
        const { onClose } = setup();

        await fireEvent.input(nameInput(), { target: { value: 'Смоук' }});
        await fireEvent.click(screen.getByRole('dialog').parentElement!);

        expect(onClose).not.toHaveBeenCalled();
        expect(nameInput()).toHaveValue('Смоук');
    });

    it('в списке родителей — пути, а не голые имена', () => {
        setup();

        expect(screen.getByRole('option', { name: 'Регресс' })).toBeTruthy();
        expect(screen.getByRole('option', { name: 'Регресс / Оплата' })).toBeTruthy();
    });
});