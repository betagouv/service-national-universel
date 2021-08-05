require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getNewReferentFixture = require("./fixtures/referent");
const getNewDepartmentServiceFixture = require("./fixtures/departmentService");
const { deleteReferentByIdHelper, createReferentHelper } = require("./helpers/referent");
const {
  getDepartmentServicesHelper,
  deleteDepartmentServiceByIdHelper,
  createDepartmentServiceHelper,
  expectDepartmentServiceToEqual,
  deleteAllDepartmentServicesHelper,
} = require("./helpers/departmentService");
const { dbConnect, dbClose } = require("./helpers/db");
const getAppHelper = require("./helpers/app");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

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
  });
  describe("GET /department-service/:department", () => {
    it("should get only the department-service of :department", async () => {
      let departmentServiceFixture = getDepartmentServicesHelper();
      departmentServiceFixture.department = "dep";
      const departmentService = await createDepartmentServiceHelper(departmentServiceFixture);
      const res = await request(getAppHelper()).get(`/department-service/dep`).send();
      expect(res.statusCode).toEqual(200);
      expectDepartmentServiceToEqual(departmentServiceFixture, res.body.data);
      await deleteDepartmentServiceByIdHelper(departmentService._id);
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
