import request from "supertest";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_JEUNE, ROLES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createYoungHelper } from "./helpers/young";
import getNewYoungFixture from "./fixtures/young";
import { addPermissionHelper } from "./helpers/permissions";
import { PermissionModel } from "../models/permissions/permission";

const mockEsSearchCalls: any[] = [];

const TUTOR_ID = "6500000000000000000000aa";
const STRUCTURE_ID = "6500000000000000000000bb";

jest.mock("../es", () => ({
  search: async (params: any) => {
    mockEsSearchCalls.push({ index: params.index, _source: params.body?._source });
    const hits = {
      mission: [
        {
          _id: "6500000000000000000000cc",
          _source: { name: "Mission validée", status: "VALIDATED", tutorId: TUTOR_ID, structureId: STRUCTURE_ID },
        },
      ],
      referent: [
        {
          _id: TUTOR_ID,
          // champs réellement présents dans l'index ES `referent`
          _source: {
            firstName: "Tuteur",
            lastName: "Test",
            email: "tuteur@example.org",
            phone: "0102030405",
            mobile: "0601020304",
            role: ROLES.RESPONSIBLE,
            subRole: "",
            status: "VALIDATED",
            structureId: STRUCTURE_ID,
            region: "Bretagne",
            department: "Morbihan",
            lastLoginAt: "2026-09-01T00:00:00.000Z",
          },
        },
      ],
      structure: [{ _id: STRUCTURE_ID, _source: { name: "Structure test", city: "Vannes", department: "Morbihan" } }],
    }[params.index as string];
    // Applique la projection _source comme le ferait Elasticsearch.
    const source = params.body?._source;
    const projected = (hits || []).map((hit) =>
      !source || source === "*" ? hit : { ...hit, _source: Object.fromEntries(Object.entries(hit._source).filter(([key]) => (source as string[]).includes(key))) },
    );
    return { body: { hits: { total: { value: projected.length, relation: "eq" }, hits: projected }, aggregations: {} } };
  },
  scroll: async () => ({ body: { _scroll_id: null, hits: { total: { value: 0 }, hits: [] } } }),
  clearScroll: async () => ({}),
  msearch: async () => ({ body: { responses: [] } }),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({ roles: { $in: [ROLE_JEUNE, ROLES.ADMIN] } });
  await addPermissionHelper([ROLE_JEUNE], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.READ);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.FULL);
});
afterAll(dbClose);
afterEach(() => {
  mockEsSearchCalls.length = 0;
  resetAppAuth();
});

describe("POST /elasticsearch/mission/export", () => {
  it("interdit l'export à un compte jeune (C6)", async () => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post("/elasticsearch/mission/export")
      .send({ filters: {}, exportFields: ["tutorId"] });

    expect(res.status).toBe(403);
    expect(mockEsSearchCalls.some((call) => call.index === "referent")).toBe(false);
  });

  it("interdit l'export de structures à un compte jeune (C6)", async () => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post("/elasticsearch/mission/export")
      .send({ filters: {}, exportFields: ["structureId"] });

    expect(res.status).toBe(403);
    expect(mockEsSearchCalls.some((call) => call.index === "structure")).toBe(false);
  });

  it("laisse un compte jeune rechercher les missions validées", async () => {
    const young = await createYoungHelper(getNewYoungFixture());

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .post("/elasticsearch/mission/search")
      .send({ filters: {} });

    expect(res.status).toBe(200);
  });

  it("ne renvoie que les champs tuteur nécessaires à l'export pour un référent autorisé", async () => {
    const res = await request(await getAppHelperWithAcl({ _id: "1", role: ROLES.ADMIN } as any, "referent"))
      .post("/elasticsearch/mission/export")
      .send({ filters: {}, exportFields: ["tutorId"] });

    expect(res.status).toBe(200);
    const tutor = res.body.data[0].tutor;
    expect(tutor).toMatchObject({ firstName: "Tuteur", lastName: "Test", email: "tuteur@example.org" });
    expect(Object.keys(tutor).sort()).toEqual(["_id", "email", "firstName", "lastName", "mobile", "phone"]);
    expect(mockEsSearchCalls.find((call) => call.index === "referent")?._source).not.toEqual("*");
  });
});
