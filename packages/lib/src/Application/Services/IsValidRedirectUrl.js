function isValidRedirectUrl(url) {
  // Check if the URL starts with "http://" or "https://"
  var protocolCheck = /^https?:\/\//;
  // Check if the URL start with more than one "/" because with 2 it can redirect to another website
  var doubleSlashCheck = /^\/\//;
  // To authorize the redirect that stays on the current website and prevent bad redirections
  if (!protocolCheck.test(url) && !doubleSlashCheck.test(url)) return true;
  // Check if the domain is "snu.gouv.fr" or "beta-snu.dev" and force the https
  var domainCheck = /^https:\/\/([a-z0-9]+[.])*?(snu\.gouv\.fr|beta-snu\.dev)/;
  return domainCheck.test(url);
}

export { isValidRedirectUrl };
