/**
 * Décision produit du 24/09/2026 : plus aucune création, modification ni suppression sur la phase 1
 * (points de rassemblement, réservation des places, lignes de bus et plan de transport, sessions et
 * centres, présence / départ / dispense). Les routes d'écriture de l'API v1 sont SUPPRIMÉES — pas
 * verrouillées — et les lectures restent servies.
 *
 * GOO-65 (lot P23, décision du 25/09/2026) étend ce décommissionnement au changement de séjour, à
 * l'invitation de volontaires, aux objectifs d'inscription et aux champs / branches phase 1 des routes
 * mixtes (PUT /referent/young/:id, PUT /young/withdraw, PUT /young/account/address,
 * PUT /young-edition/:id/phasestatus). La correction manuelle de statusPhase1 est retirée sans exception.
 *
 * Toutes les requêtes partent d'un administrateur (`getAppHelperWithAcl()`) et visent des documents qui
 * EXISTENT : un gestionnaire encore monté répondrait donc 200, 400 ou 403, jamais le 404 par défaut
 * d'Express. Le 404 applicatif (`{ ok: false, code: "NOT_FOUND" }`) est en outre distingué par son corps.
 */
import request from "supertest";
import { Types } from "mongoose";
import { addDays } from "date-fns";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES, SENDINBLUE_TEMPLATES, SUB_ROLE_GOD, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

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
import { sendTemplate } from "../brevo";
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
  sendTemplate: jest.fn(() => Promise.resolve()),
  sendEmail: () => Promise.resolve(),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));
jest.mock("../geo", () => ({
  ...jest.requireActual("../geo"),
  getQPV: () => Promise.resolve(undefined),
  getDensity: () => Promise.resolve(undefined),
}));

type Method = "get" | "post" | "put" | "delete";

let app: Awaited<ReturnType<typeof getAppHelperWithAcl>>;
const ids: Record<"young" | "cohort" | "cohortName" | "center" | "session" | "pdr" | "ligne" | "ligneToPoint" | "modification" | "bus", string> = {} as any;

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
    cohortName: cohort.name,
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
  "Changement de séjour (GOO-65)": [
    ["put", "/referent/young/{young}/change-cohort"],
    ["get", "/young/change-cohort"],
    ["put", "/young/change-cohort"],
    ["post", "/cohort-session/eligibility/2023"],
    ["post", "/cohort-session/eligibility/2023/{young}"],
  ],
  "Invitation de volontaires et objectifs d'inscription (GOO-65)": [
    ["post", "/young/invite"],
    ["post", "/inscription-goal/{cohortName}"],
    ["get", "/inscription-goal/{cohortName}/department/Ain"],
    ["get", "/inscription-goal/{cohortName}/department/Ain/reached"],
    ["get", "/inscription-goal/Ain/current"],
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

  it("GET /inscription-goal/:cohort (export du tableau de bord) est toujours servie", async () => {
    await expectRouteServed("get", `/inscription-goal/${ids.cohortName}`, 200);
  });

  it("GET /cohort-session/isInscriptionOpen est toujours servie", async () => {
    await expectRouteServed("get", "/cohort-session/isInscriptionOpen", 200);
  });

  it("GET /cohesion-center/:id et /:id/session-phase1 sont toujours servies", async () => {
    const res = await expectRouteServed("get", `/cohesion-center/${ids.center}`, 200);
    expect(res.body.data._id).toBe(ids.center);
    await expectRouteServed("get", `/cohesion-center/${ids.center}/session-phase1`, 200);
  });
});

describe("Routes mixtes : champs et branches phase 1 retirés (GOO-65)", () => {
  async function createCohort(fields: Record<string, unknown> = {}) {
    return CohortModel.create({
      ...getNewCohortFixture(),
      name: `p23-${new Types.ObjectId()}`,
      dateEnd: addDays(new Date(), 30),
      instructionEndDate: addDays(new Date(), 30),
      ...fields,
    });
  }

  async function createAffectedYoung(fields: Record<string, unknown> = {}) {
    const cohort = await createCohort();
    return YoungModel.create(
      getNewYoungFixture({
        cohort: cohort.name,
        cohortId: cohort._id.toString(),
        status: YOUNG_STATUS.VALIDATED,
        statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
        sessionPhase1Id: ids.session,
        cohesionCenterId: ids.center,
        meetingPointId: ids.pdr,
        ligneId: ids.ligne,
        hasMeetingInformation: "true",
        ...fields,
      } as any),
    );
  }

  const AFFECTATION_FIELDS = ["statusPhase1", "sessionPhase1Id", "cohesionCenterId", "meetingPointId", "ligneId", "cohesionStayPresence", "presenceJDM"] as const;

  function pickAffectation(young: any) {
    return Object.fromEntries(AFFECTATION_FIELDS.map((field) => [field, young?.[field]]));
  }

  describe("PUT /referent/young/:id", () => {
    it("ignore silencieusement les champs phase 1, cohorte, CLE, email et consentements (200, rien d'écrit)", async () => {
      const young = await createAffectedYoung({ parent1AllowImageRights: "true", parent1AllowSNU: "true", parentConsentment: "true", imageRight: "true" });
      const before = young.toObject();

      const res = await request(app).put(`/referent/young/${young._id}`).send({
        firstName: "Prénommodifié",
        statusPhase1: YOUNG_STATUS_PHASE1.DONE,
        statusPhase1Motif: "motif",
        cohesionStayPresence: "false",
        presenceJDM: "false",
        departSejourAt: new Date().toISOString(),
        departSejourMotif: "motif",
        cohesionStayMedicalFileReceived: "true",
        sessionPhase1Id: new Types.ObjectId().toString(),
        cohesionCenterId: new Types.ObjectId().toString(),
        meetingPointId: new Types.ObjectId().toString(),
        deplacementPhase1Autonomous: "true",
        cohort: "Une autre cohorte",
        cohortId: new Types.ObjectId().toString(),
        originalCohort: "Cohorte d'origine",
        cohortChangeReason: "raison",
        classeId: new Types.ObjectId().toString(),
        email: "adresse-remplacee@example.com",
        consentment: "false",
        parentConsentment: "false",
        imageRight: "false",
        parent1AllowImageRights: "false",
        parent1AllowSNU: "false",
        parent1FromFranceConnect: "true",
      });

      expect(res.status).toBe(200);
      const after = await YoungModel.findById(young._id);
      // La route écrit toujours les champs qui restent de son ressort…
      expect(after?.firstName).toBe("Prénommodifié");
      // … mais plus rien de la phase 1, de la cohorte, de la classe, de l'email ni des consentements.
      expect(pickAffectation(after)).toEqual(pickAffectation(before));
      expect(after?.statusPhase1Motif).toBe(before.statusPhase1Motif);
      expect(after?.departSejourMotif).toBe(before.departSejourMotif);
      expect(after?.cohesionStayMedicalFileReceived).toBe(before.cohesionStayMedicalFileReceived);
      expect(after?.cohort).toBe(before.cohort);
      expect(after?.cohortId).toBe(before.cohortId);
      expect(after?.originalCohort).toBe(before.originalCohort);
      expect(after?.classeId).toBe(before.classeId);
      expect(after?.email).toBe(before.email);
      expect(after?.parentConsentment).toBe("true");
      expect(after?.imageRight).toBe("true");
      expect(after?.parent1AllowImageRights).toBe("true");
      expect(after?.parent1AllowSNU).toBe("true");
      expect(after?.parent1FromFranceConnect).toBe(before.parent1FromFranceConnect);
    });

    it("ne dérive plus statusPhase1 de la présence et n'envoie plus l'email d'arrivée au centre", async () => {
      const young = await createAffectedYoung({ statusPhase1: YOUNG_STATUS_PHASE1.NOT_DONE, cohesionStayPresence: "false" });
      (sendTemplate as jest.Mock).mockClear();

      const res = await request(app).put(`/referent/young/${young._id}`).send({ cohesionStayPresence: "true" });

      expect(res.status).toBe(200);
      const after = await YoungModel.findById(young._id);
      expect(after?.statusPhase1).toBe(YOUNG_STATUS_PHASE1.NOT_DONE);
      expect(after?.cohesionStayPresence).toBe("false");
      expect((sendTemplate as jest.Mock).mock.calls.map(([template]) => template)).not.toContain(SENDINBLUE_TEMPLATES.YOUNG_ARRIVED_IN_CENTER_TO_REPRESENTANT_LEGAL);
    });

    it("ne répond plus MISSING_AFFECTATION_INFORMATIONS : statusPhase1 n'est simplement plus écrit", async () => {
      const young = await createAffectedYoung({
        statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        sessionPhase1Id: undefined,
        cohesionCenterId: undefined,
        meetingPointId: undefined,
        ligneId: undefined,
        hasMeetingInformation: "false",
      });

      const res = await request(app).put(`/referent/young/${young._id}`).send({ statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED });

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.statusPhase1).toBe(YOUNG_STATUS_PHASE1.WAITING_AFFECTATION);
    });

    it("conserve l'affectation et le statut phase 1 au désistement (WITHDRAWN)", async () => {
      const young = await createAffectedYoung();
      const before = young.toObject();

      const res = await request(app).put(`/referent/young/${young._id}`).send({ status: YOUNG_STATUS.WITHDRAWN, withdrawnReason: "other", withdrawnMessage: "Désistement" });

      expect(res.status).toBe(200);
      const after = await YoungModel.findById(young._id);
      expect(after?.status).toBe(YOUNG_STATUS.WITHDRAWN);
      expect(pickAffectation(after)).toEqual(pickAffectation(before));
    });

    it("conserve l'affectation au passage en REINSCRIPTION", async () => {
      const young = await createAffectedYoung();
      const before = young.toObject();

      const res = await request(app).put(`/referent/young/${young._id}`).send({ status: YOUNG_STATUS.REINSCRIPTION });

      expect(res.status).toBe(200);
      const after = await YoungModel.findById(young._id);
      expect(after?.status).toBe(YOUNG_STATUS.REINSCRIPTION);
      expect(pickAffectation(after)).toEqual(pickAffectation(before));
    });

    it("ne contrôle plus d'objectif d'inscription à la validation d'un dossier", async () => {
      // Aucun objectif n'est défini pour cette cohorte : l'ancien contrôle répondait 400 INSCRIPTION_GOAL_NOT_DEFINED.
      const young = await createAffectedYoung({ status: YOUNG_STATUS.WAITING_VALIDATION, statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, source: "VOLONTAIRE" });

      const res = await request(app).put(`/referent/young/${young._id}`).send({ status: YOUNG_STATUS.VALIDATED });

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.status).toBe(YOUNG_STATUS.VALIDATED);
    });
  });

  describe("PUT /young/withdraw", () => {
    it("désiste le volontaire sans vider son affectation ni remapper statusPhase1", async () => {
      const young = await createAffectedYoung();
      const before = young.toObject();

      const res = await request(await getAppHelperWithAcl(young, "young"))
        .put("/young/withdraw")
        .send({ withdrawnReason: "other", withdrawnMessage: "Désistement" });

      expect(res.status).toBe(200);
      const after = await YoungModel.findById(young._id);
      expect(after?.status).toBe(YOUNG_STATUS.WITHDRAWN);
      expect(pickAffectation(after)).toEqual(pickAffectation(before));
    });
  });

  describe("PUT /young/account/address", () => {
    const address = (department: string) => ({
      addressVerified: "true",
      country: "France",
      city: "Lyon",
      zip: "69001",
      address: "1 rue de la République",
      department,
      region: "Auvergne-Rhône-Alpes",
    });

    it("n'empêche plus un volontaire affecté de modifier son adresse", async () => {
      const young = await createAffectedYoung({ department: "Ain" });

      const res = await request(await getAppHelperWithAcl(young, "young"))
        .put("/young/account/address")
        .send(address("Rhône"));

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.department).toBe("Rhône");
    });

    it("ne recalcule plus l'éligibilité au séjour ni le statut d'inscription au changement de département", async () => {
      // Aucun séjour ouvert dans le nouveau département : l'ancien calcul passait le dossier en NOT_ELIGIBLE.
      const young = await createAffectedYoung({ department: "Ain", statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION });

      const res = await request(await getAppHelperWithAcl(young, "young"))
        .put("/young/account/address")
        .send(address("Rhône"));

      expect(res.status).toBe(200);
      const after = await YoungModel.findById(young._id);
      expect(after?.department).toBe("Rhône");
      expect(after?.status).toBe(YOUNG_STATUS.VALIDATED);
    });
  });

  describe("PUT /young-edition/:id/phasestatus", () => {
    it.each([YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.WAITING_AFFECTATION])("refuse statusPhase1=%s (clé hors schéma)", async (status) => {
      const young = await createAffectedYoung({ statusPhase1: YOUNG_STATUS_PHASE1.NOT_DONE });

      const res = await request(app).put(`/young-edition/${young._id}/phasestatus`).send({ statusPhase1: status });

      expect(res.status).toBe(400);
      const after = await YoungModel.findById(young._id);
      expect(after?.statusPhase1).toBe(YOUNG_STATUS_PHASE1.NOT_DONE);
      expect(after?.sessionPhase1Id).toBe(ids.session);
    });

    it("refuse aussi statusPhase1 à un super-administrateur", async () => {
      const young = await createAffectedYoung({ statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION });
      const superAdmin = await getAppHelperWithAcl({ role: ROLES.ADMIN, subRole: SUB_ROLE_GOD } as any);

      const res = await request(superAdmin).put(`/young-edition/${young._id}/phasestatus`).send({ statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED });

      expect(res.status).toBe(400);
      expect((await YoungModel.findById(young._id))?.statusPhase1).toBe(YOUNG_STATUS_PHASE1.WAITING_AFFECTATION);
    });

    it("modifie toujours le statut de phase 2", async () => {
      const young = await createAffectedYoung({ statusPhase2: "WAITING_REALISATION" });

      const res = await request(app).put(`/young-edition/${young._id}/phasestatus`).send({ statusPhase2: "IN_PROGRESS" });

      expect(res.status).toBe(200);
      expect((await YoungModel.findById(young._id))?.statusPhase2).toBe("IN_PROGRESS");
    });
  });
});
