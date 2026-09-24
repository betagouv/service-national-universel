import request from "supertest";
import { ROLES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createSessionPhase1 } from "./helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import { getNewCohesionCenterFixture, getNewCohesionCenterFixtureV2 } from "./fixtures/cohesionCenter";
import { CohesionCenterModel } from "../models";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
afterEach(resetAppAuth);

const DEP_CIBLE = "Yvelines";
const REGION_CIBLE = "Île-de-France";

const referentHorsPerimetre = () => ({ role: ROLES.REFERENT_DEPARTMENT, department: ["Guyane"], region: "Guyane" });
const referentDuPerimetre = () => ({ role: ROLES.REFERENT_DEPARTMENT, department: [DEP_CIBLE], region: REGION_CIBLE });
const referentRegionHorsPerimetre = () => ({ role: ROLES.REFERENT_REGION, region: "Bretagne" });
const referentRegionDuPerimetre = () => ({ role: ROLES.REFERENT_REGION, region: REGION_CIBLE });
const transporteur = () => ({ role: ROLES.TRANSPORTER });
const administrateurCle = () => ({ role: ROLES.ADMINISTRATEUR_CLE });
const responsable = () => ({ role: ROLES.RESPONSIBLE });

const refusesHorsPerimetre = () => [referentHorsPerimetre(), referentRegionHorsPerimetre(), transporteur(), administrateurCle(), responsable()];

async function createCenter(extra: Record<string, unknown> = {}) {
  return CohesionCenterModel.create({ ...getNewCohesionCenterFixture(), department: DEP_CIBLE, region: REGION_CIBLE, cohorts: [], ...extra });
}

async function createCenterWithSession(cohort: string) {
  const center = await createCenter({ cohorts: [cohort] });
  const session = await createSessionPhase1({
    ...getNewSessionPhase1Fixture(),
    cohort,
    cohesionCenterId: center._id.toString(),
    department: DEP_CIBLE,
    region: REGION_CIBLE,
  });
  return { center, session };
}

describe("Centres de cohésion — périmètre (lot K2)", () => {
  describe("M10 — écriture", () => {
    it("PUT /:id et POST / sont supprimées", async () => {
      const center = await createCenter();
      const put = await request(getAppHelper())
        .put(`/cohesion-center/${center._id}`)
        .send({ ...getNewCohesionCenterFixtureV2(), name: "modifié" });
      expect(put.status).toBe(404);
      const post = await request(getAppHelper()).post("/cohesion-center").send(getNewCohesionCenterFixtureV2());
      expect(post.status).toBe(404);

      const inchange = await CohesionCenterModel.findById(center._id);
      expect(inchange?.name).toBe(center.name);
    });
  });

  describe("M11 — export des présences", () => {
    it("POST /export-presence est supprimée", async () => {
      for (const user of [responsable(), { role: ROLES.ADMIN }]) {
        const res = await request(getAppHelper(user)).post("/cohesion-center/export-presence").send({});
        expect(res.status).toBe(404);
      }
    });
  });

  describe("L6 — lecture", () => {
    it("GET /:id est refusé hors périmètre et aux rôles transporteur / CLE", async () => {
      const center = await createCenter();
      for (const user of refusesHorsPerimetre()) {
        const res = await request(getAppHelper(user)).get(`/cohesion-center/${center._id}`);
        expect(res.status).toBe(403);
      }
      for (const user of [referentDuPerimetre(), referentRegionDuPerimetre(), { role: ROLES.ADMIN }]) {
        const res = await request(getAppHelper(user)).get(`/cohesion-center/${center._id}`);
        expect(res.status).toBe(200);
      }
    });

    it("les sessions d'un centre sont refusées hors périmètre", async () => {
      const { center, session } = await createCenterWithSession("k2-l6-sessions");
      for (const user of refusesHorsPerimetre()) {
        const liste = await request(getAppHelper(user)).get(`/cohesion-center/${center._id}/session-phase1`);
        expect(liste.status).toBe(403);
        const parCohorte = await request(getAppHelper(user)).get(`/cohesion-center/${center._id}/cohort/k2-l6-sessions/session-phase1`);
        expect(parCohorte.status).toBe(403);
      }

      const liste = await request(getAppHelper(referentDuPerimetre())).get(`/cohesion-center/${center._id}/session-phase1`);
      expect(liste.status).toBe(200);
      expect(liste.body.data.map((s) => s._id)).toEqual([session._id.toString()]);
      const parCohorte = await request(getAppHelper(referentDuPerimetre())).get(`/cohesion-center/${center._id}/cohort/k2-l6-sessions/session-phase1`);
      expect(parCohorte.status).toBe(200);
      expect(parCohorte.body.data._id).toBe(session._id.toString());
    });

    it("GET / ne renvoie que les centres du périmètre", async () => {
      const center = await createCenter();
      const autre = await createCenter({ department: "Guyane", region: "Guyane" });

      const duPerimetre = await request(getAppHelper(referentDuPerimetre())).get("/cohesion-center");
      expect(duPerimetre.status).toBe(200);
      const ids = duPerimetre.body.data.map((c) => c._id);
      expect(ids).toContain(center._id.toString());
      expect(ids).not.toContain(autre._id.toString());
      expect(duPerimetre.body.data.every((c) => c.department === DEP_CIBLE)).toBe(true);

      for (const user of [transporteur(), administrateurCle(), responsable()]) {
        const res = await request(getAppHelper(user)).get("/cohesion-center");
        expect(res.status).toBe(403);
      }
    });

    it("un identifiant invalide renvoie 400 et non 500", async () => {
      const res = await request(getAppHelper()).get("/cohesion-center/pas-un-id/cohort/k2/session-phase1");
      expect(res.status).toBe(400);
    });
  });
});
