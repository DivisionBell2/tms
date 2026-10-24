import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "svelte";
import SectionRow from "$lib/components/test-cases/SectionRow.svelte";
import { fireEvent, render, screen } from "@testing-library/svelte";
import type { SectionNode } from "$lib/test-cases/sections";
import { makeSection } from "$lib/test-cases/sections.fixtures";

const node = (overrides: Partial<SectionNode> = {}): SectionNode => ({
    ...makeSection('s1', 'Регресс'),
    children: [],
    ...overrides
});

function setup(props: Partial<ComponentProps<typeof SectionRow>> = {}) {
    const handlers = { onToggle: vi.fn(), onSelect: vi.fn(), onTogglePin: vi.fn() };

    render(SectionRow, {
        props: { node: node(), depth: 0, colspan: 7, expanded: false, ...handlers, ...props }
    });

    return handlers;
}

const row = () => screen.getByRole('button', { name: /Регресс/ });

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('SectionRow: содержимое', () => {
    it('показывает имя раздела', () => {
        setup();

        expect(screen.getByText('Регресс')).toBeTruthy();
    });

    it('показывает путь вместо имени, если передан label', () => {
        setup({ label: 'Регресс / Оплата' });

        expect(screen.getByText('Регресс / Оплата')).toBeTruthy();
        expect(screen.queryByText('Регресс')).toBeNull();
    });

    it('сообщает о состоянии: aria-expanded и aria-selected', () => {
        setup({ expanded: true, selected: true });

        expect(row()).toHaveAttribute('aria-expanded', 'true');
        expect(row()).toHaveAttribute('aria-selected', 'true');
    });

    it('по умолчанию не выбран и не загружается', () => {
        setup();

        expect(row()).toHaveAttribute('aria-selected', 'false');
        expect(screen.queryByText('загрузка...')).toBeNull();
    });

    it('при загрузке пишет «загрузка…»', () => {
        setup({ loading: true });

        expect(screen.queryByText('загрузка...')).toBeTruthy();
    });
});

describe('SectionRow: булавка', () => {
    it('у незакрепленного раздела предлагает закрепить', () => {
        setup();

        const pin = screen.getByRole('button', { name: 'Закрепить раздел' });

        expect(pin).toHaveAttribute('aria-pressed', 'false');
    });

    it('у закрепленного раздела предлагает открепить', () => {
        setup({ node: node({ isPinned: true }) });

        const pin = screen.getByRole('button', { name: 'Открепить раздел' });

        expect(pin).toHaveAttribute('aria-pressed', 'true');
    });

    it('клик по булавке закрепляет, но не подсвечивает раздел', async () => {
        const { onTogglePin, onSelect, onToggle } = setup();

        await fireEvent.click(screen.getByRole('button', { name: 'Закрепить раздел' }));
        vi.advanceTimersByTime(1000);

        expect(onTogglePin).toHaveBeenCalledTimes(1);
        expect(onSelect).not.toHaveBeenCalled();
        expect(onToggle).not.toHaveBeenCalled();
    });
});

describe('SectionRow: шеврон и клавиатура', () => {
    it('клик по шеврону разворачивает раздел', async () => {
        const { onToggle, onSelect } = setup();

        await fireEvent.click(screen.getByRole('button', { name: 'Развернуть раздел' }));
        vi.advanceTimersByTime(1000);

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onToggle).not.toHaveBeenCalled();
    });

    it('у развернутого раздела шеврон предлагает свернуть', () => {
        setup({ expanded: true });

        expect(screen.getByRole('button', { name: 'Свернуть раздел' })).toBeTruthy();
    });

    it('Enter и пробел делают то же, что двойной клик; другие клавиши - ничего', async () => {
        const { onToggle } = setup();

        await fireEvent.keyDown(row(), { key: 'Enter' });
        await fireEvent.keyDown(row(), { key: ' ' });
        await fireEvent.keyDown(row(), { key: 'a' });

        expect(onToggle).toHaveBeenCalledTimes(2);
    });
});

describe('SectionRow: одиночный и двойной клик', () => {
    it('одиночный клик подсвечивет не сразу, а через 250 мс', async () => {
        const { onSelect } = setup();

        await fireEvent.click(screen.getByText('Регресс'));

        vi.advanceTimersByTime(249);
        expect(onSelect).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('двойной клик разворачивает и отменяет отложенную подсветку', async () => {
        const { onToggle, onSelect } = setup();
        const name = screen.getByText('Регресс');

        await fireEvent.click(name);
        await fireEvent.click(name);
        await fireEvent.dblClick(name);
        vi.advanceTimersByTime(1000);

        expect(onToggle).toHaveBeenCalledTimes(1);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('два одиночных клика с паузой дают две подсветки', async () => {
        const { onSelect } = setup();
        const name = screen.getByText('Регресс');

        await fireEvent.click(name);
        vi.advanceTimersByTime(300);
        await fireEvent.click(name);
        vi.advanceTimersByTime(300);

        expect(onSelect).toHaveBeenCalledTimes(2);
    });
});