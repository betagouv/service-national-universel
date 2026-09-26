import request from "supertest";
import passport from "passport";
import { Types } from "mongoose";
import { ROLES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { CohesionCenterModel, LigneBusModel, PointDeRassemblementModel, SessionPhase1Model } from "../models";

/**
 * Lot L4 : index Elasticsearch restés sans périmètre et recherches non bornées.
 *
 * - M16 modificationbus, M17 sessionphase1, L12 lignebus, L14 pointderassemblement :
 *   périmètre géographique des référents, rôles hors périmètre refusés ;
 * - L11 dashboard/inscription, L15 schoolramses/public/search, L13 missions côté jeune ;
 * - L10 association : route supprimée.
 */

// Le premier cas charge toutes les routes de l'app.
jest.setTimeout(60000);

const mockEsCalls: { msearch: any[]; search: any[] } = { msearch: [], search: [] };

jest.mock("../es", () => {
  const emptyHits = { total: { value: 0, relation: "eq" }, hits: [] };
  return {
    msearch: jest.fn(async (params: any) => {
      mockEsCalls.msearch.push(params);
      return {
        body: {
          responses: [
            { hits: emptyHits, status: 200 },
            { hits: emptyHits, aggregations: {}, status: 200 },
          ],
        },
      };
    }),
    search: jest.fn(async (params: any) => {
      mockEsCalls.search.push(params);
      return { body: { _scroll_id: null, hits: emptyHits, aggregations: { status: { buckets: [] } } } };
    }),
    scroll: jest.fn(async () => ({ body: { _scroll_id: null, hits: { total: { value: 0 }, hits: [] } } })),
    clearScroll: jest.fn(async () => ({ body: {} })),
  };
});

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn(), initSentry: jest.fn(), capture404: jest.fn() }));

/** Corps (hits) des requêtes msearch émises, dans l'ordre. */
function msearchHitsBodies(): any[] {
  return mockEsCalls.msearch.map((call) => {
    const lines = String(call.body)
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    return lines[1];
  });
}

function allQueries(): string {
  return [...mockEsCalls.msearch.map((call) => String(call.body)), ...mockEsCalls.search.map((call) => JSON.stringify(call.body))].join("\n");
}

const referent = (overrides: any) => getAppHelper({ ...getNewReferentFixture(), _id: new Types.ObjectId(), ...overrides } as any);
const referentRegion = () => referent({ role: ROLES.REFERENT_REGION, region: "Bretagne", department: [] });
const referentDepartement = () => referent({ role: ROLES.REFERENT_DEPARTMENT, region: "Bretagne", department: ["Finistère"] });

let ligneBretonneId: string;
let ligneLyonnaiseId: string;
let ligneDepartBretonId: string;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await Promise.all([CohesionCenterModel, LigneBusModel, PointDeRassemblementModel, SessionPhase1Model].map((model: any) => model.deleteMany({})));
  const centreBrest = await CohesionCenterModel.create({ name: "Centre de Brest", region: "Bretagne", department: "Finistère" });
  const centreLyon = await CohesionCenterModel.create({ name: "Centre de Lyon", region: "Auvergne-Rhône-Alpes", department: "Rhône" });
  const pdr = { address: "Parvis de la gare", cohorts: [] };
  const pdrQuimper = await PointDeRassemblementModel.create({
    ...pdr,
    name: "Gare de Quimper",
    city: "Quimper",
    zip: "29000",
    academie: "Rennes",
    region: "Bretagne",
    department: "Finistère",
    code: "PDR-QUI",
    matricule: "PDR-QUI",
  });
  const pdrLyon = await PointDeRassemblementModel.create({
    ...pdr,
    name: "Gare de Lyon",
    city: "Lyon",
    zip: "69000",
    academie: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    department: "Rhône",
    code: "PDR-LYO",
    matricule: "PDR-LYO",
  });
  const ligne = (busId: string, centerId: string, meetingPointId: string) =>
    LigneBusModel.create({
      cohort: "Juillet 2024",
      busId,
      departuredDate: new Date(),
      returnDate: new Date(),
      youngCapacity: 10,
      totalCapacity: 12,
      followerCapacity: 2,
      travelTime: "1:00",
      sessionId: new Types.ObjectId().toString(),
      centerId,
      centerArrivalTime: "10:00",
      centerDepartureTime: "16:00",
      meetingPointsIds: [meetingPointId],
    } as any);
  ligneBretonneId = String((await ligne("BUS-BRE", String(centreBrest._id), String(pdrQuimper._id)))._id);
  ligneLyonnaiseId = String((await ligne("BUS-LYO", String(centreLyon._id), String(pdrLyon._id)))._id);
  // Part de Quimper, arrive à Lyon : visible du référent breton dans les listes.
  ligneDepartBretonId = String((await ligne("BUS-QUI-LYO", String(centreLyon._id), String(pdrQuimper._id)))._id);
});

afterAll(async () => {
  await dbClose();
});

beforeEach(() => {
  resetAppAuth();
  mockEsCalls.msearch.length = 0;
  mockEsCalls.search.length = 0;
});

describe("M17 — POST /elasticsearch/sessionphase1", () => {
  it.each([ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE, ROLES.HEAD_CENTER, ROLES.RESPONSIBLE])("refuse la recherche au rôle %s", async (role) => {
    const res = await request(referent({ role })).post("/elasticsearch/sessionphase1/search").send({ filters: {} });
    expect(res.status).toBe(403);
    expect(mockEsCalls.msearch).toHaveLength(0);
  });

  it("refuse l'affectation au transporteur", async () => {
    const res = await request(referent({ role: ROLES.TRANSPORTER }))
      .post("/elasticsearch/sessionphase1/young-affectation/Juillet%202024/search")
      .send({ filters: {} });
    expect(res.status).toBe(403);
  });

  it("borne un référent régional à sa région (recherche et affectation)", async () => {
    let res = await request(referentRegion()).post("/elasticsearch/sessionphase1/search").send({ filters: {} });
    expect(res.status).toBe(200);
    res = await request(referentRegion()).post("/elasticsearch/sessionphase1/young-affectation/Juillet%202024/search").send({ filters: {} });
    expect(res.status).toBe(200);
    for (const body of msearchHitsBodies()) expect(JSON.stringify(body.query)).toContain('{"term":{"region.keyword":"Bretagne"}}');
  });

  it("laisse l'admin sans filtre géographique", async () => {
    const res = await request(referent({ role: ROLES.ADMIN }))
      .post("/elasticsearch/sessionphase1/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(msearchHitsBodies()[0].query.bool.filter).toEqual([]);
  });
});

describe("M16 — POST /elasticsearch/modificationbus", () => {
  it("refuse un rôle sans accès au plan de transport", async () => {
    const res = await request(referent({ role: ROLES.RESPONSIBLE }))
      .post("/elasticsearch/modificationbus/search")
      .send({ filters: {} });
    expect(res.status).toBe(403);
  });

  it("borne un référent départemental aux demandes des lignes de son territoire", async () => {
    const res = await request(referentDepartement()).post("/elasticsearch/modificationbus/search").send({ filters: {} });
    expect(res.status).toBe(200);
    const lineFilter = msearchHitsBodies()[0].query.bool.filter.find((f: any) => f.terms?.["lineId.keyword"]);
    expect(lineFilter.terms["lineId.keyword"].sort()).toEqual([ligneBretonneId, ligneDepartBretonId].sort());
    expect(lineFilter.terms["lineId.keyword"]).not.toContain(ligneLyonnaiseId);
  });

  it("borne aussi l'export", async () => {
    const res = await request(referentRegion()).post("/elasticsearch/modificationbus/export").send({ filters: {} });
    expect(res.status).toBe(200);
    expect(allQueries()).toContain(ligneBretonneId);
    expect(allQueries()).not.toContain(ligneLyonnaiseId);
  });

  it("laisse le transporteur national", async () => {
    const res = await request(referent({ role: ROLES.TRANSPORTER }))
      .post("/elasticsearch/modificationbus/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(allQueries()).not.toContain("lineId.keyword");
  });
});

describe("L12 — POST /elasticsearch/lignebus", () => {
  it("borne la recherche d'un référent régional aux lignes de son territoire", async () => {
    const res = await request(referentRegion()).post("/elasticsearch/lignebus/search").send({ filters: {} });
    expect(res.status).toBe(200);
    const query = JSON.stringify(msearchHitsBodies()[0].query);
    expect(query).toContain("centerId.keyword");
    expect(query).toContain("meetingPointsIds.keyword");
  });

  it("refuse la recherche aux rôles de centre, sans périmètre", async () => {
    const res = await request(referent({ role: ROLES.HEAD_CENTER }))
      .post("/elasticsearch/lignebus/search")
      .send({ filters: {} });
    expect(res.status).toBe(403);
  });

  it("exige un rôle sur les agrégations par point de rassemblement", async () => {
    const res = await request(referent({ role: ROLES.RESPONSIBLE }))
      .post("/elasticsearch/lignebus/by-point-de-rassemblement/aggs")
      .send({ filters: { meetingPointIds: ["x"], cohort: [] } });
    expect(res.status).toBe(403);
  });

  it("borne les agrégations d'un référent", async () => {
    const res = await request(referentDepartement())
      .post("/elasticsearch/lignebus/by-point-de-rassemblement/aggs")
      .send({ filters: { meetingPointIds: ["x"] } });
    expect(res.status).toBe(200);
    expect(allQueries()).toContain("centerId.keyword");
  });
});

describe("PM9 — POST /elasticsearch/plandetransport", () => {
  it("borne un référent départemental à son centre et ses points de rassemblement", async () => {
    const res = await request(referentDepartement()).post("/elasticsearch/plandetransport/search").send({ filters: {} });
    expect(res.status).toBe(200);
    const query = JSON.stringify(msearchHitsBodies()[0].query);
    expect(query).toContain("centerId.keyword");
    expect(query).toContain("pointDeRassemblements.meetingPointId.keyword");
  });

  it("borne aussi l'export d'un référent régional", async () => {
    const res = await request(referentRegion()).post("/elasticsearch/plandetransport/export").send({ filters: {} });
    expect(res.status).toBe(200);
    expect(allQueries()).toContain("centerId.keyword");
  });

  it("laisse l'admin sans filtre géographique", async () => {
    const res = await request(referent({ role: ROLES.ADMIN })).post("/elasticsearch/plandetransport/search").send({ filters: {} });
    expect(res.status).toBe(200);
    expect(allQueries()).not.toContain("centerId.keyword");
  });

  it("laisse le transporteur national", async () => {
    const res = await request(referent({ role: ROLES.TRANSPORTER })).post("/elasticsearch/plandetransport/search").send({ filters: {} });
    expect(res.status).toBe(200);
    expect(allQueries()).not.toContain("centerId.keyword");
  });
});

describe("L14 — POST /elasticsearch/pointderassemblement", () => {
  it.each([ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER, ROLES.VISITOR])("refuse le rôle %s", async (role) => {
    const res = await request(referent({ role })).post("/elasticsearch/pointderassemblement/export").send({ filters: {} });
    expect(res.status).toBe(403);
  });

  it("borne un référent départemental à son département", async () => {
    const res = await request(referentDepartement()).post("/elasticsearch/pointderassemblement/search").send({ filters: {} });
    expect(res.status).toBe(200);
    expect(JSON.stringify(msearchHitsBodies()[0].query)).toContain('{"terms":{"department.keyword":["Finistère"]}}');
  });

  it("laisse le transporteur national", async () => {
    const res = await request(referent({ role: ROLES.TRANSPORTER }))
      .post("/elasticsearch/pointderassemblement/search")
      .send({ filters: {} });
    expect(res.status).toBe(200);
    expect(JSON.stringify(msearchHitsBodies()[0].query.bool.filter)).not.toContain("department.keyword");
  });
});

describe("L11 — POST /elasticsearch/dashboard/inscription", () => {
  it("refuse au visiteur le rapport d'un département hors de sa région", async () => {
    const res = await request(referent({ role: ROLES.VISITOR, region: "Bretagne" }))
      .post("/elasticsearch/dashboard/inscription/youngsReport")
      .send({ filters: { cohort: ["Juillet 2024"] }, department: "Rhône" });
    expect(res.status).toBe(403);
  });

  it("accepte le rapport d'un département de la région du visiteur", async () => {
    const res = await request(referent({ role: ROLES.VISITOR, region: "Bretagne" }))
      .post("/elasticsearch/dashboard/inscription/youngsReport")
      .send({ filters: { cohort: ["Juillet 2024"], region: ["Bretagne"] }, department: "Finistère" });
    expect(res.status).toBe(200);
  });

  it("valide le corps du rapport", async () => {
    const res = await request(referent({ role: ROLES.ADMIN }))
      .post("/elasticsearch/dashboard/inscription/youngsReport")
      .send({ filters: { cohort: [{ $ne: null }] }, department: "Finistère" });
    expect(res.status).toBe(400);
  });

  it("refuse un chef de centre sans session sur la cohorte, au lieu des agrégations nationales", async () => {
    const res = await request(referent({ role: ROLES.HEAD_CENTER }))
      .post("/elasticsearch/dashboard/inscription/inscriptionInfo")
      .send({ filters: { cohort: ["Juillet 2024"] } });
    expect(res.status).toBe(403);
    expect(mockEsCalls.search).toHaveLength(0);
  });

  it("borne toujours un chef de centre à sa session", async () => {
    const user = { ...getNewReferentFixture(), _id: new Types.ObjectId(), role: ROLES.HEAD_CENTER };
    const session = await SessionPhase1Model.create({ cohort: "Juillet 2024", headCenterId: String(user._id), cohesionCenterId: new Types.ObjectId().toString() } as any);
    const res = await request(getAppHelper(user as any))
      .post("/elasticsearch/dashboard/inscription/inscriptionInfo")
      .send({ filters: { cohort: ["Juillet 2024"] } });
    expect(res.status).toBe(200);
    expect(allQueries()).toContain(String(session._id));
  });

  it("borne le visiteur à sa région sur les changements de cohorte", async () => {
    const res = await request(referent({ role: ROLES.VISITOR, region: "Bretagne" }))
      .post("/elasticsearch/dashboard/inscription/getInAndOutCohort")
      .send({ filters: { cohort: ["Juillet 2024"] } });
    expect(res.status).toBe(200);
    expect(allQueries()).toContain('"region.keyword":["Bretagne"]');
  });
});

describe("L15 — POST /elasticsearch/schoolramses/public/search", () => {
  it("exige un compte référent", async () => {
    await request(referent({ role: ROLES.ADMIN }))
      .post("/elasticsearch/schoolramses/public/search")
      .send({ filters: { city: ["Brest"] } });
    // @ts-ignore
    expect(passport.lastTypeCalledOnAuthenticate).toEqual(["referent"]);
  });

  it("refuse un rôle sans accès au référentiel", async () => {
    const res = await request(referent({ role: ROLES.TRANSPORTER }))
      .post("/elasticsearch/schoolramses/public/search")
      .send({});
    expect(res.status).toBe(403);
  });

  it("refuse une taille de page hors bornes", async () => {
    const res = await request(referent({ role: ROLES.ADMIN }))
      .post("/elasticsearch/schoolramses/public/search")
      .send({ filters: {}, size: 10000 });
    expect(res.status).toBe(400);
    expect(mockEsCalls.msearch).toHaveLength(0);
  });

  it("plafonne le nombre d'établissements renvoyés", async () => {
    await request(referent({ role: ROLES.ADMIN }))
      .post("/elasticsearch/schoolramses/public/search")
      .send({ filters: {} });
    await request(referent({ role: ROLES.ADMIN }))
      .post("/elasticsearch/schoolramses/public/search")
      .send({ filters: { city: ["Brest"], country: ["FRANCE"] } });
    const [withoutFilter, withFilter] = msearchHitsBodies();
    expect(withoutFilter.size).toBe(50);
    expect(withFilter.size).toBe(1000);
  });
});

describe("L13 — recherches de missions côté jeune", () => {
  const young = () => getAppHelper({ ...getNewYoungFixture(), _id: new Types.ObjectId() } as any, "young");
  const filters = { distance: 50, location: { lat: 48.39, lon: -4.48 } };

  it("plafonne size à 100 et calcule l'offset sur la taille de page", async () => {
    const res = await request(young()).post("/elasticsearch/mission/young/search").send({ filters, page: 2, size: 10000 });
    expect(res.status).toBe(200);
    const body = mockEsCalls.search[0].body;
    expect(body.size).toBe(100);
    expect(body.from).toBe(200);
  });

  it("borne la page pour rester dans la fenêtre Elasticsearch", async () => {
    await request(young()).post("/elasticsearch/mission/young/search").send({ filters, page: 100000, size: 40 });
    const body = mockEsCalls.search[0].body;
    expect(body.from + body.size).toBeLessThanOrEqual(10000);
  });

  it("plafonne aussi la recherche de missions de l'API Engagement", async () => {
    await request(young())
      .post("/elasticsearch/missionapi/search")
      .send({ filters: { location: filters.location }, page: 1, size: 5000 });
    const body = mockEsCalls.search[0].body;
    expect(body.size).toBe(100);
    expect(body.from).toBe(100);
  });
});

describe("L10 — POST /elasticsearch/association", () => {
  it("n'existe plus", async () => {
    const res = await request(referent({ role: ROLES.ADMIN }))
      .post("/elasticsearch/association/search")
      .send({ filters: {} });
    expect(res.status).toBe(404);
  });
});
