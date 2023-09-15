import prisma from '$lib/server/client';
import type { RequestHandler } from '@sveltejs/kit';

interface Req {
	id: string;
	tag: string;
}

export const POST: RequestHandler = async (event) => {
	const req: Req = await event.request.json();
	const tag = req.tag.trim().toLocaleLowerCase();
	await prisma.tags.create({
		data: {
			ulid: req.id,
			tag: tag
		}
	});
	console.log(`Add tag ${tag} to ${req.id}`);
	return new Response(null, {
		status: 201
	});
};

export const DELETE: RequestHandler = async (event) => {
	const req: Req = await event.request.json();
	await prisma.tags.deleteMany({
		where: { ulid: req.id, tag: req.tag }
	});
	console.log(`Delete tag ${req.tag} from ${req.id}`);
	return new Response(null, {
		status: 200
	});
};
