import * as cheerio from 'cheerio';
import { Cheerio } from 'cheerio';
import { AnyNode, Element } from 'domhandler';

export function cleanHtml(html: string, targetSelector?: string): string {
  const hasHtmlTag = /<html[\s>]/i.test(html);
  const hasBodyTag = /<body[\s>]/i.test(html);

  let processedHtml = html;
  if (!hasHtmlTag) {
    processedHtml = `<html>${processedHtml}</html>`;
  }
  if (!hasBodyTag) {
    processedHtml = processedHtml.replace(
      /<html([^>]*)>/i,
      `<html$1><body>`
    ).replace(
      /<\/html>/i,
      `</body></html>`
    );
  }

  const $ = cheerio.load(processedHtml);

  let $root: Cheerio<AnyNode> = $('body').length ? $('body') : $.root();

  if (targetSelector) {
    $root = $(targetSelector);
    if ($root.length === 0) {
      return '';
    }
  }

  $root.find('style, script, svg, meta, link, video, audio').remove();

  $root.find('*').addBack().each((_, elem) => {
    const attributes = (elem as Element).attribs;
    for (const attr in attributes) {
      if (attr !== 'class' && attr !== 'id') {
        $(elem).removeAttr(attr);
      }
    }
    if (attributes.class === '') $(elem).removeAttr('class');
    if (attributes.id === '') $(elem).removeAttr('id');
  });

  if (targetSelector) {
    return $root.map((_, elem) => $(elem).html() || '').get().join('\n');
  } else {
    return $root.html() || '';
  }
}
