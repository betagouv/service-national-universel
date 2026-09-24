/**
 * Lot J — concurrence sur les places et compteurs (audit du 21/09/2026).
 *
 *   M57 — PUT /young/:id/point-de-rassemblement : un `ligneId` sans `meetingPointId` contournait le contrôle de capacité de la ligne
 *   L25 — TOCTOU sur les compteurs de places (session, ligne de bus) : lecture, écriture du jeune, recomptage
 */
import request from "supertest";
import { Types } from "mongoose";

import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

import { LigneBusModel, LigneToPointModel, SessionPhase1Model, YoungModel } from "../models";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import getNewCohortFixture from "./fixtures/cohort";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import { createYoungHelper } from "./helpers/young";
import { createCohortHelper } from "./helpers/cohort";
import { createSessionPhase1 } from "./helpers/sessionPhase1";
import { createPointDeRassemblementHelper } from "./helpers/PlanDeTransport/pointDeRassemblement";
import { reserveBusLineSeat, reserveSessionPhase1Places } from "../utils/placeReservation";

const { ObjectId } = Types;

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
jest.mock("../brevo", () => ({ ...jest.requireActual("../brevo"), sendTemplate: jest.fn().mockResolvedValue(undefined) }));

jest.setTimeout(60000);

beforeAll(dbConnect);
afterAll(dbClose);
afterEach(() => {
  resetAppAuth();
  jest.clearAllMocks();
});

const CONCURRENT_REQUESTS = 20;

async function createCohort(overrides = {}) {
  // Nom unique : la base de test persiste entre les lancements.
  return createCohortHelper(getNewCohortFixture({ name: `lot-j-${new ObjectId().toString()}`, manualAffectionOpenForAdmin: true, ...overrides }));
}

async function createSession(cohort, placesLeft: number) {
  return createSessionPhase1(
    getNewSessionPhase1Fixture({ cohort: cohort.name, cohortId: cohort._id.toString(), cohesionCenterId: new ObjectId().toString(), placesTotal: placesLeft, placesLeft }),
  );
}

async function createLigne(session, youngCapacity: number) {
  return LigneBusModel.create(
    getNewLigneBusFixture({
      busId: `lot-j-${new ObjectId().toString()}`,
      sessionId: session._id.toString(),
      centerId: session.cohesionCenterId,
      cohort: session.cohort,
      cohortId: session.cohortId,
      youngCapacity,
      youngSeatsTaken: 0,
    }),
  );
}

async function createYoungs(cohort, count: number, overrides = {}) {
  const youngs: any[] = [];
  for (let i = 0; i < count; i++) {
    youngs.push(
      await createYoungHelper(
        getNewYoungFixture({
          status: YOUNG_STATUS.VALIDATED,
          statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
          cohort: cohort.name,
          cohortId: cohort._id.toString(),
          sessionPhase1Id: undefined,
          cohesionCenterId: undefined,
          meetingPointId: undefined,
          ligneId: undefined,
          ...overrides,
        }),
      ),
    );
  }
  return youngs;
}

describe("L25 — POST /young/:id/phase1/affectation : réservation atomique des places", () => {
  it(`n'affecte qu'un jeune sur ${CONCURRENT_REQUESTS} demandes concurrentes pour la dernière place d'une session`, async () => {
    const cohort = await createCohort();
    const session = await createSession(cohort, 1);
    const youngs = await createYoungs(cohort, CONCURRENT_REQUESTS);
    const app = await getAppHelperWithAcl();

    const responses = await Promise.all(
      youngs.map((young) =>
        request(app).post(`/young/${young._id}/phase1/affectation`).send({ centerId: session.cohesionCenterId, sessionId: session._id.toString(), pdrOption: "self-going" }),
      ),
    );

    expect(responses.filter((res) => res.status === 200)).toHaveLength(1);
    expect(responses.filter((res) => res.status === 200 || res.status === 403 || res.status === 409)).toHaveLength(CONCURRENT_REQUESTS);
    expect(await YoungModel.countDocuments({ sessionPhase1Id: session._id.toString() })).toBe(1);
    expect((await SessionPhase1Model.findById(session._id))?.placesLeft).toBe(0);
  });

  it(`n'attribue qu'un siège sur ${CONCURRENT_REQUESTS} demandes concurrentes pour le dernier siège d'une ligne`, async () => {
    const cohort = await createCohort();
    const session = await createSession(cohort, CONCURRENT_REQUESTS);
    const ligne = await createLigne(session, 1);
    const pdr = await createPointDeRassemblementHelper(getNewPointDeRassemblementFixture());
    const youngs = await createYoungs(cohort, CONCURRENT_REQUESTS);
    const app = await getAppHelperWithAcl();

    const responses = await Promise.all(
      youngs.map((young) =>
        request(app).post(`/young/${young._id}/phase1/affectation`).send({
          centerId: session.cohesionCenterId,
          sessionId: session._id.toString(),
          meetingPointId: pdr._id.toString(),
          ligneId: ligne._id.toString(),
          pdrOption: "ref-select",
        }),
      ),
    );

    expect(responses.filter((res) => res.status === 200)).toHaveLength(1);
    expect(await YoungModel.countDocuments({ ligneId: ligne._id.toString() })).toBe(1);
    expect((await LigneBusModel.findById(ligne._id))?.youngSeatsTaken).toBe(1);
    // Les places de session réservées par les demandes refusées sont rendues.
    expect((await SessionPhase1Model.findById(session._id))?.placesLeft).toBe(CONCURRENT_REQUESTS - 1);
  });

  it("laisse changer de point de rassemblement sur la même ligne pleine, sans siège en plus", async () => {
    const cohort = await createCohort();
    const session = await createSession(cohort, 10);
    const ligne = await createLigne(session, 1);
    const pdr = await createPointDeRassemblementHelper(getNewPointDeRassemblementFixture());
    const autrePdr = await createPointDeRassemblementHelper(getNewPointDeRassemblementFixture());
    const [young] = await createYoungs(cohort, 1);
    const app = await getAppHelperWithAcl();
    const affectation = (meetingPointId: string) => ({
      centerId: session.cohesionCenterId,
      sessionId: session._id.toString(),
      meetingPointId,
      ligneId: ligne._id.toString(),
      pdrOption: "ref-select",
    });

    const first = await request(app).post(`/young/${young._id}/phase1/affectation`).send(affectation(pdr._id.toString()));
    const second = await request(app).post(`/young/${young._id}/phase1/affectation`).send(affectation(autrePdr._id.toString()));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect((await YoungModel.findById(young._id))?.meetingPointId).toBe(autrePdr._id.toString());
    expect((await LigneBusModel.findById(ligne._id))?.youngSeatsTaken).toBe(1);
  });
});

describe("PUT /young/:id/point-de-rassemblement", () => {
  async function setup(youngCapacity = 10) {
    const cohort = await createCohort({ pdrChoiceLimitDate: new Date(Date.now() + 7 * 24 * 3600 * 1000) });
    const session = await createSession(cohort, 10);
    const ligne = await createLigne(session, youngCapacity);
    const pdr = await createPointDeRassemblementHelper(getNewPointDeRassemblementFixture());
    await LigneToPointModel.create({
      lineId: ligne._id.toString(),
      meetingPointId: pdr._id.toString(),
      departureHour: "07:30",
      meetingHour: "07:00",
      returnHour: "18:00",
      transportType: "bus",
    });
    return { cohort, session, ligne, pdr };
  }

  async function createAffectedYoung(cohort, session) {
    const [young] = await createYoungs(cohort, 1, {
      statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
      sessionPhase1Id: session._id.toString(),
      cohesionCenterId: session.cohesionCenterId,
    });
    return young;
  }

  it("M57 — refuse un ligneId sans meetingPointId (contournement du contrôle de capacité)", async () => {
    const { cohort, session, ligne } = await setup(0);
    const young = await createAffectedYoung(cohort, session);

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .put(`/young/${young._id}/point-de-rassemblement`)
      .send({ ligneId: ligne._id.toString() });

    expect(res.status).toBe(400);
    expect((await YoungModel.findById(young._id))?.ligneId).toBeFalsy();
  });

  it("M57 — refuse une ligne qui ne dessert pas le point de rassemblement choisi", async () => {
    const { cohort, session, ligne } = await setup();
    const autrePdr = await createPointDeRassemblementHelper(getNewPointDeRassemblementFixture());
    const young = await createAffectedYoung(cohort, session);

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .put(`/young/${young._id}/point-de-rassemblement`)
      .send({ meetingPointId: autrePdr._id.toString(), ligneId: ligne._id.toString() });

    expect(res.status).toBe(400);
    expect((await YoungModel.findById(young._id))?.ligneId).toBeFalsy();
  });

  it("M57 — refuse une ligne d'une autre session que celle du jeune", async () => {
    const { cohort, ligne, pdr } = await setup();
    const autreSession = await createSession(cohort, 10);
    const young = await createAffectedYoung(cohort, autreSession);

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .put(`/young/${young._id}/point-de-rassemblement`)
      .send({ meetingPointId: pdr._id.toString(), ligneId: ligne._id.toString() });

    expect(res.status).toBe(400);
  });

  it("L25 — refuse le choix d'une ligne pleine", async () => {
    const { cohort, session, ligne, pdr } = await setup(0);
    const young = await createAffectedYoung(cohort, session);

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .put(`/young/${young._id}/point-de-rassemblement`)
      .send({ meetingPointId: pdr._id.toString(), ligneId: ligne._id.toString() });

    expect(res.status).toBe(409);
    expect((await YoungModel.findById(young._id))?.ligneId).toBeFalsy();
  });

  it("accepte un couple point de rassemblement / ligne valide et compte le siège", async () => {
    const { cohort, session, ligne, pdr } = await setup();
    const young = await createAffectedYoung(cohort, session);

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .put(`/young/${young._id}/point-de-rassemblement`)
      .send({ meetingPointId: pdr._id.toString(), ligneId: ligne._id.toString() });

    expect(res.status).toBe(200);
    expect((await YoungModel.findById(young._id))?.ligneId).toBe(ligne._id.toString());
    expect((await LigneBusModel.findById(ligne._id))?.youngSeatsTaken).toBe(1);
  });

  it("n'ajoute pas de siège quand le jeune confirme la ligne sur laquelle il est déjà", async () => {
    const { cohort, session, ligne, pdr } = await setup();
    const young = await createAffectedYoung(cohort, session);
    const app = await getAppHelperWithAcl(young, "young");
    const body = { meetingPointId: pdr._id.toString(), ligneId: ligne._id.toString() };

    await request(app).put(`/young/${young._id}/point-de-rassemblement`).send(body);
    const res = await request(app).put(`/young/${young._id}/point-de-rassemblement`).send(body);

    expect(res.status).toBe(200);
    expect((await LigneBusModel.findById(ligne._id))?.youngSeatsTaken).toBe(1);
  });

  it("accepte toujours le choix de venir par ses propres moyens", async () => {
    const { cohort, session } = await setup();
    const young = await createAffectedYoung(cohort, session);

    const res = await request(await getAppHelperWithAcl(young, "young"))
      .put(`/young/${young._id}/point-de-rassemblement`)
      .send({ deplacementPhase1Autonomous: "true" });

    expect(res.status).toBe(200);
  });
});

// Les routes jeune s'authentifient via un utilisateur passport global aux tests : la concurrence entre
// plusieurs jeunes se vérifie donc directement sur les helpers de réservation qu'elles utilisent.
describe("L25 — helpers de réservation atomique", () => {
  it(`reserveBusLineSeat : une seule réservation sur ${CONCURRENT_REQUESTS} pour le dernier siège`, async () => {
    const cohort = await createCohort();
    const session = await createSession(cohort, 10);
    const ligne = await createLigne(session, 1);

    const results = await Promise.all(Array.from({ length: CONCURRENT_REQUESTS }, () => reserveBusLineSeat(ligne._id.toString())));

    expect(results.filter(Boolean)).toHaveLength(1);
    expect((await LigneBusModel.findById(ligne._id))?.youngSeatsTaken).toBe(1);
  });

  it(`reserveSessionPhase1Places : une seule réservation sur ${CONCURRENT_REQUESTS} pour la dernière place`, async () => {
    const cohort = await createCohort();
    const session = await createSession(cohort, 1);

    const results = await Promise.all(Array.from({ length: CONCURRENT_REQUESTS }, () => reserveSessionPhase1Places(session._id.toString())));

    expect(results.filter(Boolean)).toHaveLength(1);
    expect((await SessionPhase1Model.findById(session._id))?.placesLeft).toBe(0);
  });

  it("reserveSessionPhase1Places : refuse une réservation groupée supérieure aux places restantes", async () => {
    const cohort = await createCohort();
    const session = await createSession(cohort, 5);

    expect(await reserveSessionPhase1Places(session._id.toString(), 6)).toBeNull();
    expect((await SessionPhase1Model.findById(session._id))?.placesLeft).toBe(5);
  });
});
