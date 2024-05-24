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
  // overwrite cache control
  const cloned = res.clone();
  return new Response(cloned.body, {
    ...cloned,
    headers: {
      ...Object.fromEntries(cloned.headers.entries()),
      'Cache-Control': env?.CACHE_CONTROL || 'max-age=600',
      Expires: '',
      'Last-Modified': '',
    },
  });
};

export const checkResponseContent = (targetUrl:string, content: string) => {
  const parsedUrl = new URL(targetUrl);
  // openai specified
  if (parsedUrl.hostname.endsWith('openai.com') && content.includes('iframe src="https://challenges.cloudflare.com')) {
    return false;
  }
  if (
    content.includes('This website is using a security service to protect itself from online attacks.') ||
    content.includes('Verifying you are human.')
  ) {
    return false;
  }
  return true;
};
