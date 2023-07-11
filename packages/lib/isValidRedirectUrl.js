function isValidRedirectUrl(url) {
  const regex = /^(https:\/\/)([\w-]+\.)?(snu\.gouv\.fr|beta-snu\.dev)(\/.*)?(\?[\w-+%=&]*)?$|^\/?[\w-]+(\/[\w-]+)*(\?[\w-+%=&]*)?$/i;
  if (!url) return false;
  return regex.test(url);
}

export { isValidRedirectUrl };
