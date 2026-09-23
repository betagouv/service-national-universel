import request from "supertest";
import fs from "fs";
import os from "os";
import path from "path";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { ROLES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createSessionPhase1, getSessionPhase1ById } from "./helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import getNewCohortFixture from "./fixtures/cohort";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import { CohortModel, CohesionCenterModel, SessionPhase1Model } from "../models";

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
    it("PUT /:id est refusé à un référent d'un autre département et au transporteur", async () => {
      const { session } = await createSession("m32-put");
      for (const user of [referentHorsPerimetre(), transporteur()]) {
        const res = await request(getAppHelper(user)).put(`/session-phase1/${session._id}`).send({ placesTotal: 1 });
        expect(res.status).toBe(403);
      }
      expect((await getSessionPhase1ById(session._id))?.placesTotal).toBe(session.placesTotal);
    });

    it("PUT /:id ignore headCenterId, cohesionCenterId, cohort, waitingList, placesLeft et team", async () => {
      const { session } = await createSession("m32-dto");
      const res = await request(getAppHelper(referentDuPerimetre()))
        .put(`/session-phase1/${session._id}`)
        .send({
          placesTotal: 20,
          headCenterId: new ObjectId().toString(),
          cohesionCenterId: new ObjectId().toString(),
          cohort: "autre",
          waitingList: [new ObjectId().toString()],
          placesLeft: 999,
          team: [{ firstName: "Intrus" }],
        });
      expect(res.status).toBe(200);
      const updated = await SessionPhase1Model.findById(session._id);
      expect(updated?.placesTotal).toBe(20);
      expect(updated?.headCenterId).toBe(session.headCenterId);
      expect(updated?.cohesionCenterId).toBe(session.cohesionCenterId);
      expect(updated?.cohort).toBe(session.cohort);
      expect(updated?.waitingList).toHaveLength(0);
      expect(updated?.placesLeft).not.toBe(999);
      expect(updated?.team).toHaveLength(0);
    });

    it("DELETE /:id est refusé hors périmètre et au transporteur", async () => {
      const { session } = await createSession("m33-del");
      for (const user of [referentHorsPerimetre(), transporteur()]) {
        const res = await request(getAppHelper(user)).delete(`/session-phase1/${session._id}`);
        expect(res.status).toBe(403);
      }
      expect(await SessionPhase1Model.findById(session._id)).not.toBeNull();
    });

    it("POST / n'existe plus", async () => {
      const { center, cohort } = await createSession("m33-post");
      const res = await request(getAppHelper(transporteur())).post("/session-phase1").send({ cohesionCenterId: center._id.toString(), cohort: cohort.name, placesTotal: 10 });
      expect(res.status).toBe(404);
    });
  });

  describe("M34 / M32 — équipe", () => {
    it("PUT /:id/team et /:id/directionTeam sont refusés hors périmètre", async () => {
      const { session } = await createSession("m34");
      const app = getAppHelper(referentHorsPerimetre());
      const team = await request(app)
        .put(`/session-phase1/${session._id}/team`)
        .send({ team: [{ firstName: "A", lastName: "B", role: "animateur", email: "a@example.com", phone: "0600000000" }] });
      const direction = await request(app).put(`/session-phase1/${session._id}/directionTeam`).send({ referentId: new ObjectId().toString(), role: ROLES.HEAD_CENTER });
      expect(team.status).toBe(403);
      expect(direction.status).toBe(403);
      expect((await SessionPhase1Model.findById(session._id))?.team).toHaveLength(0);
    });

    it("PUT /:id/team ne stocke que les champs typés d'un membre", async () => {
      const { session } = await createSession("m34-typed");
      const res = await request(getAppHelper(referentDuPerimetre()))
        .put(`/session-phase1/${session._id}/team`)
        .send({ team: [{ firstName: "A", lastName: "B", role: "animateur", email: "a@example.com", phone: "0600000000", isAdmin: true, $where: "1" }] });
      expect(res.status).toBe(200);
      const [member] = ((await SessionPhase1Model.findById(session._id))?.toObject().team || []) as any[];
      expect(member.firstName).toBe("A");
      expect(member.isAdmin).toBeUndefined();
      expect(member.$where).toBeUndefined();
    });

    it("PUT /:id/team refuse un membre qui n'est pas un objet", async () => {
      const { session } = await createSession("m34-any");
      const res = await request(getAppHelper(referentDuPerimetre()))
        .put(`/session-phase1/${session._id}/team`)
        .send({ team: ["texte libre"] });
      expect(res.status).toBe(400);
    });
  });

  describe("L20 — dépôt de fichier", () => {
    it("un fichier au type non reconnu est refusé au lieu d'être enregistré comme PDF", async () => {
      const { session } = await createSession("l20");
      const tmp = path.join(os.tmpdir(), `k1-l20-${Date.now()}.pdf`);
      fs.writeFileSync(tmp, "ceci n'est pas un pdf");
      const res = await request(getAppHelper(referentDuPerimetre()))
        .post(`/session-phase1/${session._id}/time-schedule`)
        .attach("file", tmp, { filename: "edt.pdf", contentType: "application/pdf" });
      fs.rmSync(tmp, { force: true });
      expect(res.body.code).toBe("UNSUPPORTED_TYPE");
      expect((await SessionPhase1Model.findById(session._id))?.timeScheduleFiles).toHaveLength(0);
    });

    it("le dépôt est refusé hors périmètre", async () => {
      const { session } = await createSession("l20-scope");
      const tmp = path.join(os.tmpdir(), `k1-l20-scope-${Date.now()}.pdf`);
      fs.writeFileSync(tmp, "%PDF-1.4\n");
      const res = await request(getAppHelper(referentHorsPerimetre()))
        .post(`/session-phase1/${session._id}/time-schedule`)
        .attach("file", tmp, { filename: "edt.pdf", contentType: "application/pdf" });
      fs.rmSync(tmp, { force: true });
      expect(res.status).toBe(403);
    });
  });
});
