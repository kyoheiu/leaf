import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTags = async (id: string): Promise<string[]> => {
	const tags = [];
	const tagResult = await prisma.tags.findMany({
		where: { ulid: id }
	});
	for (let i = 0; i < tagResult.length; i++) {
		const tag = tagResult[i];
		tags.push(tag.tag);
	}
	return tags;
};

export default prisma;
