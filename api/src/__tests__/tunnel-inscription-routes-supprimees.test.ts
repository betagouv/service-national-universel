/**
 * Décommissionnement du tunnel d'inscription et de réinscription (lot H1 de l'audit du 21/09/2026 :
 * M51, M52, M53, M55, M58).
 *
 * Les inscriptions sont fermées : `POST /young/signup` répond 403 et `/preinscription` renvoie vers
 * snu.gouv.fr. Les routes du tunnel restaient pourtant servies à tout jeune connecté, quel que soit
 * son statut, et lui permettaient de réécrire son identité vérifiée, son département, sa cohorte ou
 * son statut de dossier. Elles sont supprimées ; le changement de séjour passe par
 * `PUT /young/change-cohort`, qui reste en place.
 */
import request from "supertest";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";
import { dbConnect, dbClose } from "./helpers/db";
import { YoungDocument } from "../models";
import { ERRORS } from "../utils";

let young: YoungDocument;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  young = await createYoungHelper(getNewYoungFixture());
});
afterAll(dbClose);
afterEach(resetAppAuth);

type Method = "get" | "post" | "put";

async function expectRouteRemoved(method: Method, path: string) {
  const response = await (request(getAppHelper(young)) as any)[method](path).send({});
  expect(response.status).toBe(404);
  // Le 404 par défaut d'Express n'a pas de corps applicatif : un gestionnaire encore monté qui ne
  // trouve pas la ressource répondrait { ok: false, code: "NOT_FOUND" }.
  expect(response.body?.ok).toBeUndefined();
  expect(response.body?.code).toBeUndefined();
}

describe("Tunnel d'inscription supprimé — routes /young/inscription2023/*", () => {
  const routes: [Method, string][] = [
    ["put", "/young/inscription2023/eligibilite"],
    ["put", "/young/inscription2023/noneligible"],
    ["put", "/young/inscription2023/coordinates/next"],
    ["put", "/young/inscription2023/coordinates/correction"],
    ["put", "/young/inscription2023/consentement"],
    ["put", "/young/inscription2023/representants/next"],
    ["put", "/young/inscription2023/confirm"],
    ["put", "/young/inscription2023/changeCohort"],
    ["put", "/young/inscription2023/done"],
    ["put", "/young/inscription2023/goToInscriptionAgain"],
    ["put", "/young/inscription2023/profil"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });
});

describe("Tunnel d'inscription supprimé — /young/inscription2023/documents/*", () => {
  // Sans sous-routeur `/inscription2023`, ce chemin tombe sur `/young/:id/documents` avec
  // `id = "inscription2023"` : le contrôle d'appartenance le rejette avant tout gestionnaire.
  it.each(["next", "correction"])("PUT /young/inscription2023/documents/%s n'atteint plus aucun gestionnaire", async (type) => {
    const response = await request(getAppHelper(young)).put(`/young/inscription2023/documents/${type}`).send({});
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ ok: false, code: ERRORS.INVALID_PARAMS });
  });
});

describe("Tunnel de réinscription supprimé — routes /young/reinscription/*", () => {
  const routes: [Method, string][] = [
    ["put", "/young/reinscription"],
    ["put", "/young/reinscription/not-eligible"],
    ["post", "/young/reinscription/eligibilite"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });
});

describe("Routes de réinscription sans appelant supprimées", () => {
  const routes: [Method, string][] = [
    ["get", "/cohort-session/isReInscriptionOpen"],
    ["get", "/cohort-group/open"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });
});
