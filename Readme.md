# url-reader-worker

A url reader for AI Agents which can be deployed very easily as a Cloudflare worker.

## Usage

**IMPORTANT: You need Worker Paid plan to use this worker due to the limitation of Browser ability.**

### Deploy

```bash
npm run deploy
```

### Params

`[YOUR_WORKER_URL]?target={targetUrl}&mode={mode}&auth_key={authKey}`

- `targetUrl`: URL of the target page, read image / audio / video directly is not supported.

- `mode` (optional): Could be "markdown", "body". As for `markdown` mode, if the original content is `text/html`, it will be formatted into a human-readable markdown format text. As for `body` mode, it will return the body part of the page. Otherwise, the worker will return the original rendered HTML text.

- `authKey` (optional): If `AUTH_KEY` set, you need to pass the key in the query. We recommend to use Cloudflare's abilities to protect your worker.

### Env

- `CACHE_CONTROL`: Response cache control which follows Cloudflare's rules.
- `BROWSER_TIMEOUT`: General timeout for puppeteer.
- `FETCH_CACHE_TTL`: General ttl for caching HEAD and GET requests to original content.
- `AUTH_KEY` 

### Security

Please using WAF / Rules on Cloudflare to secure your worker because it can access any url from any source by default, THIS WORKER CAN BE ABUSED POTENTIALLY.

If you want to add some extra logic to block some evil requests, please fork it and modify the code.

## Inspired by

[jina-ai/reader](https://github.com/jina-ai/reader)

## License

Apache-2.0
