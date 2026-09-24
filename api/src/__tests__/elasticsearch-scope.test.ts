import request from "supertest";
import { ROLES } from "snu-lib";

import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";

/**
 * Reproduction des constats C3/C4/C9/C10/C11 et H24/H25/H70 :
 * l'index `young` (et `referent`) est interrogeable sans contrôle de rôle ni
 * périmètre, et les hits sont renvoyés bruts — donc avec les champs secrets
 * répliqués par Monstache depuis Mongo.
 */

// Champs secrets répliqués dans ES et qui ne doivent JAMAIS sortir de l'API.
const YOUNG_SECRETS = {
  password: "$2b$10$hashdujeune",
  token2FA: "TOKEN_2FA_JEUNE",
  tokenEmailValidation: "TOKEN_EMAIL_JEUNE",
  invitationToken: "TOKEN_INVITATION_JEUNE",
  phase3Token: "TOKEN_PHASE3_JEUNE",
  forgotPasswordResetToken: "TOKEN_RESET_JEUNE",
  parent1Inscription2023Token: "TOKEN_PARENT1",
  parent2Inscription2023Token: "TOKEN_PARENT2",
};

const REFERENT_SECRETS = {
  password: "$2b$10$hashdureferent",
  token2FA: "TOKEN_2FA_REFERENT",
  invitationToken: "TOKEN_INVITATION_REFERENT",
  forgotPasswordResetToken: "TOKEN_RESET_REFERENT",
};

const mockEsCalls: { msearch: any[]; search: any[] } = { msearch: [], search: [] };
const mockEsDocs: any[] = [];

jest.mock("../es", () => {
  // Reproduit le filtrage `_source` d'Elasticsearch pour que les assertions
  // reflètent ce que le vrai cluster renverrait.
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

  const buildHits = (source?: any, size?: number) => ({
    total: { value: mockEsDocs.length, relation: "eq" },
    hits: size === 0 ? [] : mockEsDocs.map((doc) => ({ _id: doc._id, _index: "young", _source: applySource(doc, source) })),
  });

  return {
    msearch: jest.fn(async (params: any) => {
      mockEsCalls.msearch.push(params);
      const bodies = String(params.body)
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));
      // Les lignes paires sont les en-têtes, les impaires les requêtes.
      const hitsQuery = bodies[1];
      return {
        body: {
          responses: [
            { hits: buildHits(hitsQuery?._source, hitsQuery?.size), status: 200 },
            { hits: { total: { value: 0 }, hits: [] }, aggregations: {}, status: 200 },
          ],
        },
      };
    }),
    search: jest.fn(async (params: any) => {
      mockEsCalls.search.push(params);
      const topHitsSource = params.body?.aggs?.school?.aggs?.firstUser?.top_hits?._source;
      return {
        body: {
          _scroll_id: null,
          hits: buildHits(params.body?._source, params.body?.size),
          aggregations: {
            school: {
              buckets: [
                {
                  key: "school-1",
                  doc_count: mockEsDocs.length,
                  departments: { buckets: [] },
                  firstUser: { hits: buildHits(topHitsSource) },
                },
              ],
            },
          },
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

function setEsDocs(...docs: any[]) {
  mockEsDocs.length = 0;
  mockEsDocs.push(...docs);
}

function youngDoc(overrides: any = {}) {
  return {
    _id: "6600000000000000000000aa",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.org",
    department: "Rhône",
    region: "Auvergne-Rhône-Alpes",
    schoolId: "school-1",
    schoolName: "Lycée Victor Hugo",
    schoolCity: "Lyon",
    schoolZip: "69003",
    schoolDepartment: "Rhône",
    status: "VALIDATED",
    ...YOUNG_SECRETS,
    ...overrides,
  };
}

function referentDoc(overrides: any = {}) {
  return {
    _id: "6600000000000000000000bb",
    firstName: "Claire",
    lastName: "Martin",
    email: "claire.martin@example.org",
    role: ROLES.RESPONSIBLE,
    structureId: "structure-1",
    region: "Bretagne",
    department: ["Finistère"],
    ...REFERENT_SECRETS,
    ...overrides,
  };
}

/** Récupère toutes les valeurs secrètes présentes n'importe où dans la réponse. */
function leakedSecrets(payload: any, secrets: Record<string, string>): string[] {
  const serialized = JSON.stringify(payload ?? {});
  return Object.entries(secrets)
    .filter(([, value]) => serialized.includes(value))
    .map(([field]) => field);
}

/** Aplatit les filtres de contexte envoyés à ES pour vérifier le périmètre. */
function lastMsearchQuery() {
  const call = mockEsCalls.msearch[mockEsCalls.msearch.length - 1];
  return JSON.parse(String(call.body).trim().split("\n")[1]);
}

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT], PERMISSION_RESOURCES.REFERENT, PERMISSION_ACTIONS.READ);
});

afterAll(async () => {
  await dbClose();
});

beforeEach(() => {
  resetAppAuth();
  mockEsCalls.msearch.length = 0;
  mockEsCalls.search.length = 0;
  setEsDocs(youngDoc());
});

// Ces rôles n'existent plus sur la plateforme, mais des comptes résiduels peuvent
// encore les porter en base : ils doivent être refusés, pas simplement inutilisés.
describe("C9 — POST /elasticsearch/young/:action sans contrôle de rôle", () => {
  it.each([
    ROLES.DSNJ,
    ROLES.INJEP,
    ROLES.TRANSPORTER,
    ROLES.ADMINISTRATEUR_CLE,
    ROLES.REFERENT_CLASSE,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.VISITOR,
  ])("refuse la recherche au rôle %s", async (role) => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role } as any))
      .post("/elasticsearch/young/search")
      .send({ filters: {} });
    expect(res.status).toBe(403);
  });

  it.each([
    ROLES.DSNJ,
    ROLES.INJEP,
    ROLES.TRANSPORTER,
    ROLES.ADMINISTRATEUR_CLE,
    ROLES.REFERENT_CLASSE,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.VISITOR,
  ])("refuse l'export au rôle %s", async (role) => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role } as any))
      .post("/elasticsearch/young/export")
      .send({ filters: {} });
    expect(res.status).toBe(403);
  });
});

describe("FH8 — le visiteur n'accède plus aux dossiers des volontaires", () => {
  it.each(["search", "export"])("refuse /elasticsearch/young/%s au rôle visitor, même dans sa région", async (action) => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.VISITOR, region: "Auvergne-Rhône-Alpes" } as any))
      .post(`/elasticsearch/young/${action}`)
      .send({ filters: {} });
    expect(res.status).toBe(403);
    expect(mockEsCalls.msearch).toHaveLength(0);
    expect(mockEsCalls.search).toHaveLength(0);
  });
});

describe("GOO-12 — comptage des volontaires en liste complémentaire (YoungFooterNoRequest)", () => {
  it("accepte size: 0 et ne renvoie aucun dossier, seulement le total", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.ADMIN } as any))
      .post("/elasticsearch/young/search")
      .send({ filters: { status: ["WAITING_LIST"] }, size: 0 });
    expect(res.status).toBe(200);
    const hitsQuery = JSON.parse(String(mockEsCalls.msearch[0].body).trim().split("\n")[1]);
    expect(hitsQuery.size).toBe(0);
    expect(res.body.responses[0].hits.hits).toEqual([]);
    expect(res.body.responses[0].hits.total.value).toBeGreaterThan(0);
  });

  it("refuse toujours une taille de page arbitraire entre 1 et 9", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.ADMIN } as any))
      .post("/elasticsearch/young/search")
      .send({ filters: {}, size: 5 });
    expect(res.status).toBe(400);
  });
});

describe("FH4 — export ES des classes CLE", () => {
  it.each([ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE])("refuse l'export des classes au rôle %s", async (role) => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role } as any))
      .post("/elasticsearch/cle/classe/export?type=export-des-classes")
      .send({ filters: {} });
    expect(res.status).toBe(403);
    expect(mockEsCalls.search).toHaveLength(0);
  });

  it("refuse le schéma de répartition au transporteur, avant toute lecture", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.TRANSPORTER } as any))
      .post("/elasticsearch/cle/classe/export?type=schema-de-repartition")
      .send({ filters: {} });
    expect(res.status).toBe(403);
    expect(mockEsCalls.search).toHaveLength(0);
  });

  it("refuse le schéma de répartition au référent départemental", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT } as any))
      .post("/elasticsearch/cle/classe/export?type=schema-de-repartition")
      .send({ filters: {} });
    expect(res.status).toBe(403);
  });

  it("laisse la recherche des classes au transporteur", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.TRANSPORTER } as any))
      .post("/elasticsearch/cle/classe/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
  });
});

describe("C10/H70 — les hits young sortent bruts", () => {
  it("ne renvoie aucun secret dans la recherche d'un admin", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.ADMIN } as any))
      .post("/elasticsearch/young/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(leakedSecrets(res.body, YOUNG_SECRETS)).toEqual([]);
  });

  it("ne renvoie aucun secret quand l'export les demande explicitement via exportFields", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.ADMIN } as any))
      .post("/elasticsearch/young/export")
      .send({ filters: {}, exportFields: ["firstName", "lastName", ...Object.keys(YOUNG_SECRETS)] });
    expect(res.status).toBe(200);
    expect(leakedSecrets(res.body, YOUNG_SECRETS)).toEqual([]);
  });
});

describe("C11 — POST /elasticsearch/young/young-having-school-in-dep-or-region/:action", () => {
  it.each([ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER, ROLES.VISITOR, ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE])(
    "refuse le rôle %s, qui n'a aucun filtre de périmètre",
    async (role) => {
      const res = await request(getAppHelper({ ...getNewReferentFixture(), role } as any))
        .post("/elasticsearch/young/young-having-school-in-dep-or-region/_msearch")
        .send({ filters: {} });
      expect(res.status).toBe(403);
    },
  );

  it("ne renvoie aucun secret à un référent départemental", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Rhône"] } as any))
      .post("/elasticsearch/young/young-having-school-in-dep-or-region/_msearch")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(leakedSecrets(res.body, YOUNG_SECRETS)).toEqual([]);
  });
});

describe("C3 — POST /elasticsearch/cle/young/search", () => {
  it("ne renvoie aucun secret à un référent de classe", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_CLASSE } as any))
      .post("/elasticsearch/cle/young/search")
      .send({ filters: {} });
    // 404 possible si le référent n'a pas de classe : on ne teste la fuite que sur un 200.
    if (res.status === 200) {
      expect(leakedSecrets(res.body, YOUNG_SECRETS)).toEqual([]);
    }
    expect([200, 404]).toContain(res.status);
  });
});

describe("C4 — POST /elasticsearch/dashboard/inscription/youngBySchool", () => {
  it("ne renvoie pas le document jeune complet dans l'agrégation top_hits", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.VISITOR, region: "Auvergne-Rhône-Alpes" } as any))
      .post("/elasticsearch/dashboard/inscription/youngBySchool")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(leakedSecrets(res.body, YOUNG_SECRETS)).toEqual([]);
    const source = res.body.aggregations.school.buckets[0].firstUser.hits.hits[0]._source;
    // Le tableau n'affiche que l'établissement : aucune donnée personnelle ne doit transiter.
    expect(source.email).toBeUndefined();
    expect(source.lastName).toBeUndefined();
    expect(source.schoolName).toBe("Lycée Victor Hugo");
  });
});

describe("H24/H25/H70 — index referent", () => {
  beforeEach(() => {
    setEsDocs(referentDoc());
  });

  it("H25 — /referent/structure/:structure ne renvoie aucun secret", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.ADMIN } as any))
      .post("/elasticsearch/referent/structure/structure-1")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(leakedSecrets(res.body, REFERENT_SECRETS)).toEqual([]);
  });

  it("H25 — /referent/structure/:structure refuse une structure hors périmètre", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.RESPONSIBLE, structureId: "structure-2" } as any))
      .post("/elasticsearch/referent/structure/structure-1")
      .send({ filters: {} });
    expect(res.status).toBe(403);
  });

  it("H24 — /referent/team/export ne renvoie aucun secret", async () => {
    const app = await getAppHelperWithAcl({ ...getNewReferentFixture(), role: ROLES.REFERENT_REGION, region: "Bretagne" } as any);
    const res = await request(app).post("/elasticsearch/referent/team/export").send({ filters: {} });
    expect(res.status).toBe(200);
    expect(leakedSecrets(res.body, REFERENT_SECRETS)).toEqual([]);
  });

  it("H24 — la recherche referent d'un référent départemental est bornée géographiquement", async () => {
    const res = await request(getAppHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Finistère"], region: "Bretagne" } as any))
      .post("/elasticsearch/referent/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    const query = JSON.stringify(lastMsearchQuery());
    // Sans borne géographique, aucun des champs de périmètre n'apparaît dans la requête.
    expect(query).toMatch(/region\.keyword|department\.keyword|structureId\.keyword/);
    expect(leakedSecrets(res.body, REFERENT_SECRETS)).toEqual([]);
  });
});
