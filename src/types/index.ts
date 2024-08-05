export interface ImgBrief {
  src: string;
  loaded: boolean;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  alt?: string;
}

export interface ReadabilityParsed {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
  lang: string;
  publishedTime: string;
}

export interface PageSnapshot {
  title: string;
  href: string;
  html: string;
  text: string;
  parsed?: Partial<ReadabilityParsed> | null;
  screenshot?: Buffer;
  imgs?: ImgBrief[];
  contentType?: string;
}
