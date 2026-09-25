import request from "supertest";
import mongoose, { Types } from "mongoose";
const { ObjectId } = Types;
import { ROLES, PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";

import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import getNewCohortFixture from "./fixtures/cohort";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import getNewLigneToPointFixture from "./fixtures/PlanDeTransport/ligneToPoint";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import getPlanDeTransportFixture from "./fixtures/PlanDeTransport/planDeTransport";
import getBusTeamFixture from "./fixtures/busTeam";
import { CohortModel, CohesionCenterModel, LigneBusModel, LigneToPointModel, ModificationBusModel, PlanTransportModel, PointDeRassemblementModel } from "../models";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER], PERMISSION_RESOURCES.LIGNE_BUS, PERMISSION_ACTIONS.READ);
  // Sans ce seed, le refus de filter-options viendrait de l'absence de permission et le test serait vert par construction.
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
});
afterAll(dbClose);
afterEach(resetAppAuth);

const DEP_CIBLE = "Yvelines";
const REGION_CIBLE = "Île-de-France";

const referentDepHorsPerimetre = () => ({
  _id: new ObjectId().toString(),
  role: ROLES.REFERENT_DEPARTMENT,
  department: ["Nord"],
  region: "Hauts-de-France",
  firstName: "Hors",
  lastName: "Dep",
});
const referentDepDuPerimetre = () => ({
  _id: new ObjectId().toString(),
  role: ROLES.REFERENT_DEPARTMENT,
  department: [DEP_CIBLE],
  region: REGION_CIBLE,
  firstName: "Dans",
  lastName: "Dep",
});
const responsable = () => ({ _id: new ObjectId().toString(), role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() });

let seq = 0;
async function createLigne(cohortOverrides: Record<string, unknown> = {}) {
  seq += 1;
  const cohort = await CohortModel.create({
    ...getNewCohortFixture(),
    name: `lot-l1-${seq}-${new ObjectId()}`,
    pdrEditionOpenForReferentRegion: true,
    pdrEditionOpenForReferentDepartment: true,
    isTransportPlanCorrectionRequestOpen: true,
    informationsConvoyage: { editionOpenForReferentRegion: true, editionOpenForReferentDepartment: true },
    ...cohortOverrides,
  });
  const center = await CohesionCenterModel.create({ ...getNewCohesionCenterFixture(), department: DEP_CIBLE, region: REGION_CIBLE });
  const pdr = await PointDeRassemblementModel.create({ ...getNewPointDeRassemblementFixture(), cohorts: [cohort.name], department: DEP_CIBLE, region: REGION_CIBLE });
  const bus = await LigneBusModel.create(
    getNewLigneBusFixture({
      cohort: cohort.name,
      centerId: center._id.toString(),
      meetingPointsIds: [pdr._id.toString()],
      team: [getBusTeamFixture({ mail: `convoyeur-${seq}@example.com` })] as any,
    }),
  );
  const ligneToPoint = await LigneToPointModel.create({ ...getNewLigneToPointFixture(), lineId: bus._id.toString(), meetingPointId: pdr._id.toString(), meetingHour: "08:00" });
  await PlanTransportModel.create({
    ...getPlanDeTransportFixture({ cohort: cohort.name, centerId: center._id.toString() }),
    _id: bus._id,
    pointDeRassemblements: [
      { ...pdr.toObject(), meetingPointId: pdr._id.toString(), transportType: "bus", meetingHour: "08:00", busArrivalHour: "08:30", departureHour: "09:00", returnHour: "18:00" },
    ],
  } as any);
  return { cohort, center, pdr, bus, ligneToPoint };
}

describe("Plan de transport — périmètre (lot L1)", () => {
  describe("M21 — demandes de modification", () => {
    it("un référent hors périmètre ne lit pas les demandes d'une ligne", async () => {
      const { bus } = await createLigne();
      await ModificationBusModel.create({
        lineId: bus._id.toString(),
        lineName: bus.busId,
        cohort: bus.cohort,
        requestMessage: "secret",
        requestUserId: "x",
        requestUserName: "x",
        requestUserRole: ROLES.ADMIN,
      });
      const res = await request(await getAppHelper(referentDepHorsPerimetre())).get(`/demande-de-modification/ligne/${bus._id}`);
      expect(res.status).toBe(403);
      expect(JSON.stringify(res.body)).not.toContain("secret");
    });

    it("un référent du périmètre lit les demandes de sa ligne", async () => {
      const { bus } = await createLigne();
      await ModificationBusModel.create({
        lineId: bus._id.toString(),
        lineName: bus.busId,
        cohort: bus.cohort,
        requestMessage: "visible",
        requestUserId: "x",
        requestUserName: "x",
        requestUserRole: ROLES.ADMIN,
      });
      const res = await request(await getAppHelper(referentDepDuPerimetre())).get(`/demande-de-modification/ligne/${bus._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("M62 — options de filtre de l'historique", () => {
    beforeAll(async () => {
      const { bus } = await createLigne();
      await mongoose.connection.db!.collection("lignebus_patches").insertOne({
        ref: bus._id,
        ops: [{ op: "replace", path: "/busId", value: "X" }],
        user: { _id: new ObjectId(), firstName: "Auteur", lastName: "Patch", email: "auteur-m62@example.com", role: ROLES.ADMIN, department: "Paris" },
        date: new Date(),
      });
    });

    it("est refusé à un responsable de structure, même porteur de PATCH:READ", async () => {
      const res = await request(await getAppHelperWithAcl(responsable() as any)).get("/ligne-de-bus/patches/filter-options");
      expect(res.status).toBe(403);
      expect(JSON.stringify(res.body)).not.toContain("auteur-m62@example.com");
    });

    it("ne renvoie que le nom des auteurs", async () => {
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN } as any)).get("/ligne-de-bus/patches/filter-options");
      expect(res.status).toBe(200);
      const auteur = res.body.data.user.find((u) => u.lastName === "Patch");
      expect(auteur).toBeDefined();
      expect(Object.keys(auteur).sort()).toEqual(["_id", "firstName", "lastName"]);
      expect(JSON.stringify(res.body)).not.toContain("auteur-m62@example.com");
    });

    it("un référent hors périmètre ne voit pas les auteurs des lignes des autres territoires", async () => {
      const res = await request(await getAppHelperWithAcl(referentDepHorsPerimetre() as any)).get("/ligne-de-bus/patches/filter-options");
      // Aucun centre dans le Nord dans ce jeu : refus, comme /patches/:cohort.
      expect(res.status).toBe(403);
    });
  });

  describe("L17 — liaison ligne ↔ PDR", () => {
    it("un référent hors périmètre ne lit pas la liaison d'un PDR", async () => {
      const { pdr } = await createLigne();
      const res = await request(await getAppHelperWithAcl(referentDepHorsPerimetre() as any)).get(`/ligne-to-point/meeting-point/${pdr._id}`);
      expect(res.status).toBe(403);
    });

    it("un référent du périmètre lit la liaison", async () => {
      const { pdr } = await createLigne();
      const res = await request(await getAppHelperWithAcl(referentDepDuPerimetre() as any)).get(`/ligne-to-point/meeting-point/${pdr._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.meetingPoint._id).toBe(pdr._id.toString());
    });
  });
});
