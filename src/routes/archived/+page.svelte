<script lang="ts">
	import ArticleCard from '$lib/ArticleCard.svelte';
	import Header from '$lib/Header.svelte';
	import Nav from '$lib/Nav.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>leaf</title>
</svelte:head>
<Header />
<main class="bg-itembackground flex min-h-screen flex-col items-center">
	/Archived
	{#if data.result}
		{#each data.result as item}
			<ArticleCard article={item} />
		{/each}
	{/if}
	<Nav prev={data.prev} next={data.next} />
</main>
