import request from "supertest";
import getNewDepartmentServiceFixture from "./fixtures/departmentService";
import {
  getDepartmentServicesHelper,
  deleteDepartmentServiceByIdHelper,
  createDepartmentServiceHelper,
  expectDepartmentServiceToEqual,
  deleteAllDepartmentServicesHelper,
} from "./helpers/departmentService";
import { createReferentHelper } from "./helpers/referent";
import { getNewReferentFixture } from "./fixtures/referent";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";
import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";
import { ROLES } from "snu-lib";
import { CohortModel, DepartmentServiceModel, ReferentModel } from "../models";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
afterEach(resetAppAuth);
beforeEach(async () => {
  await CohortModel.deleteMany({});
  await DepartmentServiceModel.deleteMany({});
  await ReferentModel.deleteMany({});
});

describe("Department service", () => {
  describe("POST /department-service", () => {
    it("should create department service", async () => {
      const departmentServiceFixture = getNewDepartmentServiceFixture();
      const departmentServicesBefore = await getDepartmentServicesHelper();
      const res = await request(getAppHelper()).post("/department-service").send(departmentServiceFixture);
      expect(res.statusCode).toEqual(200);
      expectDepartmentServiceToEqual(departmentServiceFixture, res.body.data);
      const departmentServiceAfter = await getDepartmentServicesHelper();
      expect(departmentServiceAfter.length).toEqual(departmentServicesBefore.length + 1);
      await deleteDepartmentServiceByIdHelper(res.body.data._id);
    });
    it("should return 400 if body is not validated", async () => {
      const departmentServiceFixture = { ...getNewDepartmentServiceFixture(), department: 29 };
      const res = await request(getAppHelper()).post("/department-service").send(departmentServiceFixture);
      expect(res.statusCode).toEqual(400);
    });
  });
  describe("GET /department-service/:department", () => {
    it.skip("should get only the department-service of :department", async () => {
      let departmentServiceFixture = (await getDepartmentServicesHelper()).map((ds) => ({ ...ds, department: "dep" }));
      const departmentService = await createDepartmentServiceHelper(departmentServiceFixture);
      const res = await request(getAppHelper()).get(`/department-service/dep`).send();
      expect(res.statusCode).toEqual(200);
      expectDepartmentServiceToEqual(departmentServiceFixture, res.body.data);
      await deleteDepartmentServiceByIdHelper(departmentService._id);
    });
    it("should return 403 if a young try to get other department service", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), department: "foo" });
      let departmentServiceFixture = await getDepartmentServicesHelper();
      const departmentService = await createDepartmentServiceHelper(departmentServiceFixture);
      const res = await request(getAppHelper(young)).get(`/department-service/bar`).send();
      expect(res.statusCode).toEqual(403);
      await deleteDepartmentServiceByIdHelper(departmentService._id);
    });
    it("should return 404 if department service not found", async () => {
      const res = await request(getAppHelper()).get(`/department-service/departementinconnuaubataillon`).send();
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("GET /department-service", () => {
    it("should return all the department service", async () => {
      await deleteAllDepartmentServicesHelper();
      const departmentServiceFixture = getNewDepartmentServiceFixture();
      const departmentService = await createDepartmentServiceHelper(departmentServiceFixture);
      const res = await request(getAppHelper()).get("/department-service").send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toEqual(1);
      expectDepartmentServiceToEqual(res.body.data[0], departmentServiceFixture);
      await deleteDepartmentServiceByIdHelper(departmentService._id);
    });
  });

  describe("Department service export", () => {
    it("should export department service contacts", async () => {
      // Create a cohort
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Test Cohort" }));

      await createDepartmentServiceHelper({ department: "zone1", contacts: [{ cohort: "Test Cohort" }] });
      await createDepartmentServiceHelper({ department: "zone2", contacts: [] });
      await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: "region1", email: "region1@example.com" }));
      await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["zone1"], email: "dep1@example.com", lastLoginAt: new Date() }));

      const res = await request(getAppHelper()).get(`/department-service/${cohort._id}/DepartmentServiceContact/export`).send();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("ok", true);
      expect(res.body.data).toHaveProperty("base64");
      expect(res.body.data).toHaveProperty("mimeType", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      expect(res.body.data).toHaveProperty("fileName", `${cohort.name}_export_MissingContact.xlsx`);
    });

    it("should return 400 if cohortId is not valid", async () => {
      const res = await request(getAppHelper()).get(`/department-service/invalid-id/DepartmentServiceContact/export`).send();
      expect(res.statusCode).toEqual(400);
    });

    it("should return 404 if cohort is not found", async () => {
      const res = await request(getAppHelper()).get(`/department-service/60d21b4667d0d8992e610c85/DepartmentServiceContact/export`).send();
      expect(res.statusCode).toEqual(404);
    });
  });
});
