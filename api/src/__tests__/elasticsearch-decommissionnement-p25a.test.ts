import request from "supertest";
import { Types } from "mongoose";
import { DECOMMISSIONED_ROLES, ROLES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";

/**
 * Décommissionnement P25a : les rôles retirés ne passent plus le contrôle d'entrée des routes
 * Elasticsearch de consultation (403), la route cle/young et la route dashboard head-center sont
 * retirées (404) ; admin et référents départementaux/régionaux gardent leurs recherches.
 */


// Le premier cas charge toutes les routes de l'app.
jest.setTimeout(60000);

const mockEsCalls: { msearch: any[]; search: any[] } = { msearch: [], search: [] };

// Agrégation vide à toute profondeur : les routes de tableau de bord lisent `aggregations.x.buckets` sans garde.
const emptyAgg = (): any => new Proxy({ buckets: [], value: 0, doc_count: 0 }, { get: (target: any, key) => (key in target ? target[key] : emptyAgg()) });

jest.mock("../es", () => {
  const emptyHits = { total: { value: 0, relation: "eq" }, hits: [] };
  return {
    msearch: jest.fn(async (params: any) => {
      mockEsCalls.msearch.push(params);
      return {
        body: {
          responses: [
            { hits: emptyHits, aggregations: emptyAgg(), status: 200 },
            { hits: emptyHits, aggregations: emptyAgg(), status: 200 },
          ],
        },
      };
    }),
    search: jest.fn(async (params: any) => {
      mockEsCalls.search.push(params);
      return { body: { _scroll_id: null, hits: emptyHits, aggregations: emptyAgg() } };
    }),
    scroll: jest.fn(async () => ({ body: { _scroll_id: null, hits: { total: { value: 0 }, hits: [] } } })),
    clearScroll: jest.fn(async () => ({ body: {} })),
  };
});

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn(), initSentry: jest.fn(), capture404: jest.fn() }));

const referent = (overrides: any) => getAppHelper({ ...getNewReferentFixture(), _id: new Types.ObjectId(), ...overrides } as any);
const referentRegion = () => referent({ role: ROLES.REFERENT_REGION, region: "Bretagne", department: [] });
const referentDepartement = () => referent({ role: ROLES.REFERENT_DEPARTMENT, region: "Bretagne", department: ["Finistère"] });

const admin = () => referent({ role: ROLES.ADMIN });

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});
beforeEach(() => {
  resetAppAuth();
  mockEsCalls.msearch.length = 0;
  mockEsCalls.search.length = 0;
});

const CONSULTATION_ROUTES = [
  "/elasticsearch/cohesioncenter/search",
  "/elasticsearch/cohesioncenter/export",
  "/elasticsearch/cohesioncenter/presence/search",
  "/elasticsearch/sessionphase1/search",
  "/elasticsearch/lignebus/search",
  "/elasticsearch/lignebus/export",
  "/elasticsearch/plandetransport/search",
  "/elasticsearch/modificationbus/search",
  "/elasticsearch/referent/search",
  "/elasticsearch/cle/classe/search",
  "/elasticsearch/cle/etablissement/search",
  "/elasticsearch/schoolramses/search",
  "/elasticsearch/pointderassemblement/search",
  "/elasticsearch/young/search",
  "/elasticsearch/dashboard/sejour/moderator",
  "/elasticsearch/dashboard/inscription/inscriptionInfo",
];

describe("P25a : les rôles décommissionnés sont refusés à l'entrée des routes de consultation", () => {
  const cases = CONSULTATION_ROUTES.flatMap((route) => DECOMMISSIONED_ROLES.map((role) => [role, route] as const));
  it.each(cases)("%s sur POST %s : 403 et aucune requête Elasticsearch", async (role, route) => {
    const res = await request(referent({ role })).post(route).send({ filters: {} });
    expect(res.status).toBe(403);
    expect(mockEsCalls.msearch).toHaveLength(0);
    expect(mockEsCalls.search).toHaveLength(0);
  });
});

describe("P25a : routes retirées", () => {
  it.each([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ...DECOMMISSIONED_ROLES])("POST /elasticsearch/cle/young/search n'existe plus (%s)", async (role) => {
    const res = await request(referent({ role })).post("/elasticsearch/cle/young/search").send({ filters: {} });
    expect(res.status).toBe(404);
  });

  it.each([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ...DECOMMISSIONED_ROLES])("POST /elasticsearch/dashboard/sejour/head-center n'existe plus (%s)", async (role) => {
    const res = await request(referent({ role })).post("/elasticsearch/dashboard/sejour/head-center").send({ filters: {} });
    expect(res.status).toBe(404);
  });
});

// Non-régression : chemin qui réussit pour admin et référents, sur les vraies routes.
describe("P25a : admin et référents gardent la consultation", () => {
  const actors: Array<[string, () => any]> = [
    ["ADMIN", admin],
    ["REFERENT_REGION", referentRegion],
    ["REFERENT_DEPARTMENT", referentDepartement],
  ];
  const cases = actors.flatMap(([label]) => CONSULTATION_ROUTES.map((route) => [label, route] as const));
  it.each(cases)("%s sur POST %s : 200", async (label, route) => {
    const make = actors.find(([l]) => l === label)![1];
    const res = await request(make()).post(route).send({ filters: {} });
    expect(res.status).toBe(200);
  });
});
