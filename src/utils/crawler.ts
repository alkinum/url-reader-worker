export function cleanAttribute(attribute: string) {
  return attribute ? attribute.replace(/(\n+\s*)+/g, '\n') : '';
}

export const checkCfProtection = (targetUrl: string, content: string) => {
  // openai specified
  if (
    content.includes('This website is using a security service to protect itself from online attacks.') ||
    content.includes('Verifying you are human.') ||
    content.includes('window._cf_chl_opt = {')
  ) {
    return false;
  }
  return true;
};
