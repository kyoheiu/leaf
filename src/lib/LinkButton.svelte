<script lang="ts">
	import toast, { Toaster } from 'svelte-french-toast';
	import { LinkSimple } from 'phosphor-svelte';
	export let url: string;

	const copyToClipboard = async (url: string) => {
		await navigator.clipboard.writeText(url);
		toast.success('URL copied to clipboard.');
	};
</script>

<Toaster />
<button class="px-2" on:click={() => copyToClipboard(url)} title="copy URL">
	<LinkSimple size={18} />
</button>
