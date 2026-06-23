<script lang="ts">
	import AccountSettings from '$lib/components/AccountSettings.svelte';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import Card from '$lib/components/Card.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import ProfileHeader from '$lib/components/ProfileHeader.svelte';
	import { currentUser } from '$lib/stores/authStore';

    let user = $derived($currentUser);
</script>

<Card>
    {#if user}
        <ProfileHeader {user} onSaved={(u) => currentUser.set(u)} />
	    <AvatarUpload {user} onUploaded={(u) => currentUser.set(u)} />
        <AccountSettings {user} onEmailChanged={(u) => currentUser.set(u)} />
    {/if}
	
{#snippet row(item)}
	<div>{item}</div>
{/snippet}
<DataTable
	columns={[
		{ key: 'col1', label: 'колонка 1' },
		{ key: 'col2', label: 'колонка 2' },
		{ key: 'col3', label: 'колонка 3' }
	]}
	rows={['строка 1', 'строка 2', 'строка 3']}
	page={1}
	pageSize={10}
	total={0}
	{row}
/>
</Card>
