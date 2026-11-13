import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/svelte";
import UploadProgress from "./UploadProgress.svelte";

describe('UploadProgress', () => {
    it('показывает имя файла и проценты', () => {
        render(UploadProgress, { props: { name: 'log.txt', progress: 40 } });

        expect(screen.getByText('log.txt')).toBeInTheDocument();
        expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('показывает имя файла и проценты при 99%', () => {
        render(UploadProgress, { props: { name: 'log.txt', progress: 99 } });

        expect(screen.getByText('log.txt')).toBeInTheDocument();
        expect(screen.getByText('99%')).toBeInTheDocument();
    });

    it('показывает слово "обработка" при 100%', () => {
        render(UploadProgress, { props: { name: 'log.txt', progress: 100 } });

        expect(screen.getByText('обработка')).toBeInTheDocument();
        expect(screen.queryByText('100%')).not.toBeInTheDocument();
    });

    it('сообщает прогресс вспомогательным технологиям', () => {
        render(UploadProgress, { props: { name: 'log.txt', progress: 40 }});

        const bar = screen.getByRole('progressbar', { name: 'Загрузка log.txt' });

        expect(bar).toHaveAttribute('aria-valuenow', '40');
        expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('ширина заливки равна проценту', () => {
        const { container } = render(UploadProgress, { props: { name: 'log.txt', progress: 65 } });

        expect(container.querySelector('.fill')).toHaveStyle({ width: '65%' });
    });
});