export const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
};

export const DEFAULT_BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0';

export const DEFAULT_SALVAGE_USER_AGENT = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)';

// ms
export const DEFAULT_TIMEOUT = 30 * 1000;

// s
export const DEFAULT_FETCH_CACHE_TTL = 5 * 60;

export const DEFAULT_GOOGLE_WEBCACHE_ENDPOINT = 'https://webcache.googleusercontent.com/search';

export const HOSTNAME_BLACKLIST = ['127.0.0.1', 'localhost'];

// s
export const GENERAL_FALLBACK_CACHE_TTL = 3 * 60;

// s
export const BROWSER_ERROR_EARLY_FALLBACK_CACHE_TTL = 5 * 60;

// ms
export const FINAL_SNAPSHOT_WAIT_TIME = 3 * 1000;

// ms
export const FALLBACK_TIMEOUT = 15 * 1000;