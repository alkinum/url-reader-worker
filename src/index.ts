import { parse } from 'cookie-es';
import { extractText } from 'unpdf';
import { protectPage } from 'puppeteer-afp'; 

import TurndownService from '@backrunner/turndown';
import puppeteer, { Browser } from '@cloudflare/puppeteer';

import { DEFAULT_BROWSER_USER_AGENT, DEFAULT_FETCH_CACHE_TTL, DEFAULT_TIMEOUT, REQUEST_HEADERS } from './constants/common';
import { ERROR_CODE } from './constants/errors';
import { EXECUTE_SNAPSHOT, INJECT_FUNCS, READABILITY_JS } from './static/scripts';
import { ImgBrief, PageSnapshot } from './types';
import { cleanAttribute } from './utils/crawler';
import { tidyMarkdown } from './utils/markdown';
import { createErrorResponse, createFetchResponse } from './utils/response';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const parsedIncoming = new URL(request.url);

    // check auth
    if (env.AUTH_KEY) {
      if (parsedIncoming.searchParams.get('auth_key') !== env.AUTH_KEY) {
        return createErrorResponse('Unauthorized', ERROR_CODE.INVALID_AUTH_KEY, { status: 401 });
      }
    }

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
      cf: {
        cacheKey: `HEAD_${targetUrl}`,
        cacheTtl: env.FETCH_CACHE_TTL || DEFAULT_FETCH_CACHE_TTL,
      },
    });

    let contentType = headRes.headers.get('Content-Type') || '';
    if (/^(video|audio|(application\/octet-stream))/.test(contentType)) {
      return createErrorResponse('Unsupported content type', ERROR_CODE.UNSUPPORTED_CONTENT, { status: 400 });
    }

    if (contentType.includes(';')) {
      // there's header value like "text/html; charset=utf-8"
      contentType = contentType.split(';')[0];
    }

    switch (contentType.toLowerCase().trim()) {
      case 'text/html': {
        // use puppeteer to render html
        const sessionId = await this.getRandomSession(env.READER_BROWSER as any);

        let browser: Browser | undefined;

        if (sessionId) {
          try {
            browser = await puppeteer.connect(env.READER_BROWSER as any, sessionId);
          } catch (error) {
            console.log(`Failed to connect to ${sessionId}. Error ${error}`);
          }
        }

        if (!browser) {
          browser = await puppeteer.launch(env.READER_BROWSER as any);
        }

        const page = await browser.newPage();

        // passthrough the cookie in the request
        const cookie = request.headers.get('Cookie');
        if (cookie) {
          const parsed = parse(cookie);
          const pageCookies = Object.keys(parsed).map((key) => ({
            name: key,
            value: parsed[key],
          }));
          page.setCookie(...pageCookies);
        }

        const getTimeout = () => env.BROWSER_TIMEOUT || DEFAULT_TIMEOUT;

        await Promise.all([
          page.setBypassCSP(true),
          page.setCacheEnabled(true),
          page.setUserAgent(env.BROWSER_USER_AGENT || DEFAULT_BROWSER_USER_AGENT),
          page.setDefaultTimeout(getTimeout()),
          page.evaluateOnNewDocument(READABILITY_JS),
          page.evaluateOnNewDocument(INJECT_FUNCS),
          page.setViewport({
            width: 1920,
            height: 1080,
          }),
          protectPage(page),
          page.exposeFunction('reportSnapshot', (snapshot: PageSnapshot) => {
            if (snapshot.href === 'about:blank') {
              return;
            }
            page.emit('snapshot', snapshot);
          }),
        ]);

        await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
        await page.evaluateOnNewDocument(EXECUTE_SNAPSHOT);

        page.goto(targetUrl, { waitUntil: ['load', 'domcontentloaded', 'networkidle0'], timeout: getTimeout() });

        const snapshot = (await Promise.race([
          new Promise((resolve) => {
            (page as any).on('snapshot', (snapshot: PageSnapshot) => {
              resolve(snapshot);
            });
          }),
          new Promise((resolve) => {
            setTimeout(resolve, getTimeout());
          }),
        ])) as PageSnapshot | undefined;

        await page.close();
        browser.disconnect();

        if (!snapshot?.html) {
          return createErrorResponse('Snapshot timeout', ERROR_CODE.SNAPSHOT_TIMEOUT, { status: 500 });
        }

        let returnContent = snapshot.html as string | undefined;

        if (mode) {
          if (mode === 'markdown') {
            // init turndown
            const turndown = new TurndownService();
            turndown.addRule('remove-irrelevant', {
              filter: ['meta', 'style', 'script', 'noscript', 'link', 'textarea'],
              replacement: () => '',
            });
            turndown.addRule('title-as-h1', {
              filter: ['title'],
              replacement: (innerText) => `${innerText}\n===============\n`,
            });

            // get alt text
            const urlToAltMap: { [k: string]: string | undefined } = {};
            if (snapshot.imgs?.length) {
              const tasks = (snapshot.imgs || []).map(async (x) => {
                const r = await this.getAltText(x).catch((err: any) => {
                  console.error('Failed to get alt text', err);
                  return undefined;
                });
                if (r && x.src) {
                  urlToAltMap[x.src.trim()] = r;
                }
              });

              await Promise.all(tasks);
            }
            let imgIdx = 0;
            turndown.addRule('img-generated-alt', {
              filter: 'img',
              replacement: (_content, node) => {
                const src = (node.getAttribute('src') || '').trim();
                const alt = cleanAttribute(node.getAttribute('alt'));
                if (!src) {
                  return '';
                }
                const mapped = urlToAltMap[src];
                imgIdx++;
                if (mapped) {
                  return `![Image ${imgIdx}: ${mapped || alt}](${src})`;
                }
                return alt ? `![Image ${imgIdx}: ${alt}](${src})` : `![Image ${imgIdx}](${src})`;
              },
            });

            // convert to markdown
            returnContent = tidyMarkdown(turndown.turndown(snapshot.html));
          } else {
            // just return parsed html content
            returnContent = mode === 'body' ? snapshot.parsed?.content : snapshot.parsed?.textContent;
          }
        }

        if (!returnContent) {
          return createErrorResponse('No parsed content', ERROR_CODE.PARSE_FAILED, { status: 500 });
        }

        const res = createFetchResponse(
          new Response(returnContent, {
            status: 200,
            headers: {
              'Content-Type': `${mode === 'markdown' ? 'text/markdown' : 'text/html'}; charset=utf-8`,
            },
          }),
          env,
        );
        ctx.waitUntil(caches.default.put(request, res.clone()));
        return res;
      }
      case 'application/pdf': {
        const fetchRes = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            ...requestHeaders,
          },
          cf: {
            cacheKey: `GET_${targetUrl}`,
            cacheTtl: env.FETCH_CACHE_TTL || DEFAULT_FETCH_CACHE_TTL,
          },
        });
        const pdf = await fetchRes.arrayBuffer();
        const { text } = await extractText(pdf, { mergePages: true });
        const res = createFetchResponse(
          new Response(Array.isArray(text) ? text.join('\n') : text, { status: 200 }),
          env,
        );
        ctx.waitUntil(caches.default.put(request, res.clone()));
        return res;
      }
      default: {
        const fetchRes = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            ...requestHeaders,
          },
          cf: {
            cacheKey: `GET_${targetUrl}`,
            cacheTtl: env.FETCH_CACHE_TTL || DEFAULT_FETCH_CACHE_TTL,
          },
        });
        const res = createFetchResponse(fetchRes as unknown as Response, env);
        if (res.status === 200) {
          ctx.waitUntil(caches.default.put(request, res.clone()));
        }
        return res;
      }
    }
  },

  async getRandomSession(endpoint: puppeteer.BrowserWorker): Promise<string | undefined> {
    const sessions: puppeteer.ActiveSession[] = await puppeteer.sessions(endpoint);

    const sessionsIds = sessions
      .filter((v) => {
        return !v.connectionId; // remove sessions with workers connected to them
      })
      .map((v) => {
        return v.sessionId;
      });

    if (sessionsIds.length === 0) {
      return;
    }

    const sessionId = sessionsIds[Math.floor(Math.random() * sessionsIds.length)];

    return sessionId!;
  },

  async getAltText(imgBrief: ImgBrief) {
    if (imgBrief.alt) {
      return imgBrief.alt;
    }
    return undefined;
  },
};
