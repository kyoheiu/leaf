<script lang="ts">
	import { goto } from '$app/navigation';
	import { Action } from '$lib/types';
	import LinkButton from './LinkButton.svelte';
	import { toastError } from './toast';
	import logger from './logger';
	import ArchiveBoxFilled from './buttons/ArchiveBoxFilled.svelte';
	import ArchiveBox from './buttons/ArchiveBox.svelte';
	import HeartFilled from './buttons/HeartFilled.svelte';
	import Heart from './buttons/Heart.svelte';
	import Trash from './buttons/Trash.svelte';

	export let id: string;
	export let url: string;
	export let title: string;
	export let liked: number;
	export let archived: number;

	const toggleLiked = async () => {
		const res = await fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: id,
				url: url,
				title: title,
				action: Action.ToggleLiked,
				current: liked
			})
		});
		if (!res.ok) {
			logger.error(await res.text());
			toastError(`Error:\n${res.statusText}`);
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
				url: url,
				title: title,
				action: Action.ToggleArchived,
				current: archived
			})
		});
		if (!res.ok) {
			logger.error(await res.text());
			toastError(`Error:\n${res.statusText}`);
		}
		archived = 1 - archived;
	};

	const deleteArticleContent = async () => {
		const res = await fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: id, url: url, title: title, action: Action.Delete })
		});
		if (!res.ok) {
			logger.error(await res.text());
			toastError(`Error:\n${res.statusText}`);
		} else {
			goto('/');
		}
	};
</script>

<div class="flex justify-evenly space-x-4">
	<LinkButton {url} size={32} />
	<button on:click={toggleLiked}
		>{#if liked}
			<HeartFilled />
		{:else}
			<Heart />
		{/if}
	</button>
	<button on:click={toggleArchived}>
		{#if archived}
			<ArchiveBoxFilled />
		{:else}
			<ArchiveBox />
		{/if}
	</button>
	<button on:click={deleteArticleContent}><Trash /></button>
</div>
