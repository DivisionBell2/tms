<script lang="ts">
	import AccountSettings from '$lib/components/profile/AccountSettings.svelte';
	import AvatarUpload from '$lib/components/profile/AvatarUpload.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ProfileHeader from '$lib/components/profile/ProfileHeader.svelte';
	import { currentUser } from '$lib/stores/authStore';

    let user = $derived($currentUser);
</script>

{#if user}
	<div class="profile">
		<Card>
			
				<ProfileHeader {user} onSaved={(u) => currentUser.set(u)} />
				<AvatarUpload {user} onUploaded={(u) => currentUser.set(u)} />
				<AccountSettings {user} onEmailChanged={(u) => currentUser.set(u)} />
		</Card>
	</div>
{/if}

<style>
	.profile {
	  max-width: 50rem;
	  margin: 0 auto;
	}
</style>