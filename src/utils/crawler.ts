export function cleanAttribute(attribute: string) {
  return attribute ? attribute.replace(/(\n+\s*)+/g, '\n') : '';
}

export const checkSiteSafetyProtection = (targetUrl: string, content: string) => {
  // check cloudflare protection
  if (
    content.includes('This website is using a security service to protect itself from online attacks.') ||
    content.includes('Verifying you are human.') ||
    content.includes('window._cf_chl_opt')
  ) {
    return false;
  }
  if (
    /(系统)?(监|检测到)?(您的)?((网络)|(环境)|(网络环境)|(系统)|(浏览器))(存在)?(异常|((安全)?风险))/.test(content)
    && /请?((点击)|(输入))(下方)?(验证)?(按钮)?(进行)?验证码?/.test(content)
  ) {
    return false;
  }
  return true;
};
