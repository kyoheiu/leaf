<script lang="ts">
	import { CaretRight } from 'phosphor-svelte';

	export let page: string;
</script>

<div class="w-56 mt-6 flex items-center border border-bordercolor justify-center rounded px-6 py-1">
	<a class="w-16" href="/">Home</a>
	<CaretRight size={16} class="mx-4" />
	<span class="w-16 line-clamp-2 leading-5 text-center">{page}</span>
</div>
