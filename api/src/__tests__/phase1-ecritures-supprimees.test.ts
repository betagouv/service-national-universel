/**
 * Décision produit du 24/09/2026 : plus aucune création, modification ni suppression sur la phase 1
 * (points de rassemblement, réservation des places, lignes de bus et plan de transport, sessions et
 * centres, présence / départ / dispense). Les routes d'écriture de l'API v1 sont SUPPRIMÉES — pas
 * verrouillées — et les lectures restent servies.
 *
 * Toutes les requêtes partent d'un administrateur (`getAppHelperWithAcl()`) et visent des documents qui
 * EXISTENT : un gestionnaire encore monté répondrait donc 200, 400 ou 403, jamais le 404 par défaut
 * d'Express. Le 404 applicatif (`{ ok: false, code: "NOT_FOUND" }`) est en outre distingué par son corps.
 */
import request from "supertest";
import { Types } from "mongoose";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import getNewYoungFixture from "./fixtures/young";
import getNewCohortFixture from "./fixtures/cohort";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import getNewLigneToPointFixture from "./fixtures/PlanDeTransport/ligneToPoint";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import getNewBusFixture from "./fixtures/bus";
import {
  BusModel,
  CohesionCenterModel,
  CohortModel,
  LigneBusModel,
  LigneToPointModel,
  ModificationBusModel,
  PointDeRassemblementModel,
  SessionPhase1Model,
  YoungModel,
} from "../models";

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

type Method = "get" | "post" | "put" | "delete";

let app: Awaited<ReturnType<typeof getAppHelperWithAcl>>;
const ids: Record<"young" | "cohort" | "center" | "session" | "pdr" | "ligne" | "ligneToPoint" | "modification" | "bus", string> = {} as any;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  // Sans ce seed, les lectures des lignes de bus répondraient 403 : le garde-fou « lecture conservée »
  // resterait vert, mais n'attesterait plus que le gestionnaire sert la donnée.
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.LIGNE_BUS, PERMISSION_ACTIONS.READ);

  const cohort = await CohortModel.create({ ...getNewCohortFixture(), name: `phase1-ecritures-${new Types.ObjectId()}` });
  const center = await CohesionCenterModel.create({ ...getNewCohesionCenterFixture(), cohorts: [cohort.name] });
  const session = await SessionPhase1Model.create({
    ...getNewSessionPhase1Fixture(),
    cohort: cohort.name,
    cohortId: cohort._id.toString(),
    cohesionCenterId: center._id.toString(),
  });
  const pdr = await PointDeRassemblementModel.create({ ...getNewPointDeRassemblementFixture(), cohorts: [cohort.name] });
  const ligne = await LigneBusModel.create(
    getNewLigneBusFixture({ cohort: cohort.name, centerId: center._id.toString(), sessionId: session._id.toString(), meetingPointsIds: [pdr._id.toString()] }),
  );
  const ligneToPoint = await LigneToPointModel.create({ ...getNewLigneToPointFixture(), lineId: ligne._id.toString(), meetingPointId: pdr._id.toString() });
  const modification = await ModificationBusModel.create({
    cohort: cohort.name,
    lineId: ligne._id.toString(),
    lineName: ligne.busId,
    requestMessage: "Demande existante",
    requestUserId: new Types.ObjectId().toString(),
    requestUserName: "Référent",
    requestUserRole: ROLES.ADMIN,
  });
  const bus = await BusModel.create(getNewBusFixture());
  const young = await YoungModel.create(
    getNewYoungFixture({
      cohort: cohort.name,
      cohortId: cohort._id.toString(),
      sessionPhase1Id: session._id.toString(),
      cohesionCenterId: center._id.toString(),
      meetingPointId: pdr._id.toString(),
      ligneId: ligne._id.toString(),
    }),
  );

  Object.assign(ids, {
    young: young._id.toString(),
    cohort: cohort._id.toString(),
    center: center._id.toString(),
    session: session._id.toString(),
    pdr: pdr._id.toString(),
    ligne: ligne._id.toString(),
    ligneToPoint: ligneToPoint._id.toString(),
    modification: modification._id.toString(),
    bus: bus._id.toString(),
  });
});
// `getAppHelper` fixe l'utilisateur de la stratégie passport factice et `resetAppAuth` le remplace par
// un référent au rôle aléatoire : l'app est donc reconstruite avant chaque cas pour rester en admin.
beforeEach(async () => {
  app = await getAppHelperWithAcl();
});
afterAll(dbClose);
afterEach(resetAppAuth);

async function callRoute(method: Method, path: string) {
  const agent = request(app) as any;
  return agent[method](path).send({});
}

async function expectRouteRemoved(method: Method, path: string) {
  const response = await callRoute(method, path);
  expect(response.status).toBe(404);
  // 404 par défaut d'Express : pas de corps JSON de l'API. Un gestionnaire encore monté qui ne
  // trouverait pas la ressource répondrait { ok: false, code: "NOT_FOUND" }.
  expect(response.body?.ok).toBeUndefined();
  expect(response.body?.code).toBeUndefined();
}

/**
 * La route répond encore : soit le statut attendu, soit — sans statut attendu — toute réponse qui n'est
 * pas le 404 par défaut d'Express (un 404 applicatif porte `{ ok: false, code }`).
 */
async function expectRouteServed(method: Method, path: string, expectedStatus?: number) {
  const response = await callRoute(method, path);
  if (expectedStatus) expect(response.status).toBe(expectedStatus);
  if (response.status === 404) expect(response.body?.ok).toBe(false);
  return response;
}

// Les identifiants n'existent qu'après beforeAll : `{young}`, `{pdr}`… sont résolus à l'exécution.
function resolve(path: string) {
  return path.replace(/\{(\w+)\}/g, (_match, key: string) => (key === "random" ? new Types.ObjectId().toString() : ids[key]));
}

const removed: Record<string, [Method, string][]> = {
  "Points de rassemblement": [
    ["put", "/point-de-rassemblement/cohort/{pdr}"],
    ["put", "/point-de-rassemblement/delete/cohort/{pdr}"],
    ["post", "/point-de-rassemblement/import"],
    // Anciennes routes déjà commentées dans le contrôleur, retirées avec lui.
    ["post", "/point-de-rassemblement"],
    ["put", "/point-de-rassemblement/{pdr}"],
    ["delete", "/point-de-rassemblement/{pdr}"],
  ],
  "Lignes de bus et plan de transport": [
    ["put", "/ligne-de-bus/{ligne}/info"],
    ["put", "/ligne-de-bus/{ligne}/team"],
    ["put", "/ligne-de-bus/{ligne}/teamDelete"],
    ["put", "/ligne-de-bus/{ligne}/centre"],
    ["put", "/ligne-de-bus/{ligne}/pointDeRassemblement"],
    ["put", "/ligne-de-bus/{ligne}/updatePDRForLine"],
    ["post", "/ligne-de-bus/{ligne}/point-de-rassemblement/{pdr}"],
    ["delete", "/ligne-to-point/{ligneToPoint}"],
    ["post", "/edit-transport/saveYoungs"],
    ["post", "/demande-de-modification"],
    ["put", "/demande-de-modification/{modification}/status"],
    ["put", "/demande-de-modification/{modification}/opinion"],
    ["put", "/demande-de-modification/{modification}/message"],
    ["put", "/demande-de-modification/{modification}/tag/{random}"],
    ["put", "/demande-de-modification/{modification}/tag/{random}/delete"],
  ],
  "Affectation et réservation des places": [
    ["post", "/young/{young}/phase1/affectation"],
    ["put", "/young/{young}/point-de-rassemblement"],
    ["put", "/young/{young}/meeting-point"],
    ["put", "/young/{young}/meeting-point/cancel"],
    ["post", "/bus"],
    ["put", "/bus/{bus}/capacity"],
  ],
  "Sessions phase 1": [
    ["put", "/session-phase1/{session}"],
    ["put", "/session-phase1/{session}/directionTeam"],
    ["put", "/session-phase1/{session}/team"],
    ["delete", "/session-phase1/{session}"],
    ["post", "/session-phase1/{session}/time-schedule"],
    ["post", "/session-phase1/{session}/pedago-project"],
    ["delete", "/session-phase1/{session}/time-schedule/{random}"],
    ["post", "/session-phase1/import"],
  ],
  "Centres de cohésion": [
    ["put", "/cohesion-center/{center}/session-phase1"],
    ["delete", "/cohesion-center/{center}"],
    ["post", "/cohesion-center/import"],
  ],
  "Présence, départ, dispense et documents phase 1": [
    ["post", "/young/{young}/phase1/dispense"],
    ["post", "/young/{young}/phase1/depart"],
    ["put", "/young/{young}/phase1/depart"],
    ["post", "/young/{young}/phase1/cohesionStayPresence"],
    ["post", "/young/{young}/phase1/presenceJDM"],
    ["post", "/young/{young}/phase1/cohesionStayMedicalFileReceived"],
    ["post", "/young/{young}/phase1/youngPhase1Agreement"],
    ["post", "/young/{young}/phase1/isTravelingByPlane"],
    ["post", "/young/phase1/multiaction/depart"],
    ["post", "/young/phase1/multiaction/cohesionStayPresence"],
    ["put", "/young/phase1/cohesionStayMedical"],
    ["put", "/young/phase1/imageRight"],
    ["put", "/young/phase1/agreement"],
    ["put", "/young/phase1/convocation"],
    ["put", "/referent/young/{young}/phase1Status/cohesionStayMedical"],
    ["put", "/referent/young/{young}/phase1Status/imageRight"],
  ],
};

describe.each(Object.entries(removed))("Écritures phase 1 supprimées — %s", (_domaine, routes) => {
  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, resolve(path));
  });
});

describe("Lectures phase 1 conservées", () => {
  it("GET /point-de-rassemblement/:id sert le point de rassemblement", async () => {
    const res = await expectRouteServed("get", `/point-de-rassemblement/${ids.pdr}`, 200);
    expect(res.body.data._id).toBe(ids.pdr);
  });

  it("GET /ligne-de-bus/:id sert la ligne", async () => {
    const res = await expectRouteServed("get", `/ligne-de-bus/${ids.ligne}`, 200);
    expect(res.body.data._id).toBe(ids.ligne);
  });

  it("GET /ligne-to-point/meeting-point/:meetingPointId est toujours montée", async () => {
    await expectRouteServed("get", `/ligne-to-point/meeting-point/${ids.pdr}`);
  });

  it("GET /demande-de-modification/ligne/:id sert les demandes de la ligne", async () => {
    const res = await expectRouteServed("get", `/demande-de-modification/ligne/${ids.ligne}`, 200);
    expect(res.body.data.map((m) => m._id)).toContain(ids.modification);
  });

  it("POST /edit-transport/youngs et /meetingPoints (lectures) sont toujours montées", async () => {
    await expectRouteServed("post", "/edit-transport/youngs");
    await expectRouteServed("post", "/edit-transport/meetingPoints");
  });

  it("POST /ligne-de-bus/:id/notifyRef (notification) est toujours montée", async () => {
    // Aucun référent à prévenir dans la base de test : le gestionnaire répond un 404 applicatif.
    await expectRouteServed("post", `/ligne-de-bus/${ids.ligne}/notifyRef`);
  });

  it("GET /young/:id/point-de-rassemblement et /meeting-point sont toujours servies", async () => {
    await expectRouteServed("get", `/young/${ids.young}/point-de-rassemblement`, 200);
    await expectRouteServed("get", `/young/${ids.young}/meeting-point`, 200);
  });

  it("GET /bus/:id sert le bus", async () => {
    await expectRouteServed("get", `/bus/${ids.bus}`, 200);
  });

  it("GET /session-phase1/:id sert la session", async () => {
    const res = await expectRouteServed("get", `/session-phase1/${ids.session}`, 200);
    expect(res.body.data._id).toBe(ids.session);
  });

  it("GET /session-phase1/:id/cohesion-center est toujours servie", async () => {
    await expectRouteServed("get", `/session-phase1/${ids.session}/cohesion-center`, 200);
  });

  it("GET /cohesion-center/:id et /:id/session-phase1 sont toujours servies", async () => {
    const res = await expectRouteServed("get", `/cohesion-center/${ids.center}`, 200);
    expect(res.body.data._id).toBe(ids.center);
    await expectRouteServed("get", `/cohesion-center/${ids.center}/session-phase1`, 200);
  });
});
