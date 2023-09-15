import * as child from 'node:child_process';
import prisma, { getTags } from '$lib/server/client';
import type { ArticleDataWithTag } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const tagName = params.tag;
	const idResult = await prisma.tags.findMany({
		where: { tag: tagName }
	});
	console.log(idResult);

	const articleResult = [];
	for (let i = 0; i < idResult.length; i++) {
		const id = idResult[i].ulid;
		const article = await prisma.articles.findFirst({
			where: { id: id },
			select: {
				id: true,
				url: true,
				title: true,
				cover: true,
				beginning: true,
				progress: true,
				liked: true,
				archived: true,
				timestamp: true
			},
			orderBy: {
				id: 'desc'
			}
		});
		if (article) {
			articleResult.push(article);
		}
	}

	const result: ArticleDataWithTag[] = [];
	for (let i = 0; i < articleResult.length; i++) {
		const article = articleResult[i];
		const tags = await getTags(article.id);
		result.push({
			...article,
			tags: tags
		});
	}

	return {
		result: result,
		tagName: tagName
	};
};
