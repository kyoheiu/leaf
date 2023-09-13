<script lang="ts">
	import ArticleCard from '$lib/ArticleCard.svelte';
	import Header from '$lib/Header.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	console.log(data);
</script>

<svelte:head>
	<title>leaf</title>
</svelte:head>
<Header />
<main class="bg-itembackground flex min-h-screen flex-col items-center">
	q: {data.query}
	{#if data.result}
		{#each data.result as item}
			<ArticleCard article={item} />
		{/each}
	{/if}
</main>
