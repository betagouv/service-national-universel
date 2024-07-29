import { Types } from "mongoose";
import request from "supertest";

import { ROLES } from "snu-lib";

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
} from "../models";

import { getNewImportPlanTransportFixture } from "./fixtures/PlanDeTransport/importPlanTransport";
import getNewCohortFixture from "./fixtures/cohort";

import { dbConnect, dbClose, mockTransaction } from "./helpers/db";
import getAppHelper from "./helpers/app";
import { createCohortHelper } from "./helpers/cohort";
import { initPlanTransport, getXlsxBufferPlanTransport } from "./helpers/PlanDeTransport/planDeTransport";

const { ObjectId } = Types;

beforeAll(dbConnect);
afterAll(dbClose);

// disable transaction for this test
mockTransaction();
jest.mock("../utils/virusScanner", () => jest.fn().mockResolvedValue({ isInfected: false }));

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

  it("sgould return 403 if user is not authenticated", async () => {
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
  });
});
