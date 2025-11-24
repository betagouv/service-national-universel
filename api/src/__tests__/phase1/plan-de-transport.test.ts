import { Types } from "mongoose";
import request from "supertest";

import { ROLES, TRANSPORT_MODES } from "snu-lib";

import {
  ImportPlanTransportModel,
  PointDeRassemblementModel,
  LigneBusModel,
  SessionPhase1Model,
  LigneToPointModel,
  CohesionCenterModel,
  ClasseModel,
  PlanTransportModel,
  CohortModel,
} from "../../models";

import { getNewImportPlanTransportFixture, getNewImportPlanTransportLineFixture } from "../fixtures/PlanDeTransport/importPlanTransport";
import getNewCohortFixture from "../fixtures/cohort";

import { dbConnect, dbClose, mockTransaction } from "../helpers/db";
import getAppHelper from "../helpers/app";
import { createCohortHelper } from "../helpers/cohort";
import { initPlanTransport, getXlsxBufferPlanTransport } from "../helpers/PlanDeTransport/planDeTransport";

const { ObjectId } = Types;

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);

// disable transaction for this test
mockTransaction();

describe("POST /plan-de-transport/import/:cohort", () => {
  beforeEach(async () => {
    await Promise.all([
      CohesionCenterModel.deleteMany(),
      SessionPhase1Model.deleteMany(),
      ImportPlanTransportModel.deleteMany(),
      PointDeRassemblementModel.deleteMany(),
      CohortModel.deleteMany(),
    ]);
  });
  it("should return 400 if no files", async () => {
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/plan-de-transport/import/Avril 2023 - A")
      .send();
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_BODY");
  });
  it("should return 403 if user is not authenticated", async () => {
    const response = await request(getAppHelper({ role: ROLES.VISITOR }))
      .post("/plan-de-transport/import/Avril 2023 - A")
      .attach("file", Buffer.from("test"), { filename: "test.xslx" });
    expect(response.status).toBe(403);
  });
  it("should return 404 if cohort does not exists", async () => {
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/plan-de-transport/import/Avril 2023 - A")
      .attach("file", Buffer.from("test"), { filename: "test.xslx" });
    expect(response.status).toBe(404);
  });
  it("should return 200 if import plan created successfully", async () => {
    await createCohortHelper(getNewCohortFixture({ name: "Avril 2023 - A" }));
    const importPlanTransport = await ImportPlanTransportModel.create(getNewImportPlanTransportFixture());
    await initPlanTransport(importPlanTransport);
    const xlsxFile = await getXlsxBufferPlanTransport(importPlanTransport);
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/plan-de-transport/import/Avril 2023 - A")
      .attach("file", xlsxFile, { filename: "test.xslx" });
    expect(response.body.errors).toBeUndefined();
    expect(response.status).toBe(200);
  });

  it("should return 200 if import plan with optionnal column", async () => {
    await createCohortHelper(getNewCohortFixture({ name: "Avril 2023 - A" }));
    const importPlanTransport = await ImportPlanTransportModel.create(
      getNewImportPlanTransportFixture([
        // without LIGNE MIROIR
        getNewImportPlanTransportLineFixture({
          "Code court de route": "2025-02_HTS-01_075-010_003",
          "LIGNES FUSIONNÉES": null,
        }),
      ]),
    );
    await initPlanTransport(importPlanTransport);
    const xlsxFile = await getXlsxBufferPlanTransport(importPlanTransport);
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/plan-de-transport/import/Avril 2023 - A")
      .attach("file", xlsxFile, { filename: "test.xslx" });
    expect(response.body.errors).toBeUndefined();
    expect(response.status).toBe(200);
  });
});

describe("POST /plan-de-transport/import/:importId/execute", () => {
  beforeEach(async () => {
    await Promise.all([
      ImportPlanTransportModel.deleteMany(),
      PointDeRassemblementModel.deleteMany(),
      LigneBusModel.deleteMany(),
      SessionPhase1Model.deleteMany(),
      LigneToPointModel.deleteMany(),
      CohesionCenterModel.deleteMany(),
      ClasseModel.deleteMany(),
      PlanTransportModel.deleteMany(),
    ]);
  });
  it("should return 400 if import plan id is not a valid ObjectId", async () => {
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/plan-de-transport/import/invalid-id/execute")
      .send();
    expect(response.status).toBe(400);
  });

  it("should return 403 if user is not authenticated", async () => {
    const response = await request(getAppHelper({ role: ROLES.VISITOR }))
      .post(`/plan-de-transport/import/${new ObjectId()}/execute`)
      .send();
    expect(response.status).toBe(403);
  });

  it("should return 404 if import plan not found", async () => {
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post(`/plan-de-transport/import/${new ObjectId()}/execute`)
      .send();
    expect(response.status).toBe(404);
  });

  it("should execute import plan successfully", async () => {
    const importPlanTransport = await ImportPlanTransportModel.create(getNewImportPlanTransportFixture());
    await initPlanTransport(importPlanTransport);

    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post(`/plan-de-transport/import/${importPlanTransport._id}/execute`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);

    const importedPdts = await PlanTransportModel.find({ cohort: importPlanTransport.cohort });
    const importedLigneDeBus = await LigneBusModel.find({ cohort: importPlanTransport.cohort });
    const pdt = importedPdts[0];
    expect(pdt.pointDeRassemblements[0].__t).toBe("Enriched");
    expect(pdt.pointDeRassemblements[0].returnHour).toBeDefined();
    expect(pdt.pointDeRassemblements[0].cohorts).toBeDefined();
    // check lowercase
    expect(importedLigneDeBus[2].meetingPointsIds).toEqual(["63da1f2547841408c58e53ca", "63da1f2547841408c58e53cb"]);
    // check lowercase
    expect(importedLigneDeBus[2].centerId).toBe("63c919d5700cce08ce846633");
    expect(importedLigneDeBus[0].mirrorBusId).toBe("OCC034008");
    expect(importedLigneDeBus[0].toJSON().mergedBusIds).toStrictEqual(["OCC034006", "OCC034008"]);
    expect(importedLigneDeBus[1].mirrorBusId).toBe("OCC034006");
    expect(importedLigneDeBus[1].toJSON().mergedBusIds).toStrictEqual(["OCC034006", "OCC034008"]);
    expect(importedLigneDeBus[2].mirrorBusId).toBe("");
    expect(importedLigneDeBus[2].toJSON().mergedBusIds).toStrictEqual([]);
  });

  it("should set meetingHour correctly for bus transport", async () => {
    const planTransportFixture = getNewImportPlanTransportFixture();
    const planTransportModified = {
      ...planTransportFixture,
      lines: [
        {
          ...planTransportFixture.lines[0],
          "TYPE DE TRANSPORT PDR 1": TRANSPORT_MODES.BUS,
          "HEURE DEPART DU PDR 1": "09:00",
        },
      ],
    };
    const importPlanTransport = await ImportPlanTransportModel.create(planTransportModified);

    await initPlanTransport(importPlanTransport);

    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post(`/plan-de-transport/import/${importPlanTransport._id}/execute`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);

    const importedPdts = await PlanTransportModel.find({ cohort: importPlanTransport.cohort });
    const pdt = importedPdts[0];
    const pdr = pdt.pointDeRassemblements[0];

    expect(pdr.departureHour).toBe("09:00");
    expect(pdr.meetingHour).toBe("08:30");
  });

  it("should set meetingHour correctly for train transport", async () => {
    const planTransportFixture = getNewImportPlanTransportFixture();
    const planTransportModified = {
      ...planTransportFixture,
      lines: [
        {
          ...planTransportFixture.lines[0],
          "TYPE DE TRANSPORT PDR 1": TRANSPORT_MODES.TRAIN,
          "HEURE DEPART DU PDR 1": "10:00",
        },
      ],
    };
    const importPlanTransport = await ImportPlanTransportModel.create(planTransportModified);

    await initPlanTransport(importPlanTransport);

    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post(`/plan-de-transport/import/${importPlanTransport._id}/execute`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);

    const importedPdts = await PlanTransportModel.find({ cohort: importPlanTransport.cohort });
    const pdt = importedPdts[0];
    const pdr = pdt.pointDeRassemblements[0];

    expect(pdr.departureHour).toBe("10:00");
    expect(pdr.meetingHour).toBe("08:30");
  });

  it("should set meetingHour correctly for multiple transport modes", async () => {
    const planTransportFixture = getNewImportPlanTransportFixture();
    const planTransportModified = {
      ...planTransportFixture,
      lines: [
        {
          ...planTransportFixture.lines[1],
          "TYPE DE TRANSPORT PDR 1": TRANSPORT_MODES.BUS,
          "HEURE DEPART DU PDR 1": "09:00",
          "TYPE DE TRANSPORT PDR 2": TRANSPORT_MODES.TRAIN,
          "HEURE DEPART DU PDR 2": "10:00",
        },
      ],
    };
    const importPlanTransport = await ImportPlanTransportModel.create(planTransportModified);

    await initPlanTransport(importPlanTransport);

    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post(`/plan-de-transport/import/${importPlanTransport._id}/execute`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);

    const importedPdts = await PlanTransportModel.find({ cohort: importPlanTransport.cohort });
    const pdt = importedPdts[0];

    expect(pdt.pointDeRassemblements[0].departureHour).toBe("09:00");
    expect(pdt.pointDeRassemblements[0].meetingHour).toBe("08:30");

    expect(pdt.pointDeRassemblements[1].departureHour).toBe("10:00");
    expect(pdt.pointDeRassemblements[1].meetingHour).toBe("08:30");
  });

  it("should set meetingHour correctly for unknown transport mode", async () => {
    const planTransportFixture = getNewImportPlanTransportFixture();
    const planTransportModified = {
      ...planTransportFixture,
      lines: [
        {
          ...planTransportFixture.lines[0],
          "TYPE DE TRANSPORT PDR 1": "UNKNOWN_MODE",
          "HEURE DEPART DU PDR 1": "09:00",
        },
      ],
    };
    const importPlanTransport = await ImportPlanTransportModel.create(planTransportModified);

    await initPlanTransport(importPlanTransport);

    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post(`/plan-de-transport/import/${importPlanTransport._id}/execute`)
      .send();

    expect(response.status).toBe(500);
    expect(response.body.ok).toBe(false);
  });
});
