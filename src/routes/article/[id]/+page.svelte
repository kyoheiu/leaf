<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import { Action } from '$lib/types';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { House } from 'phosphor-svelte';
	import Buttons from '$lib/Buttons.svelte';

	const ICON_SIZE = 24;

	export let data: PageData;

	const getScrollPosition = () => {
		const bodyheight = document.documentElement.scrollHeight;
		const scrolled = document.documentElement.scrollTop;
		const client = document.documentElement.clientHeight;
		const pos = Math.round((scrolled * 100) / bodyheight);
		const prog = Math.abs(bodyheight - client - scrolled);

		if (prog < 1) {
			return { pos: pos, prog: 100 };
		} else {
			return {
				pos: pos,
				prog: 100 - Math.round((prog * 100) / bodyheight)
			};
		}
	};

	const saveScrollPos = () => {
		const updated = getScrollPosition();
		fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: data.id,
				action: Action.UpdatePosition,
				pos: updated.pos,
				prog: updated.prog
			})
		}).then((res) => {
			if (!res.ok) {
				console.error('Cannot update progress.');
			}
		});
	};

	const restoreScrollPos = () => {
		if (data.result?.position) {
			console.log(data.result.position);
			const scroll = Math.round(
				(document.documentElement.scrollHeight * data.result.position) / 100
			);
			setTimeout(() => {
				window.scrollTo(0, scroll);
			}, 0);
		}
	};

	onMount(async () => {
		restoreScrollPos();
	});
</script>

<svelte:window on:scroll={saveScrollPos} />
{#if data.result}
	<div class="sticky top-0 my-3 flex h-8 items-center bg-slate-50">
		<a href="/"><House size={ICON_SIZE} /></a>
		<div class="ml-auto">
			<Buttons
				id={data.result.id}
				url={data.result.url}
				bind:liked={data.result.liked}
				bind:archived={data.result.archived}
			/>
		</div>
	</div>
	<div class="m-auto mt-6 w-3/4 text-center font-serif text-3xl font-semibold leading-9">
		{data.result.title}
	</div>
	<div class="mx-3 mb-6 mt-3 line-clamp-1 text-center text-sm">
		<a href={data.result.url}>{data.result.url}</a>
	</div>
	<div
		class="prose
				prose-slate
				prose-h1:border-b
				prose-h2:border-b
				prose-h1:border-bordercolor
				prose-h2:border-bordercolor
				prose-table:table-fixed
				prose-a:text-sky-700
	            mb-6"
	>
		<!-- eslint-disable -->
		{@html data.result.html}
	</div>
	<div class="flex justify-center">
		<img src="/logo.png" width={36} alt="logo" />
	</div>
	<div class="my-6">
		<Tags tags={data.result.tags} id={data.id} />
	</div>
{:else}
	<h1>Failed to read article id {data.id}.</h1>
{/if}
