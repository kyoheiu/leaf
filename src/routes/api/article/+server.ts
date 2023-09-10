import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

interface Req {
	id: string;
	action: Action;
	current: number | null;
}

enum Action {
	ToggleLiked,
	ToggleArchived,
	Delete
}

export const POST: RequestHandler = async (event) => {
	const req: Req = await event.request.json();
	const prisma = new PrismaClient({ log: ['query', 'info', 'error'] });

	try {
		if (req.action === Action.ToggleLiked) {
			await prisma.articles.update({
				where: { id: req.id },
				data: {
					liked: 1 - req.current!
				}
			});
		} else if (req.action === Action.ToggleArchived) {
			await prisma.articles.update({
				where: { id: req.id },
				data: {
					archived: 1 - req.current!
				}
			});
		} else {
			await prisma.articles.delete({
				where: { id: req.id }
			});
		}
		return new Response(null, {
			status: 200
		});
	} catch (e) {
		return new Response(e as string, {
			status: 500
		});
	}
};
