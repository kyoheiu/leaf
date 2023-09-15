import prisma from '$lib/server/client';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const data = await prisma.articles.findMany();
		return new Response(JSON.stringify(data), {
			headers: {
				'Content-type': 'application/json',
				'Content-Disposition': `attachment; filename="data.json"`
			}
		});
	} catch (e) {
		const message = 'Failed to download data.';
		return new Response(message, { status: 500 });
	}
};
