import request from "supertest";
import getNewDepartmentServiceFixture from "./fixtures/departmentService";
import {
  getDepartmentServicesHelper,
  deleteDepartmentServiceByIdHelper,
  createDepartmentServiceHelper,
  expectDepartmentServiceToEqual,
  deleteAllDepartmentServicesHelper,
} from "./helpers/departmentService";
import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";

beforeAll(dbConnect);
afterAll(dbClose);
afterEach(resetAppAuth);

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
});
