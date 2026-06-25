<script lang="ts">
	import type { CreateTestCaseRequestDto } from "@tms/contracts";

    type NewTestCase = Omit<CreateTestCaseRequestDto, 'authorId'>;

    interface Props {
        open: boolean;
        onClose: () => void;
        onCreate: (data: NewTestCase) => Promise<void>;
    }

    let { open, onClose, onCreate }: Props = $props();
</script>
<div> create test case modal</div>
<style></style>