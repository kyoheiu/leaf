<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.result}
	<div class="sticky top-0 my-3 flex h-8 items-center border-b bg-slate-50">
		<a href="/"> Home </a>
		<div class="ml-auto">buttons</div>
	</div>
	<div class="m-auto w-3/4 text-center text-lg font-semibold leading-6">
		{data.result.title}
	</div>
	<div class="mx-3 mb-6 mt-3 line-clamp-1 text-center text-sm text-gray-400">
		<a href={data.result.url}>{data.result.url}</a>
	</div>
	<div class="mb-6">
		<!-- eslint-disable -->
		{@html data.result.html}
	</div>
	footer
	<div class="mx-3 mb-6">
		<Tags tags={data.result.tags} id={data.id} />
	</div>
{:else}
	<h1>Failed to read article id {data.id}.</h1>
{/if}
