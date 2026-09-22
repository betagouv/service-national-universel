import request from "supertest";
import { ROLES, PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";
import { StructureModel } from "../models";

/**
 * Constat C8 : `POST /elasticsearch/structure/:action(search|export)` enrichit
 * chaque structure d'un champ `team` lu dans l'index `referent`. Le document
 * referent y était inséré entier — les secrets d'authentification en moins
 * depuis #5310, mais téléphone, mobile, horodatages de connexion et `metadata`
 * compris. Ces tests figent la projection minimale attendue.
 *
 * Complète `elasticsearch-structure-scope.test.ts` (#5334), qui couvre le
 * périmètre géographique de la route et l'absence de secrets dans `team`.
 */

// Champs secrets répliqués par Monstache dans l'index `referent`.
const REFERENT_SECRETS = {
  password: "$2b$10$hashdureferent",
  token2FA: "TOKEN_2FA_REFERENT",
  invitationToken: "TOKEN_INVITATION_REFERENT",
  forgotPasswordResetToken: "TOKEN_RESET_REFERENT",
};

// Données personnelles portées par le document referent, hors secrets.
const REFERENT_PII = {
  phone: "0102030405",
  mobile: "0605040302",
  emailWaitingValidation: "claire.perso@example.org",
  lastLoginAt: "2026-09-20T08:00:00.000Z",
  lastActivityAt: "2026-09-21T09:00:00.000Z",
  lastLogoutAt: "2026-09-20T18:00:00.000Z",
  metadata: { isFirstInvitationPending: true, invitationType: "inscription" },
};

// Ce dont le front a réellement besoin : compter l'équipe (listV3 `Hit`) et
// exporter nom/prénom/email des trois premiers membres (`exportTransform`).
const TEAM_ALLOWED_FIELDS = ["_id", "email", "firstName", "lastName", "role", "structureId"];

const mockEsCalls: { msearch: any[]; search: any[] } = { msearch: [], search: [] };
const mockEsDocsByIndex: Record<string, any[]> = { structure: [], referent: [], mission: [] };

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

  const buildHits = (index: string, source?: any, size?: number) => {
    const docs = mockEsDocsByIndex[index] || [];
    return {
      total: { value: docs.length, relation: "eq" },
      hits: size === 0 ? [] : docs.map((doc) => ({ _id: doc._id, _index: index, _source: applySource(doc, source) })),
    };
  };

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
    // Appelé par `allRecords` (scroll) : c'est ce chemin qui remplit `team`.
    search: jest.fn(async (params: any) => {
      mockEsCalls.search.push(params);
      return { body: { _scroll_id: "scroll-1", hits: buildHits(params.index, params.body?._source, params.body?.size) } };
    }),
    scroll: jest.fn(async () => ({ body: { _scroll_id: null, hits: { total: { value: 0 }, hits: [] } } })),
    clearScroll: jest.fn(async () => ({ body: {} })),
  };
});

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn(), initSentry: jest.fn(), capture404: jest.fn() }));

const STRUCTURE_ID = "6600000000000000000000c1";

function structureDoc(overrides: any = {}) {
  return {
    _id: STRUCTURE_ID,
    name: "Les Restos du Coeur",
    department: "Finistère",
    region: "Bretagne",
    legalStatus: "ASSOCIATION",
    networkId: "",
    status: "VALIDATED",
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
    structureId: STRUCTURE_ID,
    region: "Bretagne",
    department: ["Finistère"],
    ...REFERENT_SECRETS,
    ...REFERENT_PII,
    ...overrides,
  };
}

/** Valeurs secrètes retrouvées n'importe où dans la réponse. */
function leaked(payload: any, values: Record<string, any>): string[] {
  const serialized = JSON.stringify(payload ?? {});
  return Object.entries(values)
    .filter(([, value]) => serialized.includes(typeof value === "string" ? value : JSON.stringify(value)))
    .map(([field]) => field);
}

/** Extrait le `team` du premier résultat, quel que soit le format de la route. */
function firstTeam(body: any, action: "search" | "export") {
  if (action === "export") return body.data?.[0]?.team || [];
  return body.responses?.[0]?.hits?.hits?.[0]?._source?.team || [];
}

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({});
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR],
    PERMISSION_RESOURCES.STRUCTURE,
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
  mockEsDocsByIndex.structure = [structureDoc()];
  mockEsDocsByIndex.referent = [referentDoc()];
  mockEsDocsByIndex.mission = [];
});

describe("C8 — POST /elasticsearch/structure/:action : projection de l'équipe", () => {
  it.each(["search", "export"] as const)("%s — ne renvoie aucun secret d'authentification (acquis de #5310)", async (action) => {
    const app = await getAppHelperWithAcl({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Finistère"], region: "Bretagne" } as any);
    const res = await request(app).post(`/elasticsearch/structure/${action}`).send({ filters: {} });

    expect(res.status).toBe(200);
    expect(leaked(res.body, REFERENT_SECRETS)).toEqual([]);
  });

  it.each(["search", "export"] as const)("%s — ne renvoie que les champs d'équipe utilisés par le front", async (action) => {
    const app = await getAppHelperWithAcl({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Finistère"], region: "Bretagne" } as any);
    const res = await request(app).post(`/elasticsearch/structure/${action}`).send({ filters: {} });

    expect(res.status).toBe(200);
    const team = firstTeam(res.body, action);
    expect(team).toHaveLength(1);
    expect(Object.keys(team[0]).sort()).toEqual(TEAM_ALLOWED_FIELDS);
    expect(leaked(res.body, REFERENT_PII)).toEqual([]);
  });

  it("search — un responsable n'obtient pas non plus les données personnelles de ses collègues", async () => {
    const structure = await StructureModel.create({ name: "Les Restos du Coeur", networkId: "" });
    const app = await getAppHelperWithAcl({ ...getNewReferentFixture(), role: ROLES.RESPONSIBLE, structureId: structure._id.toString() } as any);
    const res = await request(app).post("/elasticsearch/structure/search").send({ filters: {} });

    expect(res.status).toBe(200);
    expect(leaked(res.body, REFERENT_SECRETS)).toEqual([]);
    expect(leaked(res.body, REFERENT_PII)).toEqual([]);
  });

  it("la requête envoyée à Elasticsearch ne demande pas le document referent complet", async () => {
    const app = await getAppHelperWithAcl({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: ["Finistère"], region: "Bretagne" } as any);
    await request(app).post("/elasticsearch/structure/search").send({ filters: {} });

    const referentCall = mockEsCalls.search.find((call) => call.index === "referent");
    expect(referentCall).toBeDefined();
    expect(referentCall.body._source.includes.sort()).toEqual(TEAM_ALLOWED_FIELDS.filter((field) => field !== "_id"));
  });
});
