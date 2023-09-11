<script lang="ts">
	import toast, { Toaster } from 'svelte-french-toast';
	import { LinkSolid } from 'flowbite-svelte-icons';

	export let url: string;

	const copyToClipboard = async (url: string) => {
		await navigator.clipboard.writeText(url);
		toast.success('URL copied to clipboard.');
	};
</script>

<Toaster />
<button class="px-2" on:click={() => copyToClipboard(url)} title="copy URL">
	<LinkSolid size="xs" />
</button>
