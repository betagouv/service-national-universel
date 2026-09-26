/**
 * Reproduction des constats de l'audit sécurité du 21/09/2026 — lot I
 * « Séjour, point de rassemblement et éligibilité d'un autre volontaire ».
 *
 * M59 GET /young/:id/session                    : session phase 1 d'un autre jeune, liste d'attente comprise
 * M56 GET /young/:id/meeting-point              : point de rassemblement d'un autre jeune
 * L8  POST /cohort-session/eligibility/2023/:id : oracle sur un volontaire quelconque (existence, éligibilité)
 */
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { ERRORS, ROLES } from "snu-lib";

import { ClasseModel, EtablissementModel, MeetingPointModel, ReferentModel, SessionPhase1Model, YoungModel } from "../models";
import { dbConnect, dbClose } from "./helpers/db";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import getNewMeetingPointFixture from "./fixtures/meetingPoint";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper } from "./helpers/young";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await Promise.all([
    ReferentModel.deleteMany(),
    YoungModel.deleteMany(),
    SessionPhase1Model.deleteMany(),
    MeetingPointModel.deleteMany(),
    ClasseModel.deleteMany(),
    EtablissementModel.deleteMany(),
  ]);
});
afterEach(resetAppAuth);

const loireAtlantique = { region: "Pays de la Loire", department: "Loire-Atlantique", schoolDepartment: "Loire-Atlantique", schooled: "false" };

describe("Sécurité séjour / point de rassemblement / éligibilité — audit 2026-09-21 (lot I)", () => {
  describe("M59 — GET /young/:id/session", () => {
    it("refuse à un jeune de lire la session d'un autre jeune", async () => {
      const session = await SessionPhase1Model.create(getNewSessionPhase1Fixture());
      const victim = await createYoungHelper(getNewYoungFixture({ sessionPhase1Id: session._id.toString() }));
      const attacker = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(attacker, "young")).get(`/young/${victim._id}/session`);

      expect(res.status).toBe(403);
    });

    it("ne renvoie pas la liste d'attente du séjour au jeune affecté", async () => {
      const waitingYoungId = new ObjectId().toString();
      const session = await SessionPhase1Model.create(getNewSessionPhase1Fixture({ waitingList: [waitingYoungId] }));
      const young = await createYoungHelper(getNewYoungFixture({ sessionPhase1Id: session._id.toString() }));

      const res = await request(await getAppHelperWithAcl(young, "young")).get(`/young/${young._id}/session`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(session._id.toString());
      expect(res.body.data.waitingList).toBeUndefined();
      expect(JSON.stringify(res.body.data)).not.toContain(waitingYoungId);
    });

    it("PM34 : ne renvoie pas l'équipe d'encadrement (team, adjointsIds, sanitaryContactEmail) au jeune affecté", async () => {
      const adjointId = new ObjectId().toString();
      const session = await SessionPhase1Model.create(
        getNewSessionPhase1Fixture({
          team: [{ firstName: "Chef", lastName: "Centre", email: "chef-centre-pm34@example.org" }],
          adjointsIds: [adjointId],
          sanitaryContactEmail: "sanitaire-pm34@example.org",
        } as any),
      );
      const young = await createYoungHelper(getNewYoungFixture({ sessionPhase1Id: session._id.toString() }));

      const res = await request(await getAppHelperWithAcl(young, "young")).get(`/young/${young._id}/session`);

      expect(res.status).toBe(200);
      expect(res.body.data.team).toBeUndefined();
      expect(res.body.data.adjointsIds).toBeUndefined();
      expect(res.body.data.sanitaryContactEmail).toBeUndefined();
      expect(JSON.stringify(res.body.data)).not.toContain("chef-centre-pm34@example.org");
      expect(JSON.stringify(res.body.data)).not.toContain("sanitaire-pm34@example.org");
      expect(JSON.stringify(res.body.data)).not.toContain(adjointId);
    });
  });

  describe("M56 — GET /young/:id/meeting-point", () => {
    it("refuse à un jeune de lire le point de rassemblement d'un autre jeune", async () => {
      const meetingPoint = await MeetingPointModel.create(getNewMeetingPointFixture());
      const victim = await createYoungHelper(getNewYoungFixture({ meetingPointId: meetingPoint._id.toString() }));
      const attacker = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(attacker, "young")).get(`/young/${victim._id}/meeting-point`);

      expect(res.status).toBe(403);
    });

    it("refuse à un référent départemental de lire le point de rassemblement d'un jeune hors de son département", async () => {
      const meetingPoint = await MeetingPointModel.create(getNewMeetingPointFixture());
      const victim = await createYoungHelper(getNewYoungFixture({ ...loireAtlantique, meetingPointId: meetingPoint._id.toString() }));
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Finistère"], region: "Bretagne" }));

      const res = await request(await getAppHelperWithAcl(attacker, "referent")).get(`/young/${victim._id}/meeting-point`);

      expect(res.status).toBe(403);
    });

    it("renvoie son point de rassemblement au jeune", async () => {
      const meetingPoint = await MeetingPointModel.create(getNewMeetingPointFixture());
      const young = await createYoungHelper(getNewYoungFixture({ meetingPointId: meetingPoint._id.toString() }));

      const res = await request(await getAppHelperWithAcl(young, "young")).get(`/young/${young._id}/meeting-point`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(meetingPoint._id.toString());
    });
  });

  describe("L8 — POST /cohort-session/eligibility/2023/:id", () => {
    it("refuse à un jeune de calculer l'éligibilité d'un autre jeune", async () => {
      const victim = await createYoungHelper(getNewYoungFixture(loireAtlantique));
      const attacker = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(attacker, "young")).post(`/cohort-session/eligibility/2023/${victim._id}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(ERRORS.OPERATION_UNAUTHORIZED);
    });

    it("ne révèle pas à un jeune l'existence d'un identifiant de volontaire", async () => {
      const attacker = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(attacker, "young")).post(`/cohort-session/eligibility/2023/${new ObjectId().toString()}`);

      expect(res.status).toBe(403);
    });

    it("autorise un jeune à calculer sa propre éligibilité", async () => {
      const young = await createYoungHelper(getNewYoungFixture(loireAtlantique));

      const res = await request(await getAppHelperWithAcl(young, "young")).post(`/cohort-session/eligibility/2023/${young._id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("refuse un référent départemental hors du département du volontaire", async () => {
      const victim = await createYoungHelper(getNewYoungFixture(loireAtlantique));
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Finistère"], region: "Bretagne" }));

      const res = await request(await getAppHelperWithAcl(attacker, "referent")).post(`/cohort-session/eligibility/2023/${victim._id}?getAllSessions=true`);

      expect(res.status).toBe(403);
    });

    it("refuse un administrateur CLE sans lien avec la classe du volontaire", async () => {
      const etablissement = await EtablissementModel.create(createFixtureEtablissement({ referentEtablissementIds: [], coordinateurIds: [] }));
      const classe = await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [] }));
      const victim = await createYoungHelper(getNewYoungFixture({ ...loireAtlantique, classeId: classe._id.toString() }));
      const attacker = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE }));

      const res = await request(await getAppHelperWithAcl(attacker, "referent")).post(`/cohort-session/eligibility/2023/${victim._id}`);

      expect(res.status).toBe(403);
    });

    it("autorise le référent départemental du volontaire", async () => {
      const young = await createYoungHelper(getNewYoungFixture(loireAtlantique));
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Loire-Atlantique"], region: "Pays de la Loire" }));

      const res = await request(await getAppHelperWithAcl(referent, "referent")).post(`/cohort-session/eligibility/2023/${young._id}?getAllSessions=true`);

      expect(res.status).toBe(200);
    });

    it("laisse un jeune sans identifiant calculer l'éligibilité de données saisies", async () => {
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(await getAppHelperWithAcl(young, "young"))
        .post(`/cohort-session/eligibility/2023`)
        .send({ department: "Loire-Atlantique", region: "Pays de la Loire", birthdateAt: "2010-01-01", grade: "2ndeGT", zip: "44000" });

      expect(res.status).toBe(200);
    });
  });
});
