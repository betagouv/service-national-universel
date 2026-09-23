/**
 * Décommissionnement du parcours des représentants légaux.
 *
 * Il n'y a plus d'inscriptions : le consentement, le droit à l'image et l'acceptation du règlement
 * intérieur par les parents ne sont plus proposés. Les routes publiques authentifiées par jeton parent
 * (`/representants-legaux/*`) et toutes celles qui envoyaient à un parent un lien vers ces pages sont
 * supprimées. Les consentements déjà donnés restent en base et s'affichent en lecture seule dans l'admin.
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

type Method = "get" | "post" | "put";

const YOUNG_ID = "5f1c5b0a0000000000000000";

async function expectRouteRemoved(method: Method, path: string) {
  const response = await (request(app) as any)[method](path).send({});
  expect(response.status).toBe(404);
  // Le 404 par défaut d'Express n'a pas de corps applicatif : un gestionnaire encore monté qui ne
  // trouve pas la ressource répondrait { ok: false, code: "NOT_FOUND" }.
  expect(response.body?.ok).toBeUndefined();
  expect(response.body?.code).toBeUndefined();
}

describe("Parcours parent supprimé — routes authentifiées par jeton parent", () => {
  const routes: [Method, string][] = [
    ["get", "/representants-legaux/young?token=jeton&parent=1"],
    ["post", "/representants-legaux/data-verification?token=jeton&parent=1"],
    ["post", "/representants-legaux/accept-ri?token=jeton&parent=1"],
    ["post", "/representants-legaux/consent?token=jeton&parent=1"],
    ["post", "/representants-legaux/consent-image-rights?token=jeton&parent=1"],
    ["post", "/representants-legaux/cni-invalide?token=jeton&parent=1"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });
});

describe("Parcours parent supprimé — envois de liens aux parents", () => {
  const routes: [Method, string][] = [
    ["put", "/young/accept-ri"],
    ["put", "/young/inscription2023/relance"],
    ["post", `/correction-request/${YOUNG_ID}/remind-cni`],
    ["put", `/young-edition/${YOUNG_ID}/parent-allow-snu`],
    ["get", `/young-edition/${YOUNG_ID}/remider/1`],
    ["put", `/young-edition/${YOUNG_ID}/parent-image-rights-reset`],
    ["put", `/young-edition/${YOUNG_ID}/parent-allow-snu-reset`],
    ["put", `/young-edition/${YOUNG_ID}/reminder-parent-image-rights`],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });
});
