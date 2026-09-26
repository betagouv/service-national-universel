import { config } from "../config";
import { corsOptionsDelegate } from "../cors-options";

/**
 * PL5 : le CORS à credentials de l'api v1 acceptait SUPPORT_URL (appel serveur à serveur,
 * jamais un navigateur), SUPPORT_FRONT_URL et KNOWLEDGEBASE_URL (qui n'ont besoin que de deux
 * routes précises, sans cookie) et l'hôte mort "https://inscription.snu.gouv.fr" (2021).
 */
describe("cors-options : origine du CORS à credentials réduite (PL5)", () => {
  function callDelegate(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      corsOptionsDelegate({ path } as any, (error: Error | null, options: any) => {
        if (error) return reject(error);
        resolve(options);
      });
    });
  }

  it("n'autorise que APP_URL et ADMIN_URL, avec credentials, sur les routes par défaut", async () => {
    const options = await callDelegate("/young/signin");

    expect(options.credentials).toBe(true);
    expect(options.origin).toEqual([config.APP_URL, config.ADMIN_URL]);
  });

  it("n'inclut plus SUPPORT_URL, SUPPORT_FRONT_URL, KNOWLEDGEBASE_URL ni l'hôte mort inscription.snu.gouv.fr par défaut", async () => {
    const options = await callDelegate("/young/signin");

    expect(options.origin).not.toContain(config.SUPPORT_URL);
    expect(options.origin).not.toContain(config.SUPPORT_FRONT_URL);
    expect(options.origin).not.toContain(config.KNOWLEDGEBASE_URL);
    expect(options.origin).not.toContain("https://inscription.snu.gouv.fr");
  });

  it("autorise KNOWLEDGEBASE_URL sans credentials sur GET /signin/token", async () => {
    const options = await callDelegate("/signin/token");

    expect(options.credentials).toBe(false);
    expect(options.origin).toBe(config.KNOWLEDGEBASE_URL);
  });

  it("autorise KNOWLEDGEBASE_URL sans credentials sur POST /signin/logout", async () => {
    const options = await callDelegate("/signin/logout");

    expect(options.credentials).toBe(false);
    expect(options.origin).toBe(config.KNOWLEDGEBASE_URL);
  });

  it("autorise SUPPORT_FRONT_URL sans credentials sur GET /cohort/public", async () => {
    const options = await callDelegate("/cohort/public");

    expect(options.credentials).toBe(false);
    expect(options.origin).toBe(config.SUPPORT_FRONT_URL);
  });
});
