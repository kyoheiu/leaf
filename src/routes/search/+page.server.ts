import * as child from 'node:child_process';
import prisma, { getTags } from '$lib/server/client';
import type { ArticleDataWithTag } from '$lib/types';

export const load = async ({ url }: { url: URL }) => {
	const q: string | null = url.searchParams.get('q');
	if (!q) {
		return {
			result: []
		};
	}
	const idResult: string[] = [];

	const path = process.env.LEAF_INDEX ?? `./prisma/databases/.index`;

	//ripgrep
	const subprocessRg = child.spawnSync('rg', ['-i', '-l', q, path]);
	const splitRg: (string | null)[] = subprocessRg.stdout
		.toString()
		.split('\n')
		.filter((x: string) => x.length > 0)
		.map((x: string) => {
			return x.split('/').at(-1) ?? null;
		})
		.filter((x) => x !== null);
	splitRg.forEach((s) => {
		if (s) {
			idResult.push(s);
		}
	});

	const articleResult = [];
	for (let i = 0; i < idResult.length; i++) {
		const id = idResult[i];
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
		query: q
	};
};
