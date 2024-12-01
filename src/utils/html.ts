import * as cheerio from 'cheerio';
import { Cheerio } from 'cheerio';
import { AnyNode, Element } from 'domhandler';
import { PageSnapshot } from '../types';

export function cleanHtml(snapshot: PageSnapshot, targetSelector?: string): string {
	const { html, childFrames } = snapshot;

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

	if (childFrames && childFrames.length > 0) {
    $root.find('iframe').each((_, elem) => {
      const $iframe = $(elem);
      const frameSrc = $iframe.attr('src');

      const matchedFrame = childFrames.find(frame => {
        const frameUrl = frame.href;
        return frameSrc && (
          frameUrl === frameSrc ||
          decodeURIComponent(frameUrl) === frameSrc ||
          frameUrl === decodeURIComponent(frameSrc)
        );
      });

      if (matchedFrame && matchedFrame.html) {
        const $wrapper = $('<div class="iframe-content"></div>');

        const frameHtml = cleanHtml(matchedFrame, targetSelector);
        const $frameContent = cheerio.load(frameHtml);

        const bodyContent = $frameContent('body').html() || frameHtml;

        $wrapper.html(bodyContent);
        $iframe.replaceWith($wrapper);
      }
    });
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
