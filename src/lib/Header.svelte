<script lang="ts">
	import { MagnifyingGlass, DotsThreeVertical } from 'phosphor-svelte';
	import { Toaster } from 'svelte-french-toast';
	import Spinner from './Spinner.svelte';
	import { Action } from './types';
	import { toastError } from './toast';

	const ICON_SIZE = 24;

	// h-10
	export const LOGO_SIZE = 40;
	// h-8
	export const MINI_LOGO_SIZE = 32;

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
<Toaster />
<div class="mt-3 flex flex-nowrap items-text-top justify-between">
	<a class="pr-1" href="/">
		<img src="/logo.png" alt="leaf" height={MINI_LOGO_SIZE} width={MINI_LOGO_SIZE} />
	</a>
	&nbsp;
	{#if loading}
		<Spinner />
	{:else}
		<form on:submit={createNew}>
			<input
				class="w-5/6 flex-auto rounded-full border border-bordercolor py-1 px-3 text-sm"
				id={'add_new'}
				type="url"
				bind:value={url}
				placeholder="+"
			/>
		</form>
	{/if}
	<button class="ml-auto" on:click={() => (searchOpen = !searchOpen)} title="search">
		<MagnifyingGlass size={ICON_SIZE} />
	</button>
	<button on:click={() => (showMenu = !showMenu)} class="ml-3 relative" title="menu">
		<DotsThreeVertical size={ICON_SIZE} />
	</button>
	{#if showMenu}
		<div
			class=" absolute right-10 top-10 flex w-32 flex-col items-end space-y-3 rounded border bg-slate-50 p-2 text-sm drop-shadow-2xl"
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
	<form action="/search" class="mt-3 flex justify-end">
		<input
			id="search"
			type="text"
			name="q"
			placeholder="search"
			class="mb-2 w-3/5 rounded-full border border-bordercolor py-1 px-3 text-sm"
		/>
	</form>
{/if}
