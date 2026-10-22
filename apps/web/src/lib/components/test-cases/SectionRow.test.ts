import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import SectionRow from './SectionRow.svelte';

describe('SectionRow', () => {
    it('показывает имя раздела', () => {
        render(SectionRow, {
            props: {
                node: {
                    id: 's1',
                    name: 'Регресс',
                    parentId: null,
                    isPinned: false,
                    createdAt: '2026-01-01T00:00:00.000Z',
                    updatedAt: '2026-01-01T00:00:00.000Z',
                    children: []
                },
                depth: 0,
                colspan: 7,
                expanded: false,
                onToggle: () => {},
                onSelect: () => {},
                onTogglePin: () => {}
            }
        });

        expect(screen.getByText('Регресс')).toBeTruthy();
    });
});