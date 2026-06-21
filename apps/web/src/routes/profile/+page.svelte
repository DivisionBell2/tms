<script lang="ts">
	import AccountSettings from '$lib/components/AccountSettings.svelte';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import Card from '$lib/components/Card.svelte';
	import ProfileHeader from '$lib/components/ProfileHeader.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { currentUser } from '$lib/stores/authStore';

    let user = $derived($currentUser);
</script>

<Card>
    {#if user}
        <ProfileHeader {user} onSaved={(u) => currentUser.set(u)} />
	    <AvatarUpload {user} onUploaded={(u) => currentUser.set(u)} />
        <AccountSettings {user} onEmailChanged={(u) => currentUser.set(u)} />
    {/if}
</Card>
