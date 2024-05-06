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
	const r = new Response(res.body as ReadableStream<Uint8Array>, res);
	// overwrite cache control
	r.headers.set('Cache-Control', env?.CACHE_CONTROL || 'max-age=600');
	['Expires', 'Last-Modified'].forEach((item) => {
		if (r.headers.has(item)) {
			r.headers.delete(item);
		}
	});
	return r;
};