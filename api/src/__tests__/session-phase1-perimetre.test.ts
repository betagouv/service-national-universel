import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { ROLES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createSessionPhase1 } from "./helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import getNewCohortFixture from "./fixtures/cohort";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import { CohortModel, CohesionCenterModel } from "../models";

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
const transporteur = () => ({ role: ROLES.TRANSPORTER });
const administrateurCle = () => ({ role: ROLES.ADMINISTRATEUR_CLE });

async function createSession(suffix: string, extra: Record<string, unknown> = {}) {
  const cohort = await CohortModel.create({
    ...getNewCohortFixture(),
    name: `k1-${suffix}`,
    sessionEditionOpenForReferentDepartment: true,
    sessionEditionOpenForReferentRegion: true,
    sessionEditionOpenForTransporter: true,
  });
  const center = await CohesionCenterModel.create({ ...getNewCohesionCenterFixture(), department: DEP_CIBLE, region: REGION_CIBLE });
  const session = await createSessionPhase1({
    ...getNewSessionPhase1Fixture(),
    cohort: cohort.name,
    cohortId: cohort._id.toString(),
    cohesionCenterId: center._id.toString(),
    department: DEP_CIBLE,
    region: REGION_CIBLE,
    ...extra,
  });
  return { cohort, center, session };
}

describe("Sessions phase 1 — périmètre des référents (lot K1)", () => {
  describe("M31 — lecture", () => {
    it("GET /:id est refusé à un référent hors périmètre, au transporteur et aux rôles CLE", async () => {
      const { session } = await createSession("m31-get");
      for (const user of [referentHorsPerimetre(), referentRegionHorsPerimetre(), transporteur(), administrateurCle()]) {
        const res = await request(getAppHelper(user)).get(`/session-phase1/${session._id}`);
        expect(res.status).toBe(403);
      }
    });

    it("GET /:id reste accessible au référent du périmètre", async () => {
      const { session } = await createSession("m31-get-ok");
      const res = await request(getAppHelper(referentDuPerimetre())).get(`/session-phase1/${session._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(session._id.toString());
    });

    it("GET / ne renvoie que les sessions du périmètre", async () => {
      const { session } = await createSession("m31-list");
      const horsPerimetre = await request(getAppHelper(referentHorsPerimetre())).get("/session-phase1");
      expect(horsPerimetre.status).toBe(200);
      expect(horsPerimetre.body.data.map((s) => s._id)).not.toContain(session._id.toString());

      const duPerimetre = await request(getAppHelper(referentDuPerimetre())).get("/session-phase1");
      expect(duPerimetre.body.data.map((s) => s._id)).toContain(session._id.toString());
      expect(duPerimetre.body.data.every((s) => s.department === DEP_CIBLE)).toBe(true);

      const res = await request(getAppHelper(transporteur())).get("/session-phase1");
      expect(res.status).toBe(403);
    });

    it("le téléchargement d'un fichier de session est refusé hors périmètre", async () => {
      const fileId = new ObjectId().toString();
      const { session } = await createSession("m31-file", {
        timeScheduleFiles: [{ _id: fileId, name: "edt.pdf", size: 10, uploadedAt: new Date(), mimetype: "application/pdf" }] as any,
      });
      const res = await request(getAppHelper(referentHorsPerimetre())).get(`/session-phase1/${session._id}/time-schedule/${fileId}`);
      expect(res.status).toBe(403);
    });

    it("GET /:id/plan-de-transport est refusé hors périmètre", async () => {
      const { session } = await createSession("m31-pdt");
      const res = await request(getAppHelper(referentHorsPerimetre())).get(`/session-phase1/${session._id}/plan-de-transport`);
      expect(res.status).toBe(403);
    });
  });

  describe("M32 / M33 — modification et suppression", () => {
    it("POST / n'existe plus", async () => {
      const { center, cohort } = await createSession("m33-post");
      const res = await request(getAppHelper(transporteur())).post("/session-phase1").send({ cohesionCenterId: center._id.toString(), cohort: cohort.name, placesTotal: 10 });
      expect(res.status).toBe(404);
    });
  });
});
