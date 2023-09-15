<script lang="ts">
	import { page } from '$app/stores';
	import { ArrowCircleRight, ArrowCircleLeft } from 'phosphor-svelte';

	const ICON_SIZE = 32;

	const pathname = $page.url.pathname;
	export let prev: number | null | undefined;
	export let next: number | null | undefined;
</script>

<div class="flex space-x-16 my-8">
	{#if prev}
		<a href={`${pathname}?page=${prev}`}><ArrowCircleLeft size={ICON_SIZE} /></a>
	{/if}
	{#if next}
		<a href={`${pathname}?page=${next}`}><ArrowCircleRight size={ICON_SIZE} /></a>
	{/if}
</div>
