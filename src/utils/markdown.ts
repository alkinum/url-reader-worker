import TurndownService from '@backrunner/turndown';
import { cleanAttribute } from './crawler';

export const wrapTurndown = (turndown: TurndownService) => {
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
  turndown.addRule('improved-code', {
    filter: function (node: any) {
      let hasSiblings = node.previousSibling || node.nextSibling;
      let isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings;

      return node.nodeName === 'CODE' && !isCodeBlock;
    },
    replacement: function (inputContent: any) {
      if (!inputContent) return '';
      let content = inputContent;

      let delimiter = '`';
      let matches = content.match(/`+/gm) || [];
      while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + '`';
      if (content.includes('\n')) {
        delimiter = '```';
      }

      let extraSpace = delimiter === '```' ? '\n' : /^`|^ .*?[^ ].* $|`$/.test(content) ? ' ' : '';

      return (
        delimiter +
        extraSpace +
        content +
        (delimiter === '```' && !content.endsWith(extraSpace) ? extraSpace : '') +
        delimiter
      );
    },
  });
  turndown.addRule('truncate-svg', {
    filter: 'svg' as any,
    replacement: () => ''
  });

  return turndown;
};
