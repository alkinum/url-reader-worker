import { parse } from 'cookie-es';
import { extractText } from 'unpdf';
import { protectPage } from 'puppeteer-afp';

import TurndownService from '@backrunner/turndown';
import puppeteer, { Browser } from '@cloudflare/puppeteer';
import read from './utils/readability';

import {
  BROWSER_ERROR_EARLY_FALLBACK_CACHE_TTL,
  DEFAULT_BROWSER_USER_AGENT,
  DEFAULT_FETCH_CACHE_TTL,
  DEFAULT_GOOGLE_WEBCACHE_ENDPOINT,
  DEFAULT_SALVAGE_USER_AGENT,
  DEFAULT_TIMEOUT,
  FALLBACK_TIMEOUT,
  FINAL_SNAPSHOT_WAIT_TIME,
  GENERAL_FALLBACK_CACHE_TTL,
  REQUEST_HEADERS,
} from './constants/common';
import { ERROR_CODE } from './constants/errors';
import { PROTECTION_OPTIONS } from './constants/protection';
import { EXECUTE_SNAPSHOT, INJECT_FUNCS, READABILITY_JS, TURNSTILE_SOLVER, WORKER_PROTECTION } from './static/scripts';
import { ImgBrief, PageSnapshot } from './types';
import { cleanAttribute, checkSiteSafetyProtection } from './utils/crawler';
import { wrapTurndown } from './utils/markdown';
import { createErrorResponse, createFetchResponse } from './utils/response';
import { STEALTH } from './static/stealth';
import { HOSTNAME_BLACKLIST } from './constants/common';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const parsedIncoming = new URL(request.url);

    if (parsedIncoming.pathname !== '/') {
      return createErrorResponse('Page not found', ERROR_CODE.INVALID_TARGET, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent');
    if (!userAgent) {
      return createErrorResponse('Invalid request headers', ERROR_CODE.INVALID_HEADERS, { status: 400 });
    }

    if (/(netcraft\.com)|NetcraftSurveyAgent/.test(userAgent)) {
      return createErrorResponse('Abuse detected', ERROR_CODE.ABUSE, { status: 403 });
    }

    // check auth
    if (env.AUTH_KEY) {
      if (parsedIncoming.searchParams.get('auth_key') !== env.AUTH_KEY) {
        return createErrorResponse('Unauthorized', ERROR_CODE.INVALID_AUTH_KEY, { status: 401 });
      }
    }

    const targetUrl = decodeURIComponent(parsedIncoming.searchParams.get('target') || '').trimStart();
    const mode = parsedIncoming.searchParams.get('mode');

    if (!targetUrl) {
      return createErrorResponse('Target URL is required', ERROR_CODE.INVALID_TARGET, { status: 400 });
    }

    if (!/^https?:\/\//.test(targetUrl)) {
      return createErrorResponse('Invalid target URL', ERROR_CODE.INVALID_TARGET, { status: 400 });
    }

    try {
      const parsedURL = new URL(targetUrl);
      if (HOSTNAME_BLACKLIST.includes(parsedURL.hostname)) {
        return createErrorResponse('Invalid target URL', ERROR_CODE.INVALID_TARGET, { status: 400 });
      }
    } catch (error) {
      console.error('Failed to parse incoming url:', targetUrl, error);
      return createErrorResponse('Invalid target URL', ERROR_CODE.INVALID_TARGET, { status: 400 });
    }

    const cached = await caches.default.match(request);
    if (cached && cached instanceof Response) {
      console.info('Return from cache:', targetUrl);
      console.info('Cache content:', JSON.stringify(cached));
      return cached;
    }

    const requestHeaders = {
      ...request.headers,
      ...REQUEST_HEADERS,
    };

    let headRes;
    try {
      headRes = await fetch(targetUrl, {
        method: 'HEAD',
        headers: {
          ...requestHeaders,
        },
        cf: {
          cacheKey: `HEAD_${targetUrl}`,
          cacheTtl: env.FETCH_CACHE_TTL || DEFAULT_FETCH_CACHE_TTL,
        },
      });
    } catch (error) {
      console.error('Failed to check content type:', error);
      return createErrorResponse('Failed to check content type', ERROR_CODE.UNSUPPORTED_CONTENT, { status: 400 });
    }

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
        if (mode === 'get_response') {
          const directGetResponse = async () => {
            const res = await fetch(targetUrl, {
              headers: {
                'User-Agent': DEFAULT_BROWSER_USER_AGENT,
              },
              cf: {
                cacheKey: `HEAD_${targetUrl}`,
                cacheTtl: env.FETCH_CACHE_TTL || DEFAULT_FETCH_CACHE_TTL,
              },
            });
            const contentType = res.headers.get('content-type');
            const html = await res.text();
            return {
              html,
              contentType: contentType || '',
            };
          };
          const getRes = await directGetResponse();
          const res = createFetchResponse(
            new Response(getRes.html, {
              status: 200,
              headers: {
                'Content-Type': getRes.contentType,
              },
            }),
            {
              ...env,
            },
          );
          ctx.waitUntil(caches.default.put(request, res.clone()));
          return res;
        }

        // use puppeteer to render html
        const sessionId = await this.getRandomSession(env.READER_BROWSER as any);

        // settings getters
        const getTimeout = () => env.BROWSER_TIMEOUT || DEFAULT_TIMEOUT;
        const getUserAgent = () => env.BROWSER_USER_AGENT || DEFAULT_BROWSER_USER_AGENT;
        const getSalvageUserAgent = () => env.SALVAGE_USER_AGENT || DEFAULT_SALVAGE_USER_AGENT;

        const fallback = async () => {
          let fallbackMode = 'markdown';
          switch (mode) {
            case 'markdown':
              break;
            case 'text':
              fallbackMode = 'text';
              break;
            default:
              fallbackMode = 'html';
              break;
          }
          try {
            const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
              headers: {
                'User-Agent': getUserAgent(),
                'x-response-with': fallbackMode,
              },
            });
            if (res.ok) {
              console.info('Return from early fallback before browser inited:', targetUrl);
              console.info('early return res', await res.text());
              return await res.text();
            } else {
              throw res;
            }
          } catch (error) {
            console.error(error);
          }
        };

        const earlyFallback = async () => {
          const fallbackRet = await fallback();
          if (!fallbackRet) {
            console.error('Invalid early fallback return before browser inited:', fallbackRet);
            throw new Error('Invalid fallback return');
          }
          const res = createFetchResponse(
            new Response(fallbackRet as BodyInit, {
              status: 200,
              headers: {
                'Content-Type': `${mode === 'markdown' ? 'text/markdown' : 'text/html'}; charset=utf-8`,
              },
            }),
            {
              ...env,
              CACHE_CONTROL: `max-age=${BROWSER_ERROR_EARLY_FALLBACK_CACHE_TTL}` as any,
            },
          );
          ctx.waitUntil(caches.default.put(request, res.clone()));
          return res;
        };

        let browser: Browser | undefined;

        if (sessionId) {
          try {
            browser = await puppeteer.connect(env.READER_BROWSER as any, sessionId);
          } catch (error) {
            console.error(`Failed to connect to ${sessionId}. Error ${error}`);
            try {
              const res = await earlyFallback();
              if (res) {
                return res;
              }
            } catch (error) {
              console.error('Early fallback about browser launch failed.', error);
            }
          }
        }

        if (!browser) {
          try {
            browser = await puppeteer.launch(env.READER_BROWSER as any);
          } catch (error) {
            console.error(error);
            try {
              const res = await earlyFallback();
              if (res) {
                return res;
              }
            } catch (error) {
              console.error('Early fallback about browser launch failed.', error);
            }
          }
        }

        if (!browser) {
          return createErrorResponse('Failed to launch browser', ERROR_CODE.BROWSER_FAILED, { status: 500 });
        }

        console.info('Browser inited.');

        const page = await browser.newPage();

        // passthrough the cookie in the request
        const cookie = request.headers.get('Cookie');
        if (cookie) {
          try {
            const parsed = parse(cookie);
            const pageCookies = Object.keys(parsed).map((key) => ({
              name: key,
              value: parsed[key],
            }));
            page.setCookie(...pageCookies);
          } catch (error) {
            console.error('Failed to set cookie to remote req:', error);
          }
        }

        console.info('Page created.');

        try {
          await Promise.all([
            page.setBypassCSP(true),
            page.setCacheEnabled(true),
            page.setUserAgent(getUserAgent()),
            page.setDefaultTimeout(getTimeout()),
            page.evaluateOnNewDocument(STEALTH),
            ...(mode === 'html' ? [] : [page.evaluateOnNewDocument(READABILITY_JS)]),
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
        } catch (error) {
          console.error('Failed to setup page:', error);
          await page.close();
          browser.disconnect();
          try {
            const res = await earlyFallback();
            if (res) {
              return res;
            }
          } catch (error) {
            console.error('Failed to get fallback res after setup page failed:', error);
            return createErrorResponse('Failed to setup page', ERROR_CODE.PAGE_SETUP_FAILED, { status: 500 });
          }
        }

        console.info('Page setup finished, starting to wait snapshot.');

        let snapshot: PageSnapshot | undefined;
        let finalResolve: Function | undefined;
        let finalResolveTimeout: ReturnType<typeof setTimeout> | undefined;
        let finalWaitStart = 0;
        let finalResolveCalled = false;

        try {
          const earlyReturn = await new Promise<unknown | undefined>(async (resolve) => {
            // wait for the final snapshot event in 5s, it will be emitted multiple times
            (page as any).on('snapshot', (shot: PageSnapshot) => {
              if (shot.html) snapshot = shot;
              if (typeof finalResolve === 'function') {
                if (finalResolveTimeout) clearTimeout(finalResolveTimeout);
                if (Date.now() - finalWaitStart > FINAL_SNAPSHOT_WAIT_TIME) {
                  finalResolve?.();
                  return;
                }
                finalResolveTimeout = setTimeout(() => finalResolve?.(), 1000);
              }
            });

            try {
              await page.goto(targetUrl, {
                waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
                timeout: getTimeout(),
              });
              snapshot = (await page.evaluate('giveSnapshot()')) as PageSnapshot;
              console.info('After page loaded snapshot fetched.');

              if (snapshot?.html && !checkSiteSafetyProtection(targetUrl, snapshot.html)) {
                page.evaluate(TURNSTILE_SOLVER);
                console.info('Turnstile detected, solver evaluated.');
                // wait for the resolver
                await new Promise<void>((resolve) => {
                  setTimeout(() => {
                    resolve();
                  }, 3000);
                });
                // refetch a new snapshot
                snapshot = (await page.evaluate('giveSnapshot()')) as PageSnapshot;
                console.info('New snapshot after turnstile resolver applied fetched.');
              }

              // wait secs for the snapshot event after page loaded
              await new Promise<void>((resolve) => {
                finalResolve = () => {
                  finalResolveCalled = true;
                  console.info('Final wait resolved.');
                  resolve();
                };
                finalWaitStart = Date.now();
                finalResolveTimeout = setTimeout(() => {
                  if (typeof finalResolve === 'function') finalResolve();
                }, 1000);
                setTimeout(() => {
                  if (!finalResolveCalled) {
                    console.warn('Final wait timeout, no more snapshot event.');
                    resolve();
                  }
                }, FINAL_SNAPSHOT_WAIT_TIME);
              });
            } catch (error) {
              console.error('Failed to browse the page:', error);
            }

            // === fallback methods ===
            const salvage = async () => {
              const googleArchiveUrl = `${
                env.GOOGLE_WEB_CACHE_ENDPOINT || DEFAULT_GOOGLE_WEBCACHE_ENDPOINT
              }?q=cache:${encodeURIComponent(targetUrl)}`;
              const resp = await fetch(googleArchiveUrl, {
                headers: {
                  'User-Agent': getSalvageUserAgent(),
                },
              });
              if (!resp.ok) {
                return;
              }
              const html = await resp.text();
              if (!checkSiteSafetyProtection(targetUrl, html)) {
                return;
              }
              try {
                snapshot = await new Promise((resolve, reject) => {
                  if (mode === 'html') {
                    read(html, function (err: any, article: any) {
                      if (err || !article) return reject(err);
                      resolve({
                        title: article.title || '',
                        text: article.text || '',
                        html,
                        href: article.url || '',
                      });
                    });
                  }
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
                if (!checkSiteSafetyProtection(targetUrl, html)) {
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

            if (
              !snapshot?.title ||
              !snapshot?.html ||
              !snapshot?.parsed?.content ||
              !checkSiteSafetyProtection(targetUrl, snapshot?.html || '')
            ) {
              console.info('Need to return content earlier because of invalid snapshot.');
              const fallbackResList = await Promise.allSettled([
                salvage(),
                simulateScraper(),
                fallback(),
                new Promise<void>((resolve) => setTimeout(() => resolve(), FALLBACK_TIMEOUT)),
              ]);
              const earlyReturnRes = fallbackResList.find((item: any) => item.status === 'fulfilled' && !!item.value);
              if (earlyReturnRes) {
                console.info('Early return resolved.');
                resolve(earlyReturnRes);
                return;
              }
            }

            console.info('No need to early return, now processing content.');
            resolve(undefined);
          });

          // has fallback return
          if (earlyReturn) {
            const res = createFetchResponse(
              new Response(earlyReturn as BodyInit, {
                status: 200,
                headers: {
                  'Content-Type': `${mode === 'markdown' ? 'text/markdown' : 'text/html'}; charset=utf-8`,
                },
              }),
              {
                ...env,
                CACHE_CONTROL: `max-age=${GENERAL_FALLBACK_CACHE_TTL}` as any,
              },
            );
            ctx.waitUntil(caches.default.put(request, res.clone()));
            return res;
          }
        } catch (error) {
          console.error('Failed to generate snapshot:', error);
          return createErrorResponse('Generate snapshot timeout', ERROR_CODE.SNAPSHOT_TIMEOUT, { status: 500 });
        } finally {
          await page.close();
          browser.disconnect();
        }

        console.info('Starting to process snapshot content.');

        // no fallback return
        if (!snapshot?.html && !snapshot?.parsed?.content) {
          return createErrorResponse('Invalid snapshot content', ERROR_CODE.INVALID_SNAPSHOT, { status: 500 });
        }

        let returnContent = snapshot.html as string | undefined;

        // postprocess of the snapshot determine by the mode
        if (mode === 'markdown') {
          // markdown mode
          // init turndown
          const turndown = wrapTurndown(
            new TurndownService({
              codeBlockStyle: 'fenced',
              preformattedCode: true,
            } as any),
          );

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

          // convert to markdown, ensure the readability worked correctly
          const originalMarkdown = turndown.turndown(snapshot.html).trim();
          const parsedContentMarkdown = snapshot.parsed?.content
            ? turndown.turndown(snapshot.parsed?.content).trim()
            : '';

          console.info('Turndown converted.');

          returnContent =
            parsedContentMarkdown.length > 0.3 * originalMarkdown.length ? parsedContentMarkdown : originalMarkdown;
        } else {
          // not markdown mode
          // just return parsed html content
          returnContent = mode === 'text' ? snapshot.parsed?.content : snapshot.html;
        }

        if (!returnContent) {
          return createErrorResponse('No available parsed content', ERROR_CODE.PARSE_FAILED, { status: 500 });
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

        if (returnContent && checkSiteSafetyProtection(targetUrl, returnContent)) {
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
        if (!fetchRes?.ok) {
          return createErrorResponse('Invalid fetch remote res.', ERROR_CODE.INVALID_FETCH_RES);
        }
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
        if (!fetchRes?.ok) {
          return createErrorResponse('Invalid fetch remote res.', ERROR_CODE.INVALID_FETCH_RES);
        }
        const res = createFetchResponse(fetchRes as unknown as Response, env);
        ctx.waitUntil(caches.default.put(request, res.clone()));
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
