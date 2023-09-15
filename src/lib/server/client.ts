import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: process.env.LEAF_DATA ? `${process.env.LEAF_DATA}/.sqlite` : 'file:databases/.sqlite'
		}
	}
});

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
