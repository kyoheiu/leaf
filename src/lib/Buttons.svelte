<script lang="ts">
	import { goto } from '$app/navigation';
	import { Action } from '$lib/types';
	import { Heart, ArchiveBox, Trash } from 'phosphor-svelte';
	import LinkButton from './LinkButton.svelte';

	const ICON_SIZE = 20;

	export let id: string;
	export let url: string;
	export let liked: number;
	export let archived: number;

	const toggleLiked = async () => {
		const res = await fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: id, action: Action.ToggleLiked, current: liked })
		});
		if (!res.ok) {
			console.error(await res.text());
		}
		liked = 1 - liked;
	};

	const toggleArchived = async () => {
		const res = await fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: id,
				action: Action.ToggleArchived,
				current: archived
			})
		});
		if (!res.ok) {
			console.error(await res.text());
		}
		archived = 1 - archived;
	};

	const deleteArticleContent = async () => {
		const res = await fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: id, action: Action.Delete })
		});
		if (!res.ok) {
			console.error(await res.text());
		} else {
			goto('/');
		}
	};
</script>

<div class="flex justify-evenly space-x-4">
	<LinkButton {url} />
	<button on:click={toggleLiked}
		>{#if liked}
			<Heart weight="fill" class="text-heart" size={ICON_SIZE} />
		{:else}
			<Heart size={ICON_SIZE} />
		{/if}
	</button>
	<button on:click={toggleArchived}>
		{#if archived}
			<ArchiveBox weight="fill" size={ICON_SIZE} />
		{:else}
			<ArchiveBox size={ICON_SIZE} />
		{/if}
	</button>
	<button on:click={deleteArticleContent}><Trash size={ICON_SIZE} /></button>
</div>
