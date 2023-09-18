<script lang="ts">
	import { Action, type ArticleDataWithTag } from '$lib/types';
	import Tags from '$lib/Tags.svelte';
	import { Heart, ArchiveBox, Trash } from 'phosphor-svelte';
	import LinkButton from '$lib/LinkButton.svelte';
	import moment from 'moment';
	import { toastError, toastSuccess } from './toast';
	import logger from './logger';

	const ICON_SIZE = 20;

	export let article: ArticleDataWithTag;
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
			body: JSON.stringify({ id: article.id, action: Action.ToggleLiked, current: article.liked })
		});
		if (!res.ok) {
			logger.error(await res.text());
			toastError(`Error:\n${res.statusText}`);
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
			body: JSON.stringify({
				id: article.id,
				action: Action.ToggleArchived,
				current: article.archived
			})
		});
		if (!res.ok) {
			logger.error(await res.text());
			toastError(`Error:\n${res.statusText}`);
		} else {
			article.archived = 1 - article.archived;
			if (article.archived === 1) {
				toastSuccess(`Archived:\n${article.title}`);
			} else {
				toastSuccess(`Unarchived:\n${article.title}`);
			}
			isInvisible = true;
		}
	};

	const deleteArticleContent = async () => {
		const res = await fetch(`/api/article`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: article.id, action: Action.Delete })
		});
		if (!res.ok) {
			logger.error(await res.text());
			toastError(`Error:\n${res.statusText}`);
		} else {
			isInvisible = true;
		}
	};
</script>

{#if isInvisible}
	<span />
{:else}
	<div class="w-64 sm:w-96 md:w-144 mt-4 mb-4 first:mt-8 last:mb-8">
		{#if article.timestamp}
			<div class="py-1 text-sm text-slate-500">
				{moment(article.timestamp).format('lll')}
			</div>
		{/if}
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
		<div class="mx-auto mb-2 mt-1 grid grid-cols-10 gap-4 h-16">
			{#if article.cover}
				<div class="col-span-7 line-clamp-3 text-sm">
					{article.beginning}
				</div>
				<div class="col-span-3 flex justify-center">
					<img loading="lazy" class="h-16 object-contain" alt="cover" src={article.cover} />
				</div>
			{:else}
				<div class="col-span-10 line-clamp-3 text-sm">{article.beginning}</div>
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
				class="mx-1 rounded-full border border-bordercolor px-2 text-sm"
				on:click={toggleLiked}
				title="toggle liked"
			>
				{#if article.liked}
					<Heart weight="fill" class="text-heart" size={ICON_SIZE} />
				{:else}
					<Heart size={ICON_SIZE} />
				{/if}
			</button>
			<button
				class="mx-1 rounded-full border border-bordercolor px-2 text-sm"
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
				class="ml-1 rounded-full border border-bordercolor px-2 text-sm"
				on:click={deleteArticleContent}
				title="delete"
			>
				<Trash size={ICON_SIZE} />
			</button>
		</div>
	</div>
{/if}
