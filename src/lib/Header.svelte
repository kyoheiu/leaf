<script lang="ts">
	import { goto } from '$app/navigation';
	import { SearchOutline, BarsOutline } from 'flowbite-svelte-icons';
	import toast, { Toaster } from 'svelte-french-toast';

	// h-10
	export const LOGO_SIZE = 40;
	// h-8
	export const MINI_LOGO_SIZE = 32;

	let url = '';
	let query = '';
	let loading = false;
	let searchOpen = false;
	let showMenu = false;

	const execSearch = async (e) => {
		e.preventDefault();
		if (query.trim().length === 0) {
			return;
		} else {
			const q = query.split(/(\s+)/).filter((x) => x.trim().length > 0)[0];
			searchOpen = false;
			goto(`/search?q=${q}`);
		}
	};

	const createNew = async (e): Promise<void | string> => {
		loading = true;
		e.preventDefault();
		const res = await fetch('/api/articles', {
			method: 'POST',
			body: url
		});
		if (!res.ok) {
			const message = await res.text();
			toast.error(`Error: ${message}`);
			loading = false;
		} else {
			goto('/');
		}
	};
</script>

<svelte:head>
	<title>leaf</title>
</svelte:head>
<Toaster />
<div class="mt-3 flex flex-nowrap items-center justify-between">
	<a class="pr-1" href="/">
		<img src="/logo.png" alt="leaf" height={MINI_LOGO_SIZE} width={MINI_LOGO_SIZE} />
	</a>
	&nbsp;
	<form on:submit={createNew}>
		<input
			class="w-5/6 flex-auto rounded-md border border-slate-500 p-1 text-sm text-gray-900"
			id={'add_new'}
			type="url"
			bind:value={url}
			placeholder="+"
		/>
	</form>
	<button class="ml-auto" on:click={() => (searchOpen = !searchOpen)} title="search">
        search
	</button>
	<div class="relative">
		<button on:click={() => showMenu = !showMenu} class="ml-3" title="menu">
menu
		</button>
		{#if showMenu}
			<div
				class=" absolute right-0 top-8 flex w-32 flex-col items-end space-y-3 rounded border bg-slate-50 p-2 text-sm drop-shadow-2xl"
			>
				<a class="no-underline" href="/api/download"> Download JSON </a>
				<a class="no-underline" href="https://github.com/kyoheiu/leaf" target="_blank">
					Source code
				</a>
			</div>
		{/if}
	</div>
</div>
{#if searchOpen}
	<form on:submit={(e) => execSearch(e)} class="mt-3 flex justify-end">
		<input
			id="search"
			type="text"
			bind:value={query}
			placeholder="search"
			class="mb-2 w-3/5 rounded-md border border-slate-500 p-1 text-sm text-gray-900"
			autoFocus
		/>
	</form>
{/if}
