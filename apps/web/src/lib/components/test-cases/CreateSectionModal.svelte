<script lang="ts">
	import type { CreateTestCaseSectionRequestDto, TestCaseSectionDto } from "@tms/contracts";

    interface Props {
        open: boolean;
        sections: TestCaseSectionDto[];
        defaultParentId: string | null;
        onClose: () => void;
        onCreate: (data: CreateTestCaseSectionRequestDto) => Promise<void>;
    }

    let { open }: Props = $props();
</script>

{#if open}
<!-- Modal content -->  
{/if}