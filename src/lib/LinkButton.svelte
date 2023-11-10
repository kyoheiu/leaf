<script lang="ts">
	import { LinkSimple } from 'phosphor-svelte';
	import { toastSuccess } from '$lib/toast';

	export let url: string;
	export let size: number;

	const copyToClipboard = async (url: string) => {
		await navigator.clipboard.writeText(url);
		toastSuccess('URL copied to clipboard.');
	};
</script>

<button on:click={() => copyToClipboard(url)} title="copy URL">
	<LinkSimple {size} />
</button>
