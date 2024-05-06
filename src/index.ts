import { parse } from 'cookie-es';
import TurndownService from 'turndown';
import { extractText } from 'unpdf';

import puppeteer from '@cloudflare/puppeteer';
import { Readability } from '@mozilla/readability';

import { REQUEST_HEADERS } from './constants/common';
import { ERROR_CODE } from './constants/errors';
import { createErrorResponse, createFetchResponse } from './utils/response';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const parsedIncoming = new URL(request.url);
		const targetUrl = decodeURIComponent(parsedIncoming.searchParams.get('target') || '').trim();
		const mode = parsedIncoming.searchParams.get('mode');

		if (!targetUrl) {
			return createErrorResponse('Target URL is required', ERROR_CODE.INVALID_TARGET, { status: 400 });
		}

		if (!/^https?:\/\//.test(targetUrl)) {
			return createErrorResponse('Invalid target URL', ERROR_CODE.INVALID_TARGET, { status: 400 });
		}

		const cached = await caches.default.match(request);
		if (cached) {
			return cached;
		}

		const requestHeaders = {
			...request.headers,
			...REQUEST_HEADERS,
		};

		const headRes = await fetch(targetUrl, {
			method: 'HEAD',
			headers: {
				...requestHeaders,
			},
		});

		const contentType = headRes.headers.get('Content-Type') || '';
		if (/^(video|audio|(application\/octet-stream))/.test(contentType)) {
			return createErrorResponse('Unsupported content type', ERROR_CODE.UNSUPPORTED_CONTENT, { status: 400 });
		}

		switch (contentType.toLowerCase().trim()) {
			case 'text/html': {
				// use puppeteer to render html
				const browser = await puppeteer.launch(env.READER_BROWSER as any);
				const page = await browser.newPage();
				page.setCacheEnabled(true);

				const cookie = request.headers.get('Cookie');
				if (cookie) {
					const parsed = parse(cookie);
					const pageCookies = Object.keys(parsed).map((key) => ({
						name: key,
						value: parsed[key],
					}));
					page.setCookie(...pageCookies);
				}

				await page.goto(targetUrl);
				const html = await page.content();
				await browser.close();

				let returnContent = html.trim();

				if (mode === 'markdown') {
					const turndown = new TurndownService();
					returnContent = turndown.turndown(returnContent);
				} else if (['body', 'text'].includes(mode || '')) {
					const parsed = new Readability(returnContent).parse();
					if (!parsed) {
						return createErrorResponse('Invalid fetch response', ERROR_CODE.INVALID_FETCH_RES, { status: 500 });
					}
					returnContent = mode === 'body' ? parsed.content : parsed.textContent;
				}

				const res = createFetchResponse(
					new Response(returnContent, {
						status: 200,
						headers: {
							'Content-Type': mode === 'markdown' ? 'text/markdown' : 'text/html',
						},
					}),
					env
				);
				ctx.waitUntil(caches.default.put(request, res));
				return res;
			}
			case 'application/pdf': {
				const fetchRes = await fetch(targetUrl, {
					method: 'GET',
					headers: {
						...requestHeaders,
					},
				});
				const pdf = await fetchRes.arrayBuffer();
				const { text } = await extractText(pdf, { mergePages: true });
				const res = createFetchResponse(new Response(Array.isArray(text) ? text.join('\n') : text, { status: 200 }), env);
				ctx.waitUntil(caches.default.put(request, res));
				return res;
			}
			default: {
				const fetchRes = await fetch(targetUrl, {
					method: 'GET',
					headers: {
						...requestHeaders,
					},
				});
				const res = createFetchResponse(fetchRes as unknown as Response, env);
				if (res.status === 200) {
					ctx.waitUntil(caches.default.put(request, res));
				}
				return res;
			}
		}
	},
};
