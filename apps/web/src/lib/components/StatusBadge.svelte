<script lang="ts">
	import type { TestCasesStatus } from "@tms/contracts";

    interface Props {
        status: TestCasesStatus;
    }

    let { status }: Props = $props();

    const META: Record<TestCasesStatus, { label: string; icon: string; tone: string }> = {
        draft: { label: 'Черновик', icon: 'edit_note', tone: 'muted' },
        manual: { label: 'Ручное тестирование', icon: 'pan_tool', tone: 'accent' },
        automated: { label: 'Автоматизирован', icon: 'smart_toy', tone: 'success' }
    }

    let meta = $derived(META[status])
</script>

<span class="badge" data-tone={meta.tone}>
    <span class="icon" aria-hidden="true">{meta.icon}</span>
    {meta.label}
</span>

<style>
    .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        font-weight: 500;
    }

    .badge .icon {
        font-size: 1rem;
    }

    .badge[data-tone='muted'] {
        color: var(--text-muted);
    }

    .badge[data-tone='accent'] {
        color: var(--text);
        background: var(--accent);
    }

    .badge[data-tone='success'] {
        color: var(--success);
    }
</style>