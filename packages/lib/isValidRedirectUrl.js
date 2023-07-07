const isValidRedirectUrl = (url) => {
  const pattern = /^(https?:\/\/)?(.*\.)?(snu\.gouv\.fr|beta-snu\.dev)(\/.*)?$/;
  return pattern.test(url);
};

export { isValidRedirectUrl };
