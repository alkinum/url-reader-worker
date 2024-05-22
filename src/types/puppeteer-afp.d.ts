declare module 'puppeteer-afp' {
  import { Page, Browser } from 'puppeteer';

  interface Options {
    canvasRgba?: number[];
    webglData?: { [key: string]: number | string | number[] | Record<string, number> };
    fontFingerprint?: {
      noise: number;
      sign: number;
    };
    audioFingerprint?: {
      getChannelDataIndexRandom: number;
      getChannelDataResultRandom: number;
      createAnalyserIndexRandom: number;
      createAnalyserResultRandom: number;
    };
    webRTCProtect?: boolean;
    deviceMemory?: number;
  }

  function protectPage(page: Page, options?: Options): Promise<Page>;

  function protectedBrowser(browser: Browser, options?: Options): Promise<Browser>;

  export { protectPage, protectedBrowser };
}
