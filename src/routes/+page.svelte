<script lang="ts">
	import ArticleCard from '$lib/ArticleCard.svelte';
	import { ElementKind, type ArticleData } from '$lib/types';
	import '../app.css';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>leaf</title>
</svelte:head>
<main class="bg-itembackground flex min-h-screen flex-col items-center">
	{#each data.result as item}
		<ArticleCard article={item} kind={ElementKind.Top} />
	{/each}
</main>
