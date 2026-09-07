<script lang="ts">
	import { TEST_CASE_STATUS_META } from "$lib/test-cases/status";
	import type { TestCaseStatus } from "@tms/contracts";

    interface Props {
        status: TestCaseStatus;
    }

    let { status }: Props = $props();


    let meta = $derived(TEST_CASE_STATUS_META[status]);
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
        border: 1px solid color-mix(in srgb, var(--tone) 40%, var(--bg));
        border-radius: var(--radius-sm);
        background: color-mix(in srgb, var(--tone) 14%, var(--bg));
        color: var(--tone);
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
    }

    .badge .icon {
        font-size: 1rem;
    }

    .badge[data-tone='neutral'] {
        --tone: var(--text-muted);
    }

    .badge[data-tone='info'] {
        --tone: var(--info);
    }

    .badge[data-tone='success'] {
        --tone: var(--success);
    }
</style>