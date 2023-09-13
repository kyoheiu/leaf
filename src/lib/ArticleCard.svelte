<script lang="ts">
	import type { ArticleData } from '$lib/types';
	import Tags from '$lib/Tags.svelte';
	import { Heart, ArchiveBox, Trash } from 'phosphor-svelte';
	import LinkButton from '$lib/LinkButton.svelte';

	const ICON_SIZE = 20;

	export let article: ArticleData;
	let isInvisible = false;

	const trimUrl = (url: string) => {
		return url.split('/').slice(2, 3).join('/');
	};

	const toggleLiked = async () => {
		const res = await fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: article.id, action: 0, current: article.liked })
		});
		if (!res.ok) {
			console.error(await res.text());
		} else {
			article.liked = 1 - article.liked;
		}
	};

	const toggleArchived = async () => {
		const res = await fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: article.id, action: 1, current: article.archived })
		});
		if (!res.ok) {
			console.error(await res.text());
		} else {
			article.archived = 1 - article.archived;
			isInvisible = true;
		}
	};

	const deleteArticleContent = async () => {
		const res = await fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: article.id, action: 2 })
		});
		if (!res.ok) {
			console.error(await res.text());
		} else {
			isInvisible = true;
		}
	};
</script>

{#if isInvisible}
	<span />
{:else}
	<div class="mt-4 mb-4">
		<div class="py-1 text-sm text-slate-500">
			{article.timestamp?.toLocaleString()}
		</div>
		<div class="line-clamp-3 text-lg font-semibold leading-6">
			<a href={`/article/${article.id}`} class="no-underline">
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
				on:click={toggleLiked}
				title="toggle liked"
			>
				{#if article.liked}
					<Heart weight="fill" size={ICON_SIZE} />
				{:else}
					<Heart size={ICON_SIZE} />
				{/if}
			</button>
			<button
				class="mx-1 rounded-full border px-2 text-sm"
				on:click={toggleArchived}
				title="toggle archived"
			>
				{#if article.archived}
					<ArchiveBox weight="fill" size={ICON_SIZE} />
				{:else}
					<ArchiveBox size={ICON_SIZE} />
				{/if}
			</button>
			<button
				class="ml-1 rounded-full border px-2 text-sm"
				on:click={deleteArticleContent}
				title="delete"
			>
				<Trash size={ICON_SIZE} />
			</button>
		</div>
	</div>
{/if}
