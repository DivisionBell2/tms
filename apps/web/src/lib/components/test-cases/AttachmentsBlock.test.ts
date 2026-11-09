import type { TestCaseAttachmentDto } from "@tms/contracts";
import type { ComponentProps } from "svelte";
import AttachmentsBlock from "./AttachmentsBlock.svelte";
import { render, screen } from "@testing-library/svelte";
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

    const view = render(AttachmentsBlock, { props: { items: [], ...handlers, ...props }})
}

describe('AttachmentsBlock: список', () => {
    it('без файлов пишет, что их нет', () => {
        setup();

        expect(screen.getByText('Файлов пока нет')).toBeInTheDocument();
    })
})