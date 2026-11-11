<script lang="ts">
    interface Props {
        name: string;
        progress: number;
    }

    let { name, progress }: Props = $props();
</script>

<span>{name}</span>
<span>{progress}%</span>