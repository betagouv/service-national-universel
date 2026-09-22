import request from "supertest";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { clearDatabase, dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { createStructureHelper } from "./helpers/structure";
import getNewStructureFixture from "./fixtures/structure";

jest.setTimeout(30000);

const STRUCTURE_BZH = "6500000000000000000000b1";
const STRUCTURE_GARD = "6500000000000000000000b2";

/** Requêtes réellement envoyées à Elasticsearch, pour inspecter le périmètre appliqué. */
const esQueries: { index: string; query: any }[] = [];

/** Applique la projection `_source` comme le ferait le cluster. */
function project(source: any, sourceFilter: any) {
  if (!sourceFilter || sourceFilter === "*") return source;
  const includes = Array.isArray(sourceFilter) ? sourceFilter : sourceFilter.includes || ["*"];
  const excludes = Array.isArray(sourceFilter) ? [] : sourceFilter.excludes || [];
  const kept = includes.includes("*") ? Object.entries(source) : Object.entries(source).filter(([key]) => includes.includes(key));
  return Object.fromEntries(kept.filter(([key]) => !excludes.includes(key)));
}

/** Document tel que Monstache le réplique aujourd'hui : secrets compris. */
const REFERENT_GARD = {
  _id: "6500000000000000000000c1",
  _source: {
    firstName: "Responsable",
    lastName: "Gard",
    email: "responsable.gard@example.org",
    role: ROLES.RESPONSIBLE,
    region: "Occitanie",
    structureId: STRUCTURE_GARD,
    password: "$2b$10$hashdumotdepasseduresponsable",
    token2FA: "123456",
    token2FAExpires: "2030-01-01T00:00:00.000Z",
    invitationToken: "invit-token-gard",
    forgotPasswordResetToken: "reset-token-gard",
  },
};

jest.mock("../es", () => ({
  msearch: async (params: any) => {
    const [, hitsBody] = String(params.body).trim().split("\n");
    esQueries.push({ index: params.index, query: JSON.parse(hitsBody).query });
    return {
      body: {
        responses: [
          {
            hits: {
              total: { value: 2, relation: "eq" },
              hits: [
                { _id: STRUCTURE_BZH, _source: { name: "Structure Morbihan", department: "Morbihan", region: "Bretagne" } },
                { _id: STRUCTURE_GARD, _source: { name: "Structure Gard", department: "Gard", region: "Occitanie" } },
              ],
            },
          },
          { aggregations: {} },
        ],
      },
    };
  },
  // allRecords() : search puis scroll.
  search: async (params: any) => {
    esQueries.push({ index: params.index, query: params.body?.query });
    const hits = { referent: [REFERENT_GARD] }[params.index as string] || [];
    return {
      body: {
        _scroll_id: null,
        hits: { total: { value: hits.length }, hits: hits.map((hit) => ({ ...hit, _source: project(hit._source, params.body?._source) })) },
      },
    };
  },
  scroll: async () => ({ body: { _scroll_id: null, hits: { total: { value: 0 }, hits: [] } } }),
  clearScroll: async () => ({}),
}));

const referentMorbihan = { _id: "6500000000000000000000a1", role: ROLES.REFERENT_DEPARTMENT, department: ["Morbihan"], region: "Bretagne" };
const responsableGard = { _id: "6500000000000000000000a2", role: ROLES.RESPONSIBLE, structureId: STRUCTURE_GARD };

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  // La base de test survit d'une exécution à l'autre : les fixtures à `_id` fixe entreraient en collision.
  await clearDatabase();
  // Policies telles que réellement seedées par la migration seed-responsable-permissions.
  await addPermissionHelper([ROLES.REFERENT_DEPARTMENT], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.READ, {
    where: [{ field: "department", source: "department" }],
  } as any);
  await addPermissionHelper([ROLES.RESPONSIBLE], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.READ, {
    where: [{ field: "_id", source: "structureId" }],
  } as any);
  await addPermissionHelper([ROLES.RESPONSIBLE], PERMISSION_RESOURCES.REFERENT, PERMISSION_ACTIONS.FULL, {
    where: [{ field: "_id", source: "structureId" }],
  } as any);
  await createStructureHelper({ ...getNewStructureFixture(), _id: STRUCTURE_GARD, department: "Gard", region: "Occitanie", networkId: "" });
});
afterAll(dbClose);
afterEach(() => {
  esQueries.length = 0;
  resetAppAuth();
});

describe("POST /elasticsearch/structure/search", () => {
  it("borne la recherche au périmètre départemental du référent (C8)", async () => {
    const res = await request(await getAppHelperWithAcl(referentMorbihan as any, "referent"))
      .post("/elasticsearch/structure/search")
      .send({ filters: {} });

    expect(res.status).toBe(200);
    const structureQuery = esQueries.find((call) => call.index === "structure");
    expect(JSON.stringify(structureQuery?.query?.bool?.filter)).toContain("Morbihan");
  });

  it("laisse au responsable sa structure, qu'aucune borne géographique ne couvre", async () => {
    const res = await request(await getAppHelperWithAcl(responsableGard as any, "referent"))
      .post("/elasticsearch/structure/search")
      .send({ filters: {} });

    expect(res.status).toBe(200);
    const structureQuery = esQueries.find((call) => call.index === "structure");
    expect(JSON.stringify(structureQuery?.query?.bool?.filter)).toContain(STRUCTURE_GARD);
  });

  it("ne renvoie jamais les secrets des référents dans l'équipe des structures (C7)", async () => {
    const res = await request(await getAppHelperWithAcl(referentMorbihan as any, "referent"))
      .post("/elasticsearch/structure/search")
      .send({ filters: {} });

    const team = res.body?.responses?.[0]?.hits?.hits?.find((hit: any) => hit._id === STRUCTURE_GARD)?._source?.team;
    expect(team?.[0]).toBeDefined();
    expect(team[0].email).toBe("responsable.gard@example.org");
    for (const secret of ["password", "token2FA", "token2FAExpires", "invitationToken", "forgotPasswordResetToken"]) {
      expect(team[0][secret]).toBeUndefined();
    }
  });
});

describe("POST /elasticsearch/referent/team/export", () => {
  it("borne l'annuaire au périmètre du responsable sans lui fermer la route (C7)", async () => {
    const res = await request(await getAppHelperWithAcl(responsableGard as any, "referent"))
      .post("/elasticsearch/referent/team/export")
      .send({ filters: {} });

    expect(res.status).toBe(200);
    const referentQuery = esQueries.find((call) => call.index === "referent");
    // Sans borne, la requête ne portait qu'un `match_all` : tout l'annuaire national.
    expect(JSON.stringify(referentQuery?.query?.bool?.filter)).toContain(STRUCTURE_GARD);
  });
});
