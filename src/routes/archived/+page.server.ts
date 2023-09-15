import prisma, { getTags } from '$lib/server/client';

const CHUNK = 21;
const PER_PAGE = 20;

export const load = async ({ url }: { url: URL }) => {
	const param: string | null = url.searchParams.get('page');

	if (param) {
		const page = parseInt(param, 10);
		try {
			const articles = await prisma.articles.findMany({
				where: {
					archived: 1
				},
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
				},
				skip: (page - 1) * PER_PAGE,
				take: CHUNK
			});
			const result = [];
			for (let i = 0; i < articles.length; i++) {
				const article = articles[i];
				const tags = await getTags(article.id);
				result.push({ ...article, tags: tags });
			}
			const next = result.length > PER_PAGE ? page + 1 : null;
			if (next) {
				result.pop();
			}
			return { result: result, prev: page - 1, next: next };
		} catch (e) {
			console.error(e);
		}
	} else {
		try {
			const articles = await prisma.articles.findMany({
				where: {
					archived: 1
				},
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
				},
				take: CHUNK
			});
			const result = [];
			for (let i = 0; i < articles.length; i++) {
				const article = articles[i];
				const tags = await getTags(article.id);
				result.push({ ...article, tags: tags });
			}
			const next = result.length > PER_PAGE ? 2 : null;
			if (next) {
				result.pop();
			}
			return { result: result, prev: null, next: next };
		} catch (e) {
			console.error(e);
		}
	}
};
