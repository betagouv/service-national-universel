import request from "supertest";

import { dbConnect, dbClose } from "./helpers/db";
import { getAppHelperWithAcl } from "./helpers/app";

// Schéma et table de répartition retirés (lot L2 : M23, M24, M25, L18, L19 ; M30).
// Les appels sont faits avec un admin authentifié : sur les routes encore montées, ce rôle
// passe toutes les gardes, donc un 404 ne peut venir que du démontage.
let app: Awaited<ReturnType<typeof getAppHelperWithAcl>>;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  app = await getAppHelperWithAcl();
});
afterAll(dbClose);

type Method = "get" | "post" | "put" | "delete";

const SESSION_ID = "5f1c5b0a0000000000000000";

async function callRoute(method: Method, path: string, body: object = {}) {
  const agent = request(app) as any;
  return agent[method](path).send(body);
}

async function expectRouteRemoved(method: Method, path: string, body?: object) {
  const response = await callRoute(method, path, body);
  expect(response.status).toBe(404);
  // Une route démontée tombe dans le 404 par défaut d'Express, sans corps JSON de l'API.
  // Un gestionnaire encore monté qui ne trouve pas la ressource répond, lui,
  // { ok: false, code: "NOT_FOUND" } : même statut, mais corps applicatif.
  expect(response.body?.ok).toBeUndefined();
  expect(response.body?.code).toBeUndefined();
}

describe("Schéma de répartition supprimé (M23, M24, L18, L19)", () => {
  const routes: [Method, string][] = [
    ["get", "/schema-de-repartition/2026"],
    ["get", "/schema-de-repartition/Bretagne/2026"],
    ["get", "/schema-de-repartition/export/2026"],
    ["get", "/schema-de-repartition/centers/35/2026?filter=a"],
    ["get", "/schema-de-repartition/pdr/2026?filter=a"],
    ["post", "/schema-de-repartition"],
    ["put", `/schema-de-repartition/${SESSION_ID}`],
    ["delete", `/schema-de-repartition/${SESSION_ID}`],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });
});

describe("Table de répartition supprimée (M25)", () => {
  const body = { cohort: "2026", fromRegion: "Bretagne", toRegion: "Normandie" };
  const routes: [Method, string][] = [
    ["post", "/table-de-repartition/region"],
    ["post", "/table-de-repartition/delete/region"],
    ["post", "/table-de-repartition/department"],
    ["post", "/table-de-repartition/delete/department"],
    ["get", "/table-de-repartition/national/2026"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path, body);
  });
});

describe("Schéma de répartition d'une session supprimé (M30)", () => {
  it("GET /session-phase1/:id/schema-repartition n'est plus montée", async () => {
    await expectRouteRemoved("get", `/session-phase1/${SESSION_ID}/schema-repartition`);
  });

  // Garde-fou : le routeur session-phase1 reste monté. Identifiant invalide : une route vivante
  // répond 400 (validateId), une route supprimée répondrait 404.
  it("GET /session-phase1/:id/cohesion-center est toujours montée", async () => {
    const response = await callRoute("get", "/session-phase1/identifiant-invalide/cohesion-center");
    expect(response.status).toBe(400);
  });
});
