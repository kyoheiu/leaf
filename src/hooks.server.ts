import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ resolve, event }) => {
	// Apply CORS header for API routes
	if (event.url.pathname.startsWith('/api/create')) {
		// Required for CORS to work
		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*'
				}
			});
		}
	}

	const response = await resolve(event);
	if (event.url.pathname.startsWith('/api/create')) {
		response.headers.append('Access-Control-Allow-Origin', `*`);
	}
	return response;
};
