import prisma from '$lib/server/client';
import { Action } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import * as fs from 'node:fs/promises';

interface Req {
	id: string;
	action: Action;
	current: number | null;
	pos: number | null;
	prog: number | null;
}

export const POST: RequestHandler = async (event) => {
	const req: Req = await event.request.json();

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
		} else if (req.action === Action.UpdatePosition) {
			await prisma.articles.update({
				where: { id: req.id },
				data: {
					position: req.pos as number,
					progress: req.prog as number
				}
			});
		} else {
			await prisma.articles.delete({
				where: { id: req.id }
			});
			await fs.rm(`${process.env.LEAF_INDEX ?? './prisma/databases/'}.index/${req.id}`);
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
