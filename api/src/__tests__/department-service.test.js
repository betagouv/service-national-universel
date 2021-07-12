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
} = require("./helpers/departmentService");
const { dbConnect, dbClose } = require("./helpers/db");
const getAppHelper = require("./helpers/app");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Department service", () => {
  it("POST /department-service", async () => {
    const departmentServiceFixture = getNewDepartmentServiceFixture();
    const departmentServicesBefore = await getDepartmentServicesHelper();
    const res = await request(getAppHelper()).post("/department-service").send(departmentServiceFixture);
    expect(res.statusCode).toEqual(200);
    expectDepartmentServiceToEqual(departmentServiceFixture, res.body.data);
    const departmentServiceAfter = await getDepartmentServicesHelper();
    expect(departmentServiceAfter.length).toEqual(departmentServicesBefore.length + 1);
    await deleteDepartmentServiceByIdHelper(res.body.data._id);
  });

  it("GET /department-service/referent/:id", async () => {
    const referentFixture = getNewReferentFixture();
    const referent = await createReferentHelper(referentFixture);
    let departmentServiceFixture = getDepartmentServicesHelper();
    departmentServiceFixture.department = referentFixture.department;
    const departmentService = await createDepartmentServiceHelper(departmentServiceFixture);
    const res = await request(getAppHelper()).get(`/department-service/referent/${referent._id}`).send();
    expect(res.statusCode).toEqual(200);
    expectDepartmentServiceToEqual(departmentServiceFixture, res.body.data);
    await deleteDepartmentServiceByIdHelper(departmentService._id);
    await deleteReferentByIdHelper(referent._id);
  });

  it("GET /department-service", async () => {
    const departmentServiceFixture = getNewDepartmentServiceFixture();
    const departmentService = await createDepartmentServiceHelper(departmentServiceFixture);
    const res = await request(getAppHelper()).get("/department-service").send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectDepartmentServiceToEqual(res.body.data[0], departmentServiceFixture);
    await deleteDepartmentServiceByIdHelper(departmentService._id);
  });
});
