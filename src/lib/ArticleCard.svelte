<script lang="ts">
	import type { ElementProps, ElementKind, ArticleData } from '$lib/types';
	import Tags from '$lib/Tags.svelte';
	import {
		HeartOutline,
		HeartSolid,
		ArchiveOutline,
		ArchiveSolid,
		TrashBinOutline
	} from 'flowbite-svelte-icons';
	import LinkButton from '$lib/LinkButton.svelte';

	export let article: ArticleData;
	export let kind: ElementKind;
	let isInvisible = false;

	const trimUrl = (url: string) => {
		return url.split('/').slice(2, 3).join('/');
	};

	const toggleLiked = async (id: string) => {
		const res = await fetch(`/api/articles/${id}?toggle=liked`, {
			method: 'POST'
		});
		if (!res.ok) {
			console.error('Cannot toggle like.');
		} else {
			article.liked = !article.liked;
		}
	};

	const toggleArchived = async (id: string) => {
		const res = await fetch(`/api/articles/${id}?toggle=archived`, {
			method: 'POST'
		});
		if (!res.ok) {
			console.error('Cannot archive article.');
		} else {
			article.archived = !article.archived;
		}
	};

	const deleteArticleContent = async (id: string) => {
		const res = await fetch(`/api/articles/${id}`, {
			method: 'DELETE'
		});
		if (!res.ok) {
			console.error('Cannot delete article.');
		} else {
		}
	};
</script>

{#if isInvisible}
	<span />
{:else}
	<div class="py-1 text-sm text-slate-500">
		{article.timestamp.substring(0, article.timestamp.length - 3)}
	</div>
	<div class="line-clamp-3 text-lg font-semibold leading-6">
		<a href={`/articles/${article.id}`} class="no-underline">
			{article.title}
		</a>
	</div>
	<div class="my-2 flex items-center text-sm text-slate-500">
		<a href={article.url} target="_blank">
			{trimUrl(article.url)}
		</a>
		&nbsp;
		<LinkButton url={article.url} />
	</div>
	<div class="mx-auto mb-2 mt-1 grid grid-cols-10 gap-3">
		{#if article.cover !== ''}
			<div class="col-span-7 line-clamp-4 text-sm">
				{article.beginning}
			</div>
			<div class="col-span-3">
				<img loading="lazy" class="h-16 object-contain" alt="cover" src={article.cover} />
			</div>
		{:else}
			<div class="col-span-10 text-sm">{article.beginning}</div>
		{/if}
	</div>
	<div>
		<div class="my-1">
			<Tags tags={article.tags} id={article.id} />
		</div>
	</div>
	<div class="flex items-center">
		<div class="h-1 w-full rounded-md bg-slate-300">
			<div class="h-1 rounded-md bg-slate-500" style="width: {article.progress}%;" />
		</div>
		<button
			id={`like-button-${article.id}`}
			class="mx-1 rounded-full border px-2 text-sm"
			on:click={() => toggleLiked(article.id)}
			title="toggle liked"
		>
			{#if article.liked}
				<HeartSolid />
			{:else}
				<HeartOutline />
			{/if}
		</button>
		<button
			class="mx-1 rounded-full border px-2 text-sm"
			on:click={() => toggleArchived(article.id)}
			title="toggle archived"
		>
			{#if article.archived}
				<ArchiveSolid />
			{:else}
				<ArchiveOutline />
			{/if}
		</button>
		<button
			class="ml-1 rounded-full border px-2 text-sm"
			on:click={() => deleteArticleContent(article.id)}
			title="delete"
		>
			<TrashBinOutline />
		</button>
	</div>
{/if}
