<script lang="ts">
	import { MagnifyingGlass, DotsThreeVertical } from 'phosphor-svelte';
	import Spinner from './Spinner.svelte';
	import { Action } from './types';
	import { toastError } from './toast';

	const ICON_SIZE = 24;

	let url = '';
	let loading = false;
	let searchOpen = false;
	let showMenu = false;

	const createNew = async (e: Event): Promise<void | string> => {
		loading = true;
		e.preventDefault();
		const res = await fetch('/api/article', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: '', action: Action.Create, url: url })
		});
		url = '';
		if (!res.ok) {
			const message = await res.text();
			toastError(`Error: ${message}`);
			loading = false;
		} else {
			window.location.reload();
		}
	};
</script>

<svelte:head>
	<title>leaf</title>
</svelte:head>
<div class="flex relative flex-nowrap justify-between items-center mt-3">
	<a class="pr-1" href="/">
		<div class="w-7 h-7">
			<img src="/logo.png" alt="leaf" width="auto" height="auto" />
		</div>
	</a>
	&nbsp;
	{#if loading}
		<Spinner />
	{:else}
		<form on:submit={createNew}>
			<input
				class="flex-auto px-3 py-1 w-5/6 text-sm rounded-full border border-bordercolor"
				id={'add_new'}
				type="url"
				bind:value={url}
				placeholder="Add new URL"
			/>
		</form>
	{/if}
	<button class="ml-auto" on:click={() => (searchOpen = !searchOpen)} title="search">
		<MagnifyingGlass size={ICON_SIZE} />
	</button>
	<button on:click={() => (showMenu = !showMenu)} class="ml-3" title="menu">
		<DotsThreeVertical size={ICON_SIZE} />
	</button>
	{#if showMenu}
		<div
			class="flex absolute right-0 top-8 flex-col items-end p-2 space-y-3 w-32 text-sm rounded border drop-shadow-2xl bg-slate-50"
		>
			<a class="no-underline" href="/liked">Liked</a>
			<a class="no-underline" href="/archived">Archived</a>
			<a class="no-underline" href="/tags">Tags</a>
			<a class="no-underline" href="/api/download" download> Download JSON </a>
			<a class="no-underline" href="https://github.com/kyoheiu/leaf" target="_blank">
				Source code
			</a>
		</div>
	{/if}
</div>
{#if searchOpen}
	<form action="/search" class="flex justify-end mt-3">
		<input
			id="search"
			type="text"
			name="q"
			placeholder="search"
			class="px-3 py-1 w-3/5 text-sm rounded-full border border-bordercolor"
		/>
	</form>
{/if}
