<script lang="ts">
	import Breadcrumb from '$lib/Breadcrumb.svelte';
	import Header from '$lib/Header.svelte';
	import { ArrowCircleRight } from 'phosphor-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>tags | leaf</title>
</svelte:head>
<Header />
<main class="bg-itembackground flex min-h-screen flex-col items-center">
	<Breadcrumb page="tags" />
	{#if data.result}
		<div class="rounded space-y-2 mt-8">
			{#each data.result as item}
				<div class="rounded flex items-center w-64 hover:bg-sky-200 py-1 px-2">
					<a href={`/tag/${item}`}><ArrowCircleRight class="inline w-12" /></a><a
						href={`/tag/${item}`}><span class="w-48 line-clamp-2 leading-5">{item}</span></a
					>
				</div>
			{/each}
		</div>
	{/if}
</main>
