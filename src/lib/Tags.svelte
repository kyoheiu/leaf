<script lang="ts">
	import { CloseOutline, PlusOutline } from 'flowbite-svelte-icons';
	import toast, { Toaster } from 'svelte-french-toast';

	export let tags: string[];
	export let id: string;

	let newTag = '';
	let isOpen = false;

	const submitTag = async (e: any) => {
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
			console.error(message);
			toast.error(message);
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
			console.error(message);
			toast.error(message);
		} else {
			const updated = tags.filter((x) => x !== tag);
			tags = updated;
		}
		newTag = '';
		isOpen = false;
	};
</script>

<Toaster />
<div class="flex flex-wrap items-center">
	{#if tags && tags.length !== 0}
		{#each tags as x}
			<div
				class="m-1 flex items-center rounded-full border border-gray-200 bg-gray-200 px-2 text-xs text-gray-900"
			>
				<a class="mr-2 px-2 text-xs no-underline" href={`/tags/${x}`}>
					&nbsp;{x}
				</a>
				<button on:click={() => deleteTag(x)}>
					<CloseOutline />
				</button>
			</div>
		{/each}
	{/if}
	<button
		class="rounded-full border px-2 text-xs"
		on:click={() => (isOpen = !isOpen)}
		title="add new tag"
	>
		<PlusOutline size="xs" class="inline" />
	</button>
</div>
{#if isOpen}
	<form on:submit={(e) => submitTag(e)} class="m-2 flex justify-start">
		<input
			bind:value={newTag}
			placeholder="Add new tag"
			class="w-3/4 rounded-md p-1 text-sm text-gray-900"
		/>
	</form>
{/if}
