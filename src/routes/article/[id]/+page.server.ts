import prisma, { getTags } from '$lib/server/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;

	const article = await prisma.articles.findFirstOrThrow({
		where: { id: id }
	});
	if (article) {
		const tags = await getTags(article.id);
		const result = {
			...article,
			tags: tags
		};
		return { id: id, result: result };
	}
};
