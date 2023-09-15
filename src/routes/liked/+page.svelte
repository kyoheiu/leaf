<script lang="ts">
	import ArticleCard from '$lib/ArticleCard.svelte';
	import Header from '$lib/Header.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>leaf</title>
</svelte:head>
<Header />
<main class="bg-itembackground flex min-h-screen flex-col items-center">
	/Liked
	{#if data.result}
		{#each data.result as item}
			<ArticleCard article={item} />
		{/each}
	{/if}
	{#if data.prev}
		<a href={`/?page=${data.prev}`}>PREV PAGE</a>
	{/if}
	{#if data.next}
		<a href={`/?page=${data.next}`}>NEXT PAGE</a>
	{/if}
</main>
