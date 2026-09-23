import request from "supertest";
import mongoose, { Types } from "mongoose";
const { ObjectId } = Types;
import { ROLES, YOUNG_STATUS, PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";

import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createYoungHelper } from "./helpers/young";
import { addPermissionHelper } from "./helpers/permissions";
import getNewYoungFixture from "./fixtures/young";
import getNewCohortFixture from "./fixtures/cohort";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import getNewLigneToPointFixture from "./fixtures/PlanDeTransport/ligneToPoint";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import getPlanDeTransportFixture from "./fixtures/PlanDeTransport/planDeTransport";
import getBusTeamFixture from "./fixtures/busTeam";
import { CohortModel, CohesionCenterModel, LigneBusModel, LigneToPointModel, ModificationBusModel, PlanTransportModel, PointDeRassemblementModel, YoungModel } from "../models";

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

const referentRegionHorsPerimetre = () => ({
  _id: new ObjectId().toString(),
  role: ROLES.REFERENT_REGION,
  region: "Bretagne",
  department: [] as string[],
  firstName: "Hors",
  lastName: "Region",
});
const referentDepHorsPerimetre = () => ({
  _id: new ObjectId().toString(),
  role: ROLES.REFERENT_DEPARTMENT,
  department: ["Nord"],
  region: "Hauts-de-France",
  firstName: "Hors",
  lastName: "Dep",
});
const referentRegionDuPerimetre = () => ({
  _id: new ObjectId().toString(),
  role: ROLES.REFERENT_REGION,
  region: REGION_CIBLE,
  department: [] as string[],
  firstName: "Dans",
  lastName: "Region",
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

const teamBody = {
  role: "leader",
  lastname: "Nouveau",
  firstname: "Convoyeur",
  birthdate: "1990-01-01",
  phone: "0600000000",
  mail: "nouveau@example.com",
  forth: true,
  back: true,
};

describe("Plan de transport — périmètre (lot L1)", () => {
  describe("M60 — équipe de convoyage", () => {
    it("un référent régional d'une autre région ne modifie pas l'équipe, même fenêtre ouverte", async () => {
      const { bus } = await createLigne();
      const res = await request(await getAppHelper(referentRegionHorsPerimetre()))
        .put(`/ligne-de-bus/${bus._id}/team`)
        .send(teamBody);
      expect(res.status).toBe(403);
      const after = await LigneBusModel.findById(bus._id);
      expect(after!.team.length).toBe(1);
    });

    it("un référent départemental hors périmètre ne supprime pas un membre de l'équipe", async () => {
      const { bus } = await createLigne();
      const member = bus.team[0];
      const res = await request(await getAppHelper(referentDepHorsPerimetre()))
        .put(`/ligne-de-bus/${bus._id}/teamDelete`)
        .send({ ...teamBody, idTeam: member._id!.toString() });
      expect(res.status).toBe(403);
      const after = await LigneBusModel.findById(bus._id);
      expect(after!.team.length).toBe(1);
    });

    it("un référent régional du périmètre modifie l'équipe quand la fenêtre est ouverte", async () => {
      const { bus } = await createLigne();
      const res = await request(await getAppHelper(referentRegionDuPerimetre()))
        .put(`/ligne-de-bus/${bus._id}/team`)
        .send(teamBody);
      expect(res.status).toBe(200);
      const after = await LigneBusModel.findById(bus._id);
      expect(after!.team.length).toBe(2);
    });
  });

  describe("M61 — horaires d'un point de ligne", () => {
    const pdrBody = (pdrId: string) => ({
      transportType: "train",
      meetingHour: "07:00",
      busArrivalHour: "07:30",
      departureHour: "08:00",
      returnHour: "18:00",
      meetingPointId: pdrId,
      newMeetingPointId: pdrId,
    });

    it("un référent départemental hors périmètre est refusé", async () => {
      const { bus, pdr, ligneToPoint } = await createLigne();
      const res = await request(await getAppHelper(referentDepHorsPerimetre()))
        .put(`/ligne-de-bus/${bus._id}/pointDeRassemblement`)
        .send(pdrBody(pdr._id.toString()));
      expect(res.status).toBe(403);
      const after = await LigneToPointModel.findById(ligneToPoint._id);
      expect(after!.meetingHour).toBe("08:00");
    });

    it("un référent du périmètre est refusé quand la fenêtre d'édition des PDR est fermée", async () => {
      const { bus, pdr } = await createLigne({ pdrEditionOpenForReferentDepartment: false });
      const res = await request(await getAppHelper(referentDepDuPerimetre()))
        .put(`/ligne-de-bus/${bus._id}/pointDeRassemblement`)
        .send(pdrBody(pdr._id.toString()));
      expect(res.status).toBe(403);
    });

    it("un référent du périmètre modifie l'horaire quand la fenêtre est ouverte", async () => {
      const { bus, pdr, ligneToPoint } = await createLigne();
      const res = await request(await getAppHelper(referentDepDuPerimetre()))
        .put(`/ligne-de-bus/${bus._id}/pointDeRassemblement`)
        .send(pdrBody(pdr._id.toString()));
      expect(res.status).toBe(200);
      const after = await LigneToPointModel.findById(ligneToPoint._id);
      expect(after!.meetingHour).toBe("07:00");
    });
  });

  describe("M21 — demandes de modification", () => {
    it("un référent régional d'une autre région ne crée pas de demande sur la ligne", async () => {
      const { bus } = await createLigne();
      const res = await request(await getAppHelper(referentRegionHorsPerimetre()))
        .post("/demande-de-modification")
        .send({ lineId: bus._id.toString(), message: "intrusion" });
      expect(res.status).toBe(403);
      expect(await ModificationBusModel.countDocuments({ lineId: bus._id.toString() })).toBe(0);
    });

    it("un référent régional du périmètre crée une demande sur sa ligne", async () => {
      const { bus } = await createLigne();
      const res = await request(await getAppHelper(referentRegionDuPerimetre()))
        .post("/demande-de-modification")
        .send({ lineId: bus._id.toString(), message: "légitime" });
      expect(res.status).toBe(200);
      expect(await ModificationBusModel.countDocuments({ lineId: bus._id.toString() })).toBe(1);
    });

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

    it("un référent régional hors périmètre n'écrit pas dans le fil d'une demande", async () => {
      const { bus } = await createLigne();
      const modif = await ModificationBusModel.create({
        lineId: bus._id.toString(),
        lineName: bus.busId,
        cohort: bus.cohort,
        requestMessage: "m",
        requestUserId: "x",
        requestUserName: "x",
        requestUserRole: ROLES.ADMIN,
      });
      const res = await request(await getAppHelper(referentRegionHorsPerimetre()))
        .put(`/demande-de-modification/${modif._id}/message`)
        .send({ message: "intrusion" });
      expect(res.status).toBe(403);
      const after = await ModificationBusModel.findById(modif._id);
      expect(after!.messages || []).toHaveLength(0);
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

  describe("M22 — déplacement de jeunes entre lignes", () => {
    it("n'écrit que les champs d'affectation : les autres champs envoyés sont ignorés", async () => {
      const { bus: busFrom, pdr: pdrFrom } = await createLigne();
      const { bus: busTo, pdr: pdrTo } = await createLigne();
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        status: YOUNG_STATUS.VALIDATED,
        ligneId: busFrom._id.toString(),
        meetingPointId: pdrFrom._id.toString(),
        email: `jeune-m22-${new ObjectId()}@example.com`,
      });

      const res = await request(await getAppHelper({ role: ROLES.ADMIN }))
        .post("/edit-transport/saveYoungs")
        .send({
          busFrom: busFrom._id.toString(),
          busTo: busTo._id.toString(),
          data: [
            {
              _id: young._id.toString(),
              ligneId: busTo._id.toString(),
              meetingPointId: pdrTo._id.toString(),
              sessionPhase1Id: busTo.sessionId,
              email: "attaquant@example.com",
              status: YOUNG_STATUS.WITHDRAWN,
              password: "motdepasse",
            },
          ],
        });

      expect(res.status).toBe(200);
      const after = await YoungModel.findById(young._id).select("+password");
      expect(after!.ligneId).toBe(busTo._id.toString());
      expect(after!.meetingPointId).toBe(pdrTo._id.toString());
      expect(after!.email).toBe(young.email);
      expect(after!.status).toBe(YOUNG_STATUS.VALIDATED);
      expect(after!.password).toBe(young.password);
    });

    it("refuse un jeune qui n'est pas sur la ligne de départ", async () => {
      const { bus: busFrom } = await createLigne();
      const { bus: busTo, pdr: pdrTo } = await createLigne();
      const young = await createYoungHelper({ ...getNewYoungFixture(), ligneId: new ObjectId().toString() });

      const res = await request(await getAppHelper({ role: ROLES.ADMIN }))
        .post("/edit-transport/saveYoungs")
        .send({
          busFrom: busFrom._id.toString(),
          busTo: busTo._id.toString(),
          data: [{ _id: young._id.toString(), ligneId: busTo._id.toString(), meetingPointId: pdrTo._id.toString(), sessionPhase1Id: busTo.sessionId }],
        });

      expect(res.status).toBe(403);
      const after = await YoungModel.findById(young._id);
      expect(after!.ligneId).not.toBe(busTo._id.toString());
    });

    it("refuse un point de rassemblement étranger à la ligne d'arrivée", async () => {
      const { bus: busFrom, pdr: pdrFrom } = await createLigne();
      const { bus: busTo } = await createLigne();
      const young = await createYoungHelper({ ...getNewYoungFixture(), ligneId: busFrom._id.toString(), meetingPointId: pdrFrom._id.toString() });

      const res = await request(await getAppHelper({ role: ROLES.ADMIN }))
        .post("/edit-transport/saveYoungs")
        .send({
          busFrom: busFrom._id.toString(),
          busTo: busTo._id.toString(),
          data: [{ _id: young._id.toString(), ligneId: busTo._id.toString(), meetingPointId: new ObjectId().toString(), sessionPhase1Id: busTo.sessionId }],
        });

      expect(res.status).toBe(400);
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

  describe("L34 — retrait d'une cohorte d'un PDR", () => {
    it("un référent hors périmètre ne retire pas une cohorte", async () => {
      const { pdr, cohort } = await createLigne();
      const res = await request(await getAppHelper(referentDepHorsPerimetre()))
        .put(`/point-de-rassemblement/delete/cohort/${pdr._id}`)
        .send({ cohort: cohort.name });
      expect(res.status).toBe(403);
      const after = await PointDeRassemblementModel.findById(pdr._id);
      expect(after!.cohorts).toContain(cohort.name);
    });

    it("un référent du périmètre est refusé quand la fenêtre d'édition des PDR est fermée", async () => {
      const { pdr, cohort } = await createLigne({ pdrEditionOpenForReferentDepartment: false });
      const res = await request(await getAppHelper(referentDepDuPerimetre()))
        .put(`/point-de-rassemblement/delete/cohort/${pdr._id}`)
        .send({ cohort: cohort.name });
      expect(res.status).toBe(403);
    });

    it("un référent du périmètre retire la cohorte quand la fenêtre est ouverte", async () => {
      const { pdr, cohort } = await createLigne();
      const res = await request(await getAppHelper(referentDepDuPerimetre()))
        .put(`/point-de-rassemblement/delete/cohort/${pdr._id}`)
        .send({ cohort: cohort.name });
      expect(res.status).toBe(200);
      const after = await PointDeRassemblementModel.findById(pdr._id);
      expect(after!.cohorts).not.toContain(cohort.name);
    });
  });
});
