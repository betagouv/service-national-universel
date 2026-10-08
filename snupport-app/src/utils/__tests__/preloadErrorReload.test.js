import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_RELOADS_PER_WINDOW, RELOAD_WINDOW_MS, RELOADS_KEY } from "../preloadErrorReload.js";

const T0 = 1_000_000_000;

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

// Chaque chargement de page a sa propre instance du module : une URL distincte en donne une neuve
let pageCount = 0;
async function loadPage() {
  pageCount += 1;
  const { reloadAfterPreloadError } = await import(`../preloadErrorReload.js?page=${pageCount}`);
  return reloadAfterPreloadError;
}

// Onglet : sessionStorage partagé entre ses chargements successifs ; failOnNewPage simule un échec
// d'import sur une nouvelle page de l'onglet
function setupTab({ online = true } = {}) {
  const storage = memoryStorage();
  const reloads = [];
  const options = (now) => ({ getStorage: () => storage, isOnline: () => online, reload: () => reloads.push(now), now });
  const failOnNewPage = async (now) => (await loadPage())(options(now));
  return { storage, reloads, options, failOnNewPage };
}

test("recharge la page au premier échec d'import", async () => {
  const { reloads, failOnNewPage } = setupTab();

  assert.equal(await failOnNewPage(T0), true);
  assert.deepEqual(reloads, [T0]);
});

test("recharge une seconde fois dans la période : le rechargement a pu retomber sur l'ancienne instance", async () => {
  const { reloads, failOnNewPage } = setupTab();

  await failOnNewPage(T0);
  assert.equal(await failOnNewPage(T0 + 20_000), true);
  assert.deepEqual(reloads, [T0, T0 + 20_000]);
});

test("s'arrête après deux rechargements dans la période : l'échec qui survit au rechargement ne boucle pas", async () => {
  const { reloads, failOnNewPage } = setupTab();

  await failOnNewPage(T0);
  await failOnNewPage(T0 + 2_000);
  assert.equal(await failOnNewPage(T0 + 4_000), false);
  assert.equal(await failOnNewPage(T0 + RELOAD_WINDOW_MS - 1), false);
  assert.equal(reloads.length, MAX_RELOADS_PER_WINDOW);
});

test("plusieurs échecs dans la même page ne comptent qu'un rechargement", async () => {
  const { storage, reloads, options, failOnNewPage } = setupTab();
  const reloadAfterPreloadError = await loadPage();

  assert.equal(reloadAfterPreloadError(options(T0)), true);
  assert.equal(reloadAfterPreloadError(options(T0 + 5)), true);
  assert.equal(reloadAfterPreloadError(options(T0 + 10)), true);
  assert.deepEqual(reloads, [T0]);
  assert.equal(JSON.parse(storage.getItem(RELOADS_KEY)).length, 1);
  // Le second rechargement de la période reste disponible pour la page suivante
  assert.equal(await failOnNewPage(T0 + 3_000), true);
  assert.deepEqual(reloads, [T0, T0 + 3_000]);
});

test("recharge de nouveau quand les rechargements sortent de la période (déploiement suivant, onglet resté ouvert)", async () => {
  const { reloads, failOnNewPage } = setupTab();

  await failOnNewPage(T0);
  await failOnNewPage(T0 + 2_000);
  assert.equal(await failOnNewPage(T0 + RELOAD_WINDOW_MS), true);
  assert.equal(await failOnNewPage(T0 + RELOAD_WINDOW_MS + 1_000), false);
  assert.equal(await failOnNewPage(T0 + 2_000 + RELOAD_WINDOW_MS), true);
  assert.equal(reloads.length, 4);
});

test("une horloge revenue en arrière ne bloque pas le rechargement", async () => {
  const { reloads, failOnNewPage } = setupTab();

  await failOnNewPage(T0);
  await failOnNewPage(T0 + 1_000);
  assert.equal(await failOnNewPage(T0 - 3_600_000), true);
  assert.equal(reloads.length, 3);
});

test("une valeur illisible dans le stockage n'empêche pas le rechargement", async () => {
  for (const stored of ["pas du json", "1234", '{"a":1}', '["x", null]']) {
    const { storage, reloads, failOnNewPage } = setupTab();
    storage.setItem(RELOADS_KEY, stored);

    assert.equal(await failOnNewPage(T0), true, stored);
    assert.equal(reloads.length, 1, stored);
  }
});

test("hors ligne, ne recharge pas et ne consomme aucun rechargement", async () => {
  const offline = setupTab({ online: false });

  assert.equal(await offline.failOnNewPage(T0), false);
  assert.deepEqual(offline.reloads, []);
  assert.equal(offline.storage.getItem(RELOADS_KEY), null);
});

test("hors ligne selon navigator.onLine (détection par défaut), ne recharge pas", async () => {
  const { storage, reloads, failOnNewPage } = setupTab();
  const reloadAfterPreloadError = await loadPage();
  globalThis.window = { navigator: { onLine: false } };
  try {
    assert.equal(reloadAfterPreloadError({ getStorage: () => storage, reload: () => reloads.push(T0), now: T0 }), false);
  } finally {
    delete globalThis.window;
  }
  assert.deepEqual(reloads, []);
  assert.equal(storage.getItem(RELOADS_KEY), null);
  // Garde-fou du test lui-même : la même page, en ligne, recharge bien
  assert.equal(await failOnNewPage(T0), true);
});

test("sans sessionStorage, ne recharge jamais : pas de garde-fou contre les boucles", async () => {
  const reloads = [];
  const blocked = () => {
    throw new Error("SecurityError");
  };
  const failingSetItem = () => ({ getItem: () => null, setItem: blocked });
  const reloadAfterPreloadError = await loadPage();

  assert.equal(reloadAfterPreloadError({ getStorage: blocked, isOnline: () => true, reload: () => reloads.push(1), now: T0 }), false);
  assert.equal(reloadAfterPreloadError({ getStorage: failingSetItem, isOnline: () => true, reload: () => reloads.push(1), now: T0 }), false);
  assert.deepEqual(reloads, []);
});
