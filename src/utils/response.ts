export const createErrorResponse = (message: string, code?: number, init?: ResponseInit) => {
	return new Response(
		JSON.stringify({
			code,
			message,
		}),
		{
			status: 500,
			...init,
		}
	);
};

export const createFetchResponse = (res: Response, env?: Env) => {
	// overwrite cache control
	const cloned = res.clone();
	return new Response(cloned.body, {
		...cloned,
		headers: {
			...cloned.headers,
			'Cache-Control': env?.CACHE_CONTROL || 'max-age=600',
			'Expires': '',
			'Last-Modified': '',
		},
	});
};
