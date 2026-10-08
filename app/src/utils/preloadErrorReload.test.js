import { afterEach, describe, expect, it, vi } from "vitest";

import { MAX_RELOADS_PER_WINDOW, RELOAD_WINDOW_MS } from "./preloadErrorReload";

const T0 = 1_000_000_000;

// Chaque chargement de page a sa propre instance du module : resetModules en donne une neuve
async function loadPage() {
  vi.resetModules();
  const { reloadAfterPreloadError } = await import("./preloadErrorReload");
  return reloadAfterPreloadError;
}

// Échec d'import sur une nouvelle page de l'onglet. Stockage et état réseau par défaut : sessionStorage
// et navigator.onLine de happy-dom
async function failOnNewPage(now, reload, options = {}) {
  return (await loadPage())({ reload, now, ...options });
}

describe("reloadAfterPreloadError", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("recharge la page au premier échec d'import", async () => {
    const reload = vi.fn();

    expect(await failOnNewPage(T0, reload)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("recharge une seconde fois dans la période : le rechargement a pu retomber sur l'ancienne instance", async () => {
    const reload = vi.fn();

    await failOnNewPage(T0, reload);
    expect(await failOnNewPage(T0 + 20_000, reload)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("s'arrête après deux rechargements dans la période : l'échec qui survit au rechargement ne boucle pas", async () => {
    const reload = vi.fn();

    await failOnNewPage(T0, reload);
    await failOnNewPage(T0 + 2_000, reload);
    expect(await failOnNewPage(T0 + 4_000, reload)).toBe(false);
    expect(await failOnNewPage(T0 + RELOAD_WINDOW_MS - 1, reload)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(MAX_RELOADS_PER_WINDOW);
  });

  it("plusieurs échecs dans la même page ne comptent qu'un rechargement", async () => {
    const reload = vi.fn();
    const reloadAfterPreloadError = await loadPage();

    expect(reloadAfterPreloadError({ reload, now: T0 })).toBe(true);
    expect(reloadAfterPreloadError({ reload, now: T0 + 5 })).toBe(true);
    expect(reloadAfterPreloadError({ reload, now: T0 + 10 })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(JSON.parse(window.sessionStorage.getItem("snu-preload-error-reloads"))).toHaveLength(1);
    // Le second rechargement de la période reste disponible pour la page suivante
    expect(await failOnNewPage(T0 + 3_000, reload)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("recharge de nouveau quand les rechargements sortent de la période (déploiement suivant, onglet resté ouvert)", async () => {
    const reload = vi.fn();

    await failOnNewPage(T0, reload);
    await failOnNewPage(T0 + 2_000, reload);
    expect(await failOnNewPage(T0 + RELOAD_WINDOW_MS, reload)).toBe(true);
    expect(await failOnNewPage(T0 + RELOAD_WINDOW_MS + 1_000, reload)).toBe(false);
    expect(await failOnNewPage(T0 + 2_000 + RELOAD_WINDOW_MS, reload)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(4);
  });

  it("une horloge revenue en arrière ne bloque pas le rechargement", async () => {
    const reload = vi.fn();

    await failOnNewPage(T0, reload);
    await failOnNewPage(T0 + 1_000, reload);
    expect(await failOnNewPage(T0 - 3_600_000, reload)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(3);
  });

  it.each(["pas du json", "1234", '{"a":1}', '["x", null]'])("une valeur illisible dans le stockage (%s) n'empêche pas le rechargement", async (stored) => {
    const reload = vi.fn();
    window.sessionStorage.setItem("snu-preload-error-reloads", stored);

    expect(await failOnNewPage(T0, reload)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("hors ligne, ne recharge pas et ne consomme aucun rechargement", async () => {
    const reload = vi.fn();

    expect(await failOnNewPage(T0, reload, { isOnline: () => false })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem("snu-preload-error-reloads")).toBeNull();
  });

  it("sans sessionStorage, ne recharge jamais : pas de garde-fou contre les boucles", async () => {
    const reload = vi.fn();
    const blocked = () => {
      throw new Error("SecurityError");
    };
    const reloadAfterPreloadError = await loadPage();

    expect(reloadAfterPreloadError({ reload, now: T0, getStorage: blocked })).toBe(false);
    expect(reloadAfterPreloadError({ reload, now: T0, getStorage: () => ({ getItem: () => null, setItem: blocked }) })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
