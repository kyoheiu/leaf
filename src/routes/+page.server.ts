import { PrismaClient } from '@prisma/client';

export const load = async () => {
	const prisma = new PrismaClient({ log: ['query', 'info', 'error'] });
	try {
		const articles = await prisma.articles.findMany({
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
		const result = [];
		for (let i = 0; i < articles.length; i++) {
			const item = articles[i];
			const tags = [];
			const tagResult = await prisma.tags.findMany({
				where: { ulid: item.id }
			});
			for (let i = 0; i < tags.length; i++) {
				const tag = tagResult[i];
				tags.push(tag.tag);
			}
			result.push({
				...item,
				tags: tags
			});
		}
		return { result: result };
	} catch (e) {
		console.error(e);
	}
};
