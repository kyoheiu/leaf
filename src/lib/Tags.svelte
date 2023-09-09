<script lang="ts">
	import { CloseOutline, PlusOutline } from 'flowbite-svelte-icons';

	export let tags: string[];
	export let id: string;
	let isOpen = false;

	const submitTag = async (e: any) => {
		e.preventDefault();
		const element = document.getElementById(`${id}_add_tag`);
		const tag = (element as HTMLInputElement).value;
		const res = await fetch(`/api/articles/${id}?kind=add`, {
			method: 'POST',
			body: tag
		});
		if (!res.ok) {
			console.error('Cannot add tag.');
			isOpen = false;
		} else {
			tags = [...tags, tag.toLowerCase()];
			isOpen = false;
		}
	};

	const deleteTag = async (tag: string) => {
		const res = await fetch(`/api/articles/${id}?kind=delete`, {
			method: 'POST',
			body: tag
		});
		if (!res.ok) {
			console.error('Cannot delete tag.');
		} else {
			const updated = tags.filter((x) => x !== tag);
			tags = updated;
		}
	};
</script>

<div class="flex flex-wrap items-center">
	{#if tags.length !== 0}
		{#each tags as x}
			<div
				class="m-1 flex items-center rounded-full border border-gray-200 bg-gray-200 px-2 text-xs text-gray-900"
			>
				<a class="mr-2 px-2 text-xs no-underline" href={`/tags/${x}`}>
					&nbsp;{x}
				</a>
				<button id={`${id}_delete_tag`} on:click={() => deleteTag(x)}>
					<CloseOutline />
				</button>
			</div>
		{/each}
	{/if}
	<button
		class="rounded-full border px-2 text-xs"
		on:click={() => (isOpen = true)}
		title="add new tag"
	>
		<PlusOutline class="inline" />
	</button>
</div>
{#if isOpen}
	<form on:submit={(e) => submitTag(e)} class="m-2 flex justify-start">
		<input
			autoFocus
			id={`${id}_add_tag`}
			placeholder="Add new tag"
			class="w-3/4 rounded-md p-1 text-sm text-gray-900"
		/>
	</form>
{/if}
