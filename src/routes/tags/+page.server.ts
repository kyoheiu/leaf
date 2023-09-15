import prisma from '$lib/server/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const tagSet: Set<string> = new Set([]);
	const tagResult = await prisma.tags.findMany({});
	for (let i = 0; i < tagResult.length; i++) {
		const tag = tagResult[i];
		tagSet.add(tag.tag);
	}

	const tagArr = Array.from(tagSet);
	tagArr.sort();

	return {
		result: tagArr
	};
};
