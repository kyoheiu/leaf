<script lang="ts">
	import { Plus, X, TagSimple } from 'phosphor-svelte';
	import { toastError } from './toast';
	import logger from './logger';

	const ICON_SIZE = 16;

	export let tags: string[];
	export let id: string;

	let newTag = '';
	let isOpen = false;

	const submitTag = async (e: Event) => {
		e.preventDefault();
		const res = await fetch(`/api/tag`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: id, tag: newTag })
		});
		if (!res.ok) {
			const message = await res.text();
			logger.error(message);
			toastError(message);
		} else {
			tags = [...tags, newTag.toLowerCase()];
		}
		newTag = '';
		isOpen = false;
	};

	const deleteTag = async (tag: string) => {
		const res = await fetch(`/api/tag`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: id, tag: tag })
		});
		if (!res.ok) {
			const message = await res.text();
			logger.error(message);
			toastError(message);
		} else {
			const updated = tags.filter((x) => x !== tag);
			tags = updated;
		}
		newTag = '';
		isOpen = false;
	};
</script>

<div class="flex flex-wrap items-top">
	{#if tags && tags.length !== 0}
		{#each tags as x}
			<div
				class="h-6 mr-2 mb-1 flex items-center rounded-full border border-bordercolor px-2 text-xs"
			>
				<a class="mr-2 text-xs no-underline" href={`/tag/${x}`}>
					<TagSimple size={ICON_SIZE} class="inline" />&nbsp;{x}
				</a>
				<button on:click={() => deleteTag(x)}>
					<X size={ICON_SIZE} />
				</button>
			</div>
		{/each}
	{/if}
	<button
		class="h-6 rounded-full border border-bordercolor px-2 text-xs"
		on:click={() => (isOpen = !isOpen)}
		title="add new tag"
	>
		{#if tags.length === 0}
			<TagSimple size={ICON_SIZE} class="inline" />&nbsp;+
		{:else}
			<Plus size={ICON_SIZE} />
		{/if}
	</button>
</div>
{#if isOpen}
	<form on:submit={(e) => submitTag(e)} class="m-2 flex justify-start">
		<input
			bind:value={newTag}
			placeholder="Add new tag"
			class="w-3/4 rounded-full py-1 px-3 text-sm border border-bordercolor"
		/>
	</form>
{/if}
