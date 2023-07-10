const isValidRedirectUrl = (url) => {
  const pattern = /^https:\/\/(.*\.)?(snu\.gouv\.fr|beta-snu\.dev)(\/.*)?$/;
  if (!url) return false;
  return pattern.test(url);
};

export { isValidRedirectUrl };
