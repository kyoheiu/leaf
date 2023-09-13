import prisma, { getTags } from '$lib/server/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;

	const article = await prisma.articles.findFirst({
		where: { id: id },
		select: {
			id: true,
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
		const tags = await getTags(article.id)
		const result = {
			...article,
			tags: tags
		};
		return { id: id, result: result };
	} else {
		return { id: id, result: null };
	}
};
