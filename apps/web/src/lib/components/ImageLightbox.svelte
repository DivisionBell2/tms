<script lang="ts">
	import { closeLightbox, lightboxSrc } from "$lib/stores/lightboxStore";

    function onKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    }
</script>

<svelte:window onkeydown={onKeydown} />

{#if $lightboxSrc}
    <div
        class="overlay"
        role="button"
        tabindex="0"
        aria-label="Закрыть"
        onclick={closeLightbox}
        onkeydown={(e) => (e.key === 'Enter' ? closeLightbox() : null)}
    >
        <img class="zoomed" src={$lightboxSrc} alt="" />
    </div>
{/if}

<style>
    .overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        cursor: zoom-out;
        border: none;
        padding: var(--space-lg);
    }

    .zoomed {
        max-width: 100%;
        max-height: 90vh;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-2);
        object-fit: contain;
    }
</style>