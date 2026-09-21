import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { ROLES, YOUNG_STATUS } from "snu-lib";

import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createSessionPhase1 } from "./helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import { createYoungHelper } from "./helpers/young";
import getNewYoungFixture from "./fixtures/young";
import getNewCohortFixture from "./fixtures/cohort";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import getNewLigneToPointFixture from "./fixtures/PlanDeTransport/ligneToPoint";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import getBusTeamFixture from "./fixtures/busTeam";
import { SessionPhase1TokenModel, CohortModel, CohesionCenterModel, LigneBusModel, LigneToPointModel, PointDeRassemblementModel } from "../models";
import { addPermissionHelper } from "./helpers/permissions";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  // Même seed qu'en production (migration 20250624122150) : LIGNE_BUS:READ sans policy.
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER], PERMISSION_RESOURCES.LIGNE_BUS, PERMISSION_ACTIONS.READ);
});
afterAll(dbClose);
afterEach(resetAppAuth);

const DEP_ATTAQUANT = "Guyane";
const REGION_ATTAQUANT = "Guyane";
const DEP_CIBLE = "Yvelines";
const REGION_CIBLE = "Île-de-France";

/** Responsable de structure : le rôle le plus bas de la famille référent. */
const responsable = () => ({ role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() });
/** Chef de centre : rôle supprimé du produit, il ne doit plus rien atteindre. */
const chefDeCentre = () => ({ role: ROLES.HEAD_CENTER, cohesionCenterId: new ObjectId().toString() });
/** Référent départemental hors du périmètre de la session ciblée. */
const referentHorsPerimetre = () => ({ role: ROLES.REFERENT_DEPARTMENT, department: [DEP_ATTAQUANT], region: REGION_ATTAQUANT });
/** Référent départemental du département de la session ciblée. */
const referentDuPerimetre = () => ({ role: ROLES.REFERENT_DEPARTMENT, department: [DEP_CIBLE], region: REGION_CIBLE });

async function createCenterWithSession(suffix: string) {
  const cohort = await CohortModel.create({ ...getNewCohortFixture(), name: `lot5-${suffix}`, busListAvailability: true });
  const center = await CohesionCenterModel.create({ ...getNewCohesionCenterFixture(), department: DEP_CIBLE, region: REGION_CIBLE });
  const session = await createSessionPhase1({
    ...getNewSessionPhase1Fixture(),
    cohortId: cohort._id.toString(),
    cohesionCenterId: center._id.toString(),
    department: DEP_CIBLE,
    region: REGION_CIBLE,
  });
  return { cohort, center, session };
}

async function createLigneWithTeam(cohortName: string, centerId: string, mail: string) {
  const pdr = await PointDeRassemblementModel.create({
    ...getNewPointDeRassemblementFixture(),
    cohorts: [cohortName],
    department: DEP_CIBLE,
    region: REGION_CIBLE,
  });
  const bus = await LigneBusModel.create(
    getNewLigneBusFixture({
      cohort: cohortName,
      centerId,
      meetingPointsIds: [pdr._id.toString()],
      team: [getBusTeamFixture({ mail, phone: "0611111111" })] as any,
    }),
  );
  await LigneToPointModel.create({ ...getNewLigneToPointFixture(), lineId: bus._id.toString(), meetingPointId: pdr._id.toString() });
  return { pdr, bus };
}

describe("Séjours et transport — surface retirée et périmètre (lot 5)", () => {
  describe("C13 — partage de session phase 1", () => {
    it("POST /session-phase1/:id/share n'existe plus", async () => {
      const { session } = await createCenterWithSession("c13");
      const res = await request(await getAppHelper(responsable()))
        .post(`/session-phase1/${session._id}/share`)
        .send({ emails: ["attaquant@example.com"] });

      // La route n'existe plus : la requête retombe sur le handler générique d'upload, qui rejette la clé.
      expect(res.status).not.toBe(200);
      expect(await SessionPhase1TokenModel.countDocuments({ sessionId: session._id })).toBe(0);
    });

    it("POST /session-phase1/check-token/:token n'existe plus", async () => {
      const res = await request(await getAppHelper()).post("/session-phase1/check-token/nimporte-quel-token");
      expect(res.status).not.toBe(200);
    });
  });

  describe("H36 — rattachement d'un chef de centre", () => {
    it("PUT et DELETE /session-phase1/:id/headCenter n'existent plus", async () => {
      const { session } = await createCenterWithSession("h36");
      const app = await getAppHelper(chefDeCentre());
      const put = await request(app).put(`/session-phase1/${session._id}/headCenter`).send({ id: new ObjectId().toString() });
      const del = await request(app).delete(`/session-phase1/${session._id}/headCenter`);
      expect(put.status).toBe(404);
      expect(del.status).toBe(404);
    });
  });

  describe("H32 — import du plan de transport", () => {
    it("les routes d'import n'existent plus", async () => {
      const app = await getAppHelper({ role: ROLES.SUPERVISOR, structureId: new ObjectId().toString() });
      const verif = await request(app).post("/plan-de-transport/import/2026-A");
      const exec = await request(app).post(`/plan-de-transport/import/${new ObjectId()}/execute`);
      expect(verif.status).toBe(404);
      expect(exec.status).toBe(404);
    });
  });

  describe("H35 / H37 — exports par session", () => {
    it("un responsable de structure n'obtient plus les attestations d'une session", async () => {
      const { session } = await createCenterWithSession("h35");
      const res = await request(await getAppHelper(responsable())).post(`/session-phase1/${session._id}/certificate`);
      expect(res.status).toBe(403);
    });

    it("un référent hors périmètre n'obtient plus les attestations d'une session", async () => {
      const { session } = await createCenterWithSession("h35bis");
      const res = await request(await getAppHelper(referentHorsPerimetre())).post(`/session-phase1/${session._id}/certificate`);
      expect(res.status).toBe(403);
    });

    it("un chef de centre n'exporte plus les droits à l'image d'une session", async () => {
      const { session } = await createCenterWithSession("h37");
      const res = await request(await getAppHelper(chefDeCentre())).post(`/session-phase1/${session._id}/image-rights/export`);
      expect(res.status).toBe(403);
    });

    it("un référent hors périmètre n'exporte plus les droits à l'image d'une session", async () => {
      const { session } = await createCenterWithSession("h37bis");
      const res = await request(await getAppHelper(referentHorsPerimetre())).post(`/session-phase1/${session._id}/image-rights/export`);
      expect(res.status).toBe(403);
    });
  });

  describe("C19 / H59 / H60 — points de rassemblement et lignes de bus", () => {
    it("GET /ligneToPoint/:cohort/:centerId est refusé à un responsable", async () => {
      const { cohort, center } = await createCenterWithSession("c19");
      await createLigneWithTeam(cohort.name!, center._id.toString(), "convoyeur-c19@example.com");
      const res = await request(await getAppHelper(responsable())).get(`/point-de-rassemblement/ligneToPoint/${cohort.name}/${center._id}`);
      expect(res.status).toBe(403);
    });

    it("GET /ligneToPoint/:cohort/:centerId est refusé à un référent hors périmètre", async () => {
      const { cohort, center } = await createCenterWithSession("c19bis");
      await createLigneWithTeam(cohort.name!, center._id.toString(), "convoyeur-c19bis@example.com");
      const res = await request(await getAppHelper(referentHorsPerimetre())).get(`/point-de-rassemblement/ligneToPoint/${cohort.name}/${center._id}`);
      expect(res.status).toBe(403);
    });

    it("un référent du périmètre accède à la ligne, mais sans l'équipe de convoyage", async () => {
      const { cohort, center } = await createCenterWithSession("c19ok");
      await createLigneWithTeam(cohort.name!, center._id.toString(), "convoyeur-c19ok@example.com");
      const res = await request(await getAppHelper(referentDuPerimetre())).get(`/point-de-rassemblement/ligneToPoint/${cohort.name}/${center._id}`);
      expect(res.status).toBe(200);
      const body = JSON.stringify(res.body);
      expect(body).not.toContain("convoyeur-c19ok@example.com");
      expect(body).not.toContain("0611111111");
    });

    it("GET /fullInfo/:pdrId/:busId est refusé à un référent hors périmètre", async () => {
      const { cohort, center } = await createCenterWithSession("c19full");
      const { pdr, bus } = await createLigneWithTeam(cohort.name!, center._id.toString(), "convoyeur-full@example.com");
      const res = await request(await getAppHelper(referentHorsPerimetre())).get(`/point-de-rassemblement/fullInfo/${pdr._id}/${bus._id}`);
      expect(res.status).toBe(403);
    });

    it("H60 — un jeune affecté ne reçoit plus les coordonnées des accompagnateurs", async () => {
      const { cohort, center } = await createCenterWithSession("h60");
      const { pdr, bus } = await createLigneWithTeam(cohort.name!, center._id.toString(), "convoyeur-h60@example.com");
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        status: YOUNG_STATUS.VALIDATED,
        meetingPointId: pdr._id.toString(),
        ligneId: bus._id.toString(),
      });

      const res = await request(await getAppHelper(young as any, "young")).get(`/point-de-rassemblement/fullInfo/${pdr._id}/${bus._id}`);

      expect(res.status).toBe(200);
      const body = JSON.stringify(res.body);
      expect(body).not.toContain("convoyeur-h60@example.com");
      expect(body).not.toContain("0611111111");
    });

    it("H59 — GET /center/:centerId/cohort/:cohort est refusé hors périmètre", async () => {
      const { cohort, center } = await createCenterWithSession("h59");
      await createLigneWithTeam(cohort.name!, center._id.toString(), "convoyeur-h59@example.com");
      const res = await request(await getAppHelper(chefDeCentre())).get(`/point-de-rassemblement/center/${center._id}/cohort/${cohort.name}`);
      expect(res.status).toBe(403);
    });

    it("H59 — GET /:id/bus/:cohort est refusé hors périmètre", async () => {
      const { cohort, center } = await createCenterWithSession("h59bis");
      const { pdr } = await createLigneWithTeam(cohort.name!, center._id.toString(), "convoyeur-h59bis@example.com");
      const res = await request(await getAppHelper(referentHorsPerimetre())).get(`/point-de-rassemblement/${pdr._id}/bus/${cohort.name}`);
      expect(res.status).toBe(403);
    });
  });

  describe("H57 — lecture des lignes de bus", () => {
    it("GET /ligne-de-bus/all ne renvoie que le périmètre de l'utilisateur, sans équipe", async () => {
      const { cohort, center } = await createCenterWithSession("h57");
      await createLigneWithTeam(cohort.name!, center._id.toString(), "convoyeur-h57@example.com");

      // ligne rattachée à un centre d'une autre région
      const autreCentre = await CohesionCenterModel.create({ ...getNewCohesionCenterFixture(), department: "Nord", region: "Hauts-de-France" });
      await createLigneWithTeam(cohort.name!, autreCentre._id.toString(), "convoyeur-hors-perimetre@example.com");

      const res = await request(await getAppHelperWithAcl(referentDuPerimetre() as any)).get("/ligne-de-bus/all");

      expect(res.status).toBe(200);
      const body = JSON.stringify(res.body);
      expect(body).not.toContain("convoyeur-h57@example.com");
      expect(body).not.toContain("convoyeur-hors-perimetre@example.com");
      const centerIds = (res.body.data?.ligneBus || []).map((l) => l.centerId);
      expect(centerIds).not.toContain(autreCentre._id.toString());
    });

    it("GET /ligne-de-bus/:id est refusé hors périmètre", async () => {
      const { cohort, center } = await createCenterWithSession("h57bis");
      const { bus } = await createLigneWithTeam(cohort.name!, center._id.toString(), "convoyeur-h57bis@example.com");
      const res = await request(await getAppHelperWithAcl(referentHorsPerimetre() as any)).get(`/ligne-de-bus/${bus._id}`);
      expect(res.status).toBe(403);
    });
  });
});
