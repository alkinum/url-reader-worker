import * as cheerio from 'cheerio';
import { AnyNode, Cheerio } from 'cheerio';

export function cleanHtml(html: string, targetSelector?: string): string {
  // 加载HTML
  const $ = cheerio.load(html);

  // 确定要处理的根元素
  let $root: Cheerio<AnyNode> = $('body').length ? $('body') : $.root();

  // 如果提供了targetSelector，只处理匹配的元素
  if (targetSelector) {
    $root = $(targetSelector);
    if ($root.length === 0) {
      return ''; // 如果没有匹配的元素，返回空字符串
    }
  }

  // 在根元素内移除指定的标签
  $root.find('style, script, svg, meta, link, img, video, audio').remove();

  // 遍历根元素内的所有元素
  $root.find('*').addBack().each((_, elem) => {
    const attributes = (elem as cheerio.Element).attribs;
    // 只保留class和id属性
    for (const attr in attributes) {
      if (attr !== 'class' && attr !== 'id') {
        $(elem).removeAttr(attr);
      }
    }
    // 如果class或id为空，也移除它们
    if (attributes.class === '') $(elem).removeAttr('class');
    if (attributes.id === '') $(elem).removeAttr('id');
  });

  // 返回处理后的HTML
  if (targetSelector) {
    // 如果有targetSelector，返回所有匹配元素的HTML
    return $root.map((_, elem) => $(elem).html() || '').get().join('\n');
  } else {
    // 如果没有targetSelector，返回整个处理后的HTML
    return $root.html() || '';
  }
}
