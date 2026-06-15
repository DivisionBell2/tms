<script lang="ts">
	import { goto } from "$app/navigation";
	import { currentUser } from "$lib/stores/authStore";
	import { openLightbox } from "$lib/stores/lightboxStore";
	import Button from "./Button.svelte";

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser.set(null);
        await goto('./login');
    }

    function avatarUrl(fieldId: string | null): string | null {
        return fieldId ? `/api/files/${fieldId}` : null;
    }

    function zoomAvatar(fileId: string | null) {
       if (!fileId) return;
       openLightbox(`/api/files/${fileId}`);
    }
</script>

{#if $currentUser}
    <div class="user-menu">
    {#if avatarUrl($currentUser.avatarFileId)}
        <button
            type="button"
            class="avatar-btn"
            aria-label="Увеличь аватар"
            onclick={() => zoomAvatar($currentUser.avatarFileId)}
        >
            <img
                class="avatar"
                src={avatarUrl($currentUser.avatarFileId)}
                alt=""
                width="32"
                height="32"
            />
        </button>
    {:else}
        <span class="icon" aria-hidden="true">account_circle</span>
    {/if}
    <a class="name" href="/profile">{$currentUser?.displayName}</a>
    <Button variant="text" onclick={logout}>
            <span class="icon" aria-hidden="true">logout</span>
    </Button>
    </div>
{/if}

<style>
    .user-menu {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }

    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }

    .name {
        color: var(--text);
        text-decoration: none;
        font-weight: 500;
    }

    .name:hover {
        text-decoration: underline;
    }

    .avatar-btn {
        padding: 0;
        border: none;
        background: none;
        cursor: zoom-in;
        line-height: 0;
    }
</style>