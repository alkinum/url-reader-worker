import { parse } from 'cookie-es';
import { extractText } from 'unpdf';
import { protectPage } from 'puppeteer-afp';

import TurndownService from '@backrunner/turndown';
import puppeteer, { Browser } from '@cloudflare/puppeteer';
import read from './utils/readability';

import {
  DEFAULT_BROWSER_USER_AGENT,
  DEFAULT_FETCH_CACHE_TTL,
  DEFAULT_GOOGLE_WEBCACHE_ENDPOINT,
  DEFAULT_SALVAGE_USER_AGENT,
  DEFAULT_TIMEOUT,
  REQUEST_HEADERS,
} from './constants/common';
import { ERROR_CODE } from './constants/errors';
import { PROTECTION_OPTIONS } from './constants/protection';
import { EXECUTE_SNAPSHOT, INJECT_FUNCS, READABILITY_JS, TURNSTILE_SOLVER, WORKER_PROTECTION } from './static/scripts';
import { ImgBrief, PageSnapshot } from './types';
import { cleanAttribute, checkCfProtection } from './utils/crawler';
import { tidyMarkdown } from './utils/markdown';
import { createErrorResponse, createFetchResponse } from './utils/response';
import { STEALTH } from './static/stealth';

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

        // settings getters
        const getTimeout = () => env.BROWSER_TIMEOUT || DEFAULT_TIMEOUT;
        const getUserAgent = () => env.BROWSER_USER_AGENT || DEFAULT_BROWSER_USER_AGENT;
        const getSalvageUserAgent = () => env.SALVAGE_USER_AGENT || DEFAULT_SALVAGE_USER_AGENT;

        const fallback = async () => {
          try {
            const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
              headers: {
                'User-Agent': getUserAgent(),
              },
            });
            if (res.ok) {
              return await res.text();
            }
          } catch (error) {
            console.error(error);
          }
        };

        const earlyFallback = async () => {
          const fallbackRet = await fallback();
          if (fallbackRet) {
            const res = createFetchResponse(
              new Response(fallbackRet as BodyInit, {
                status: 200,
                headers: {
                  'Content-Type': `${mode === 'markdown' ? 'text/markdown' : 'text/html'}; charset=utf-8`,
                },
              }),
              {
                ...env,
                CACHE_CONTROL: 'max-age=120' as any,
              },
            );
            ctx.waitUntil(caches.default.put(request, res.clone()));
            return res;
          }
        };

        let browser: Browser | undefined;

        if (sessionId) {
          try {
            browser = await puppeteer.connect(env.READER_BROWSER as any, sessionId);
          } catch (error) {
            console.error(`Failed to connect to ${sessionId}. Error ${error}`);
            const res = await earlyFallback();
            if (res) return res;
          }
        }

        if (!browser) {
          try {
            browser = await puppeteer.launch(env.READER_BROWSER as any);
          } catch (error) {
            console.error(error);
            const res = await earlyFallback();
            if (res) return res;
          }
        }

        if (!browser) {
          return createErrorResponse('Failed to launch browser', ERROR_CODE.BROWSER_FAILED, { status: 500 });
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

        await Promise.all([
          page.setBypassCSP(true),
          page.setCacheEnabled(true),
          page.setUserAgent(getUserAgent()),
          page.setDefaultTimeout(getTimeout()),
          page.evaluateOnNewDocument(STEALTH),
          page.evaluateOnNewDocument(READABILITY_JS),
          page.evaluateOnNewDocument(INJECT_FUNCS),
          page.evaluateOnNewDocument(WORKER_PROTECTION),
          page.setViewport({
            width: 1920,
            height: 1080,
          }),
          protectPage(page, PROTECTION_OPTIONS),
          page.exposeFunction('reportSnapshot', (snapshot: PageSnapshot) => {
            if (snapshot.href === 'about:blank') {
              return;
            }
            page.emit('snapshot', snapshot);
          }),
        ]);

        await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
        await page.evaluateOnNewDocument(EXECUTE_SNAPSHOT);

        let snapshot: PageSnapshot | undefined;
        let finalResolve: Function | undefined;
        let finalTimeout: ReturnType<typeof setTimeout> | undefined;
        let finalWaitTime = 0;

        try {
          const earlyReturn = await new Promise<unknown | undefined>(async (resolve, reject) => {
            (page as any).on('snapshot', (shot: PageSnapshot) => {
              if (shot.html) snapshot = shot;
              if (finalResolve) {
                if (finalTimeout) clearTimeout(finalTimeout);
                finalWaitTime += 1000;
                if (finalWaitTime > 5000) return;
                finalTimeout = setTimeout(() => finalResolve?.(), 1000);
              }
            });

            await page.goto(targetUrl, {
              waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
              timeout: getTimeout(),
            });

            snapshot = (await page.evaluate('giveSnapshot()')) as PageSnapshot;

            if (snapshot?.html && !checkCfProtection(targetUrl, snapshot.html)) {
              page.evaluate(TURNSTILE_SOLVER);
              await new Promise<void>((resolve) => {
                setTimeout(() => {
                  resolve();
                });
              });
              snapshot = (await page.evaluate('giveSnapshot()')) as PageSnapshot;
            }

            // wait 1 sec for the after load snapshot
            await new Promise<void>((resolve) => {
              finalResolve = resolve;
              finalWaitTime += 1000;
              setTimeout(resolve, 1000);
            });

            // make sure the page is available
            if (!snapshot?.html) {
              return reject(new Error('browser timeout'));
            }

						const salvage = async () => {
							const googleArchiveUrl = `${env.GOOGLE_WEB_CACHE_ENDPOINT || DEFAULT_GOOGLE_WEBCACHE_ENDPOINT}?q=cache:${encodeURIComponent(
								targetUrl,
							)}`;
							const resp = await fetch(googleArchiveUrl, {
								headers: {
									'User-Agent': getSalvageUserAgent(),
								},
							});
							if (!resp.ok) {
								return;
							}
							const html = await resp.text();
							if (!checkCfProtection(targetUrl, html)) {
								return;
							}
							try {
								snapshot = await new Promise((resolve, reject) => {
									read(html, function (err: any, article: any) {
										if (err || !article) return reject(err);
										resolve({
											title: article.title || '',
											text: article.text || '',
											html,
											href: article.url || '',
										});
									});
								});
							} catch (error) {
								console.error(error);
							}
						};

						const simulateScraper = async () => {
							const res = await fetch(targetUrl, {
								headers: {
									'User-Agent': targetUrl.includes('openai.com')
										? 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)'
										: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
								},
							});
							if (res.ok && res.headers.get('content-type')?.includes('text/html')) {
								const html = await res.text();
								if (!checkCfProtection(targetUrl, html)) {
									return;
								}
								try {
									snapshot = await new Promise((resolve, reject) => {
										read(html, function (err: any, article: any) {
											if (err || !article) return reject(err);
											resolve({
												title: article.title || '',
												text: article.text || '',
												html,
												href: article.url || '',
											});
										});
									});
								} catch (error) {
									console.error(error);
								}
							}
						};

            if (!snapshot.title || !snapshot.parsed?.content || !checkCfProtection(targetUrl, snapshot.html)) {
              const earlyReturn = await Promise.allSettled([salvage(), simulateScraper(), fallback()]);
              const earlyReturnRes = earlyReturn.find((item: any) => item.status === 'fulfilled' && !!item.value);
              if (earlyReturnRes) {
                resolve(earlyReturnRes);
              }
            }

            resolve(undefined);
          });

          if (earlyReturn) {
            await page.close();
            browser.disconnect();

            const res = createFetchResponse(
              new Response(earlyReturn as BodyInit, {
                status: 200,
                headers: {
                  'Content-Type': `${mode === 'markdown' ? 'text/markdown' : 'text/html'}; charset=utf-8`,
                },
              }),
              {
                ...env,
                CACHE_CONTROL: 'max-age=120' as any,
              },
            );

            ctx.waitUntil(caches.default.put(request, res.clone()));

            return res;
          }
        } catch {
          return createErrorResponse('Snapshot timeout', ERROR_CODE.SNAPSHOT_TIMEOUT, { status: 500 });
        }

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
            turndown.addRule('improved-paragraph', {
              filter: 'p',
              replacement: (innerText) => {
                const trimmed = innerText.trim();
                if (!trimmed) {
                  return '';
                }

                return `${trimmed.replace(/\n{3,}/g, '\n\n')}\n\n`;
              },
            });
            turndown.addRule('improved-inline-link', {
              filter: function (node, options) {
                return options.linkStyle === 'inlined' && node.nodeName === 'A' && node.getAttribute('href');
              },
              replacement: function (content, node) {
                let href = node.getAttribute('href');
                if (href) href = href.replace(/([()])/g, '\\$1');
                let title = cleanAttribute(node.getAttribute('title'));
                if (title) title = ' "' + title.replace(/"/g, '\\"') + '"';

                const fixedContent = content.replace(/\s+/g, ' ').trim();
                const fixedHref = href.replace(/\s+/g, '').trim();

                return `[${fixedContent}](${fixedHref}${title || ''})`;
              },
            });

            // get alt text
            const urlToAltMap: { [k: string]: string | undefined } = {};
            if (snapshot.imgs?.length) {
              (snapshot.imgs || []).forEach((x) => {
                const r = this.getAltText(x);
                if (r && x.src) {
                  urlToAltMap[x.src.trim()] = r;
                }
              });
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
            returnContent = tidyMarkdown(turndown.turndown(snapshot.html).trim());
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

        if (checkCfProtection(targetUrl, returnContent)) {
          ctx.waitUntil(caches.default.put(request, res.clone()));
        }

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

  getAltText(imgBrief: ImgBrief) {
    if (imgBrief.alt) {
      return imgBrief.alt;
    }
    return undefined;
  },
};
