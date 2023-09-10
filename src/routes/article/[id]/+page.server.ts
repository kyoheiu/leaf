import type { PageServerLoad } from './$types';
import { PrismaClient } from '@prisma/client';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;

	const prisma = new PrismaClient({ log: ['query', 'info', 'error'] });
	const article = await prisma.articles.findFirst({
		where: { id: id },
		select: {
			url: true,
			title: true,
			html: true,
			position: true,
			progress: true,
			archived: true,
			liked: true,
			timestamp: true
		}
	});
	if (article) {
		const tags = await prisma.tags.findMany({
			where: { ulid: id }
		});
		const tagResult: string[] = [];
		for (let i = 0; i < tags.length; i++) {
			const t = tags[i];
			tagResult.push(t.tag);
		}
		const result = {
			...article,
			tags: tagResult
		};
		return { id: id, result: result };
	} else {
		return { id: id, result: null };
	}
};
