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
				timestamp: true
			}
		});
		const result = [];
		for (let i = 0; i < articles.length; i++) {
			const item = articles[i];
			const tags = await prisma.tags.findFirst({
				where: { ulid: item.id }
			});
			result.push({
				...item,
				tags: tags?.tag
			});
		}
		return { result: result };
	} catch (e) {
		console.error(e);
	}
};
