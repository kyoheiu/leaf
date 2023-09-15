<script lang="ts">
	import { Toaster } from 'svelte-french-toast';
	import { LinkSimple } from 'phosphor-svelte';
	import { toastSuccess } from '$lib/toast';
	export let url: string;

	const copyToClipboard = async (url: string) => {
		await navigator.clipboard.writeText(url);
		toastSuccess('URL copied to clipboard.');
	};
</script>

<Toaster />
<button on:click={() => copyToClipboard(url)} title="copy URL">
	<LinkSimple size={18} />
</button>
