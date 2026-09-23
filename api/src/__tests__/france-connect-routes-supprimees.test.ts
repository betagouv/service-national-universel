/**
 * Lot T3 de l'audit sécurité du 21/09/2026 (M46, M47) : le flux FranceConnect des représentants
 * légaux est supprimé plutôt que corrigé. Il ne servait qu'au consentement et au droit à l'image,
 * qui ne sont plus proposés (plus d'inscriptions), et ses routes publiques restaient appelables.
 *
 * Les champs `parentXFromFranceConnect` restent en base pour l'historique.
 */
import request from "supertest";

import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper from "./helpers/app";

let app: ReturnType<typeof getAppHelper>;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  app = getAppHelper();
});
afterAll(dbClose);

type Method = "post" | "put";

describe("Routes FranceConnect supprimées (M46, M47, M28, M29)", () => {
  const routes: [Method, string][] = [
    ["post", "/young/france-connect/authorization-url"],
    ["post", "/young/france-connect/user-info"],
    ["put", "/representants-legaux/representant-fromFranceConnect/1?parent=1&token=jeton"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    const response = await (request(app) as any)[method](path).send({ callback: "cb", code: "code", state: "state" });
    expect(response.status).toBe(404);
    // Le 404 par défaut d'Express n'a pas de corps applicatif : un gestionnaire encore monté
    // répondrait { ok: false, code }.
    expect(response.body?.ok).toBeUndefined();
    expect(response.body?.code).toBeUndefined();
  });
});
