import { PrismaClient } from '@prisma/client';

export const load = async () => {
	const prisma = new PrismaClient({ log: ['query', 'info', 'error'] });
	try {
		let articles = await prisma.articles.findMany();
		let result = [];
		for (let i = 0; i < articles.length; i++) {
			const item = articles[i];
			const tags= await prisma.tags.findFirst({
				where: {ulid: item.id}
			});
			result.push({
				...item,
				tags: tags
			})
		}
		return { result: result};
	} catch (e) {
		console.error(e);
	}
};
