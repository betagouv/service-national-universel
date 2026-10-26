import request from "supertest";
import { ROLES, PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";

import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";

/**
 * Reproduction des constats C5, H26 et H27 : trois routes Elasticsearch qui
 * renvoient des jeunes (PII, santé, parents) à des rôles sans périmètre.
 *
 * - C5  POST /elasticsearch/lignebus/export
 * - H27 POST /elasticsearch/young/by-session/:sessionId/:action
 * - H26 POST /elasticsearch/application/:action (+ by-young, by-mission)
 */

/** Documents indexés, par index ES. */
const mockEsDocs: Record<string, any[]> = {};
const mockEsCalls: { msearch: any[]; search: any[] } = { msearch: [], search: [] };

jest.mock("../es", () => {
  const applySource = (doc: any, source: any) => {
    if (!source || source === "*") return { ...doc };
    const includes = Array.isArray(source) ? source : source.includes;
    const excludes = Array.isArray(source) ? [] : source.excludes || [];
    let out = { ...doc };
    if (includes && !(includes.length === 1 && includes[0] === "*")) {
      out = Object.fromEntries(Object.entries(out).filter(([key]) => includes.includes(key)));
    }
    for (const field of excludes) delete out[field];
    return out;
  };

  const docsFor = (index: string) => mockEsDocs[index] || [];

  const buildHits = (index: string, source?: any, size?: number) => ({
    total: { value: docsFor(index).length, relation: "eq" },
    hits: size === 0 ? [] : docsFor(index).map((doc) => ({ _id: doc._id, _index: index, _source: applySource(doc, source) })),
  });

  return {
    msearch: jest.fn(async (params: any) => {
      mockEsCalls.msearch.push(params);
      const bodies = String(params.body)
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));
      const hitsQuery = bodies[1];
      return {
        body: {
          responses: [
            { hits: buildHits(params.index, hitsQuery?._source, hitsQuery?.size), status: 200 },
            { hits: { total: { value: 0 }, hits: [] }, aggregations: {}, status: 200 },
          ],
        },
      };
    }),
    search: jest.fn(async (params: any) => {
      mockEsCalls.search.push(params);
      return {
        body: {
          _scroll_id: null,
          hits: buildHits(params.index, params.body?._source, params.body?.size),
        },
      };
    }),
    scroll: jest.fn(async () => ({ body: { _scroll_id: null, hits: { total: { value: 0 }, hits: [] } } })),
    clearScroll: jest.fn(async () => ({ body: {} })),
  };
});

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn(), initSentry: jest.fn(), capture404: jest.fn() }));

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

const SESSION_ID = "6600000000000000000000ee";

/** Un jeune breton : hors périmètre de tous les attaquants testés. */
function youngDoc(overrides: any = {}) {
  return {
    _id: "6600000000000000000000aa",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.org",
    phone: "0600000000",
    address: "12 rue des Lilas",
    department: "Finistère",
    region: "Bretagne",
    status: "VALIDATED",
    ligneId: "ligne-1",
    meetingPointId: "pdr-1",
    sessionPhase1Id: SESSION_ID,
    allergies: "true",
    handicap: "true",
    parent1Email: "parent@example.org",
    parent1Phone: "0700000000",
    ...overrides,
  };
}

/** Les champs qui ne doivent jamais atteindre un rôle hors périmètre. */
const YOUNG_PII = ["jean.dupont@example.org", "0600000000", "12 rue des Lilas", "parent@example.org", "0700000000"];

function leakedPii(payload: any): string[] {
  const serialized = JSON.stringify(payload ?? {});
  return YOUNG_PII.filter((value) => serialized.includes(value));
}

function setEsDocs(docs: Record<string, any[]>) {
  for (const key of Object.keys(mockEsDocs)) delete mockEsDocs[key];
  Object.assign(mockEsDocs, docs);
}

/** Aplatit toutes les requêtes ES émises pendant le test. */
function allQueries(): string {
  const msearch = mockEsCalls.msearch.map((call) => String(call.body));
  const search = mockEsCalls.search.map((call) => JSON.stringify(call.body));
  return [...msearch, ...search].join("\n");
}

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR],
    PERMISSION_RESOURCES.APPLICATION,
    PERMISSION_ACTIONS.READ,
  );
});

afterAll(async () => {
  await dbClose();
});

beforeEach(() => {
  resetAppAuth();
  mockEsCalls.msearch.length = 0;
  mockEsCalls.search.length = 0;
  setEsDocs({
    young: [youngDoc()],
    lignebus: [
      {
        _id: "ligne-1",
        busId: "BUS-1",
        cohort: "Juillet 2024",
        centerId: "center-1",
        meetingPointsIds: ["pdr-1"],
        team: [{ _id: "convoyeur-1", firstName: "Convoy", lastName: "Eur", email: "convoyeur@example.org", phone: "0611111111" }],
      },
    ],
    pointderassemblement: [{ _id: "pdr-1", region: "Bretagne", department: "Finistère", name: "Gare de Brest" }],
    cohesioncenter: [{ _id: "center-1", name: "Centre de Brest", region: "Bretagne" }],
    application: [{ _id: "app-1", youngId: "6600000000000000000000aa", youngDepartment: "Finistère", youngEmail: "jean.dupont@example.org", status: "VALIDATED" }],
  });
});

describe("C5 — POST /elasticsearch/lignebus/export", () => {
  // Le front ne propose cet export qu'aux rôles de canExportLigneBus.
  it.each([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE])("refuse l'export au rôle %s", async (role) => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role } as any))
      .post("/elasticsearch/lignebus/export")
      .send({ filters: {} });
    expect(res.status).toBe(403);
  });

  it("borne un référent régional aux points de rassemblement de sa région", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_REGION, region: "Bretagne" } as any))
      .post("/elasticsearch/lignebus/export")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(allQueries()).toContain("meetingPointId.keyword");
  });
});

describe("H27 — POST /elasticsearch/young/by-session/:sessionId/:action", () => {
  it.each([ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE])("refuse la recherche au rôle %s, sans vérification d'appartenance", async (role) => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role } as any))
      .post(`/elasticsearch/young/by-session/${SESSION_ID}/search`)
      .send({ filters: {} });
    expect(res.status).toBe(403);
    expect(leakedPii(res.body)).toEqual([]);
  });

  it.each([ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE])("refuse l'export au rôle %s", async (role) => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role } as any))
      .post(`/elasticsearch/young/by-session/${SESSION_ID}/export`)
      .send({ filters: {} });
    expect(res.status).toBe(403);
    expect(leakedPii(res.body)).toEqual([]);
  });

  it("laisse passer un admin", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.ADMIN } as any))
      .post(`/elasticsearch/young/by-session/${SESSION_ID}/search`)
      .send({ filters: {} });
    expect(res.status).toBe(200);
  });
});

describe("PH7 — coordonnées des accompagnateurs de bus (team)", () => {
  it("retire team de POST /elasticsearch/lignebus/search hors ADMIN", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_REGION, region: "Bretagne" } as any))
      .post("/elasticsearch/lignebus/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("convoyeur@example.org");
  });

  it("laisse team à un ADMIN sur POST /elasticsearch/lignebus/search", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.ADMIN } as any))
      .post("/elasticsearch/lignebus/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toContain("convoyeur@example.org");
  });

  it("retire team de POST /elasticsearch/lignebus/export hors ADMIN", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_REGION, region: "Bretagne" } as any))
      .post("/elasticsearch/lignebus/export")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("convoyeur@example.org");
  });
});

describe("PH10 — POST /elasticsearch/young/in-bus/:ligneId/:action et by-point-de-rassemblement", () => {
  it("borne un référent départemental à son département sur /in-bus/:ligneId/search", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Rhône"] } as any))
      .post("/elasticsearch/young/in-bus/ligne-1/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    const queries = allQueries();
    expect(queries).toContain("department.keyword");
    expect(queries).toContain("Rhône");
  });

  it("borne un référent départemental à son département sur /by-point-de-rassemblement/:id/search", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Rhône"] } as any))
      .post("/elasticsearch/young/by-point-de-rassemblement/pdr-1/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    const queries = allQueries();
    expect(queries).toContain("department.keyword");
    expect(queries).toContain("Rhône");
  });

  it("borne un référent départemental à son département sur /by-point-de-rassemblement/aggs", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Rhône"] } as any))
      .post("/elasticsearch/young/by-point-de-rassemblement/aggs")
      .send({ filters: { meetingPointIds: ["pdr-1"] } });
    expect(res.status).toBe(200);
    const queries = allQueries();
    expect(queries).toContain("department.keyword");
    expect(queries).toContain("Rhône");
  });

  it("laisse un admin sans filtre département sur /in-bus/:ligneId/search", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.ADMIN } as any))
      .post("/elasticsearch/young/in-bus/ligne-1/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
  });
});

describe("H26 — POST /elasticsearch/application/:action", () => {
  it("borne un référent départemental à son département", async () => {
    const app = await getAppHelperWithAcl({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Rhône"], region: "Auvergne-Rhône-Alpes" } as any);
    const res = await request(app).post("/elasticsearch/application/export").send({ filters: {}, exportFields: ["youngId"] });
    expect(res.status).toBe(200);
    const queries = allQueries();
    expect(queries).toContain("youngDepartment.keyword");
    expect(queries).toContain("Rhône");
  });

  it("borne un référent régional aux départements de sa région", async () => {
    const app = await getAppHelperWithAcl({ ...getNewReferentFixture(), role: ROLES.REFERENT_REGION, region: "Bretagne" } as any);
    const res = await request(app).post("/elasticsearch/application/search").send({ filters: {} });
    expect(res.status).toBe(200);
    const queries = allQueries();
    expect(queries).toContain("youngDepartment.keyword");
    expect(queries).toContain("Finistère");
  });

  it("borne aussi /by-young/:id, qui accepte n'importe quel youngId", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Rhône"] } as any))
      .post("/elasticsearch/application/by-young/6600000000000000000000aa/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(allQueries()).toContain("youngDepartment.keyword");
  });
});
