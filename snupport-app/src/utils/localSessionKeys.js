// Clés du localStorage qui recopient des contenus métier (articles de la base de connaissance,
// brouillons d'édition). Elles survivaient à la déconnexion : le poste suivant les relisait (FM21,
// audit des fronts du 23/09/2026). Les préférences d'affichage (`snu-support-kb-tree-*`,
// `snu-support-kb-meta-hidden`) ne contiennent rien de sensible et sont conservées.
const EXACT_KEYS = ["snu-support-kb"];
const KEY_PREFIXES = ["snu-kb-content-"];

export function isSessionContentKey(key) {
  return EXACT_KEYS.includes(key) || KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function clearSessionContent(storage) {
  const keys = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && isSessionContentKey(key)) keys.push(key);
  }
  keys.forEach((key) => storage.removeItem(key));
  return keys;
}
