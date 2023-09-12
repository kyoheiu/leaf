import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

interface Req {
	id: string;
	tag: string;
}

export const POST: RequestHandler = async (event) => {
	const req: Req = await event.request.json();
	const prisma = new PrismaClient({ log: ['query', 'info', 'error'] });
	await prisma.tags.create({
		data: {
			ulid: req.id,
			tag: req.tag
		}
	});
	return new Response(null, {
		status: 201
	});
};

export const DELETE: RequestHandler = async (event) => {
	const req: Req = await event.request.json();
	const prisma = new PrismaClient({ log: ['query', 'info', 'error'] });
	await prisma.tags.delete({
		where: { ulid: req.id, tag: req.tag }
	});
	return new Response(null, {
		status: 200
	});
};
