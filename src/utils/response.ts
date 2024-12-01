export const createErrorResponse = (message: string, code?: number, init?: ResponseInit) => {
  return new Response(
    JSON.stringify({
      code,
      message,
    }),
    {
      status: 500,
      ...init,
    },
  );
};

export const createFetchResponse = (res: Response, env?: Env) => {
  const cloned = res.clone();

  const newHeaders = new Headers(cloned.headers);

  newHeaders.set('Cache-Control', env?.CACHE_CONTROL || 'max-age=600');
  newHeaders.delete('Expires');
  newHeaders.delete('Last-Modified');

  return new Response(cloned.body, {
    status: cloned.status,
    statusText: cloned.statusText,
    headers: newHeaders,
  });
};
