const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { createReferentHelper, deleteReferentByIdHelper } = require("./helpers/referent");
const getNewReferentFixture = require("./fixtures/referent");
const TableDeRepartitionModel = require("../models/PlanDeTransport/tableDeRepartition");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);
describe("Table de répartition", () => {
  let referent;

  beforeEach(async () => {
    const newReferent = await createReferentHelper(getNewReferentFixture());
    referent = newReferent;
  });

  afterEach(async () => {
    await deleteReferentByIdHelper(referent._id);
    await TableDeRepartitionModel.deleteMany();
  });
  describe("POST /region", () => {
    it("should return 400 when request body is invalid", async () => {
      const res = await request(getAppHelper()).post("/table-de-repartition/region").send({
        cohort: "Février 2023 - C",
        fromRegion: "Paris",
        toRegion: "",
      });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, code: "INVALID_PARAMS" });
    });

    it("should return 409 when tableDeRepartition already exists", async () => {
      const res1 = await request(getAppHelper())
        .post("/table-de-repartition/region")
        .set("Authorization", `Bearer ${referent.token}`)
        .send({ cohort: "Février 2023 - C", fromRegion: "Paris441112", toRegion: "HOHOs1321" });
      expect(res1.status).toBe(200);

      const res2 = await request(getAppHelper()).post("/table-de-repartition/region").send({ cohort: "Février 2023 - C", fromRegion: "Paris441112", toRegion: "HOHOs1321" });
      expect(res2.status).toBe(409);
      expect(res2.body).toEqual({ ok: false, code: "ALREADY_EXISTS" });
    });

    it("should return 200 when tableDeRepartition is created successfully", async () => {
      const res = await request(getAppHelper()).post("/table-de-repartition/region").send({ cohort: "Février 2023 - C", fromRegion: "Paris14621", toRegion: "HOH2136" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      await TableDeRepartitionModel.deleteMany();
    });

    it("should return 500 when an error occurs", async () => {
      jest.spyOn(TableDeRepartitionModel, "findOne").mockRejectedValue(new Error("Mock server error"));
      const res = await request(getAppHelper()).post("/table-de-repartition/region").send({ cohort: "Février 2023 - C", fromRegion: "Pari6s115", toRegion: "QHUQIHD" });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ ok: false, code: "SERVER_ERROR" });

      // Restore the original implementation of the function
      jest.restoreAllMocks();
    });
  });
  describe("POST /delete/region", () => {
    it("should return 400 when request body is invalid", async () => {
      const res = await request(getAppHelper()).post("/table-de-repartition/delete/region").send({
        cohort: "Février 2023 - C",
        fromRegion: "Paris",
        toRegion: "",
      });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, code: "INVALID_PARAMS" });
    });

    it("should return 200 when tableDeRepartition is deleted successfully", async () => {
      const res1 = await request(getAppHelper()).post("/table-de-repartition/region").send({ cohort: "Février 2023 - C", fromRegion: "Paris441112", toRegion: "HOHOs1321" });
      expect(res1.status).toBe(200);

      const res2 = await request(getAppHelper()).post("/table-de-repartition/delete/region").send({ cohort: "Février 2023 - C", fromRegion: "Paris441112", toRegion: "HOHOs1321" });
      expect(res2.status).toBe(200);
      expect(res2.body).toEqual({ ok: true });
    });

    it("should return 500 when an error occurs", async () => {
      jest.spyOn(TableDeRepartitionModel, "find").mockRejectedValue(new Error("Mock server error"));
      const res = await request(getAppHelper()).post("/table-de-repartition/delete/region").send({ cohort: "Février 2023 - C", fromRegion: "Pari6s115", toRegion: "QHUQIHD" });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ ok: false, code: "SERVER_ERROR" });
      jest.restoreAllMocks();
    });
  });
  describe("POST /department", () => {
    it("should return 400 when request body is invalid", async () => {
      const res = await request(getAppHelper()).post("/table-de-repartition/department").send({
        cohort: "Février 2023 - C",
        fromRegion: "Paris14621",
        toRegion: "HOH2136",
        fromDepartment: "",
        toDepartment: "",
      });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, code: "INVALID_PARAMS" });
    });
    it("should return 400 when fromDepartment and toDepartment are empty", async () => {
      const res = await request(getAppHelper()).post("/table-de-repartition/department").send({
        cohort: "Février 2023 - C",
        fromRegion: "Paris1416211",
        toRegion: "HOH123136",
        fromDepartment: "Department112",
        toDepartment: "Department122",
      });
      expect(res.status).toEqual(400);
      expect(res.body).toEqual({ ok: false, code: "OPERATION_UNAUTHORIZED" });
    });
  });
  describe("GET /national/:cohort", () => {
    it("should return 200 and filtered data when request is valid and user can view tableDeRepartition", async () => {
      // Create a new tableDeRepartition
      const tableDeRepartition = await TableDeRepartitionModel.create({
        cohort: "Février 2023 - C",
        fromRegion: "Paris14621",
        toRegion: "HOH2136",
        fromDepartment: "Department1",
        toDepartment: "Department2",
      });

      // Create a new referent with permission to view tableDeRepartition
      const referent = await createReferentHelper(getNewReferentFixture());
      referent.permissions = ["viewTableDeRepartition"];
      await referent.save();

      // Send a GET request to the route with the valid cohort parameter and authorization token
      const res = await request(getAppHelper()).get(`/table-de-repartition/national/Février 2023 - C`).set("Authorization", `Bearer ${referent.token}`);

      // Expect a 200 response with the filtered data
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual([
        {
          _id: tableDeRepartition._id.toString(),
          cohort: "Février 2023 - C",
          fromRegion: "Paris14621",
          toRegion: "HOH2136",
          fromDepartment: "Department1",
          toDepartment: "Department2",
          avancement: 0,
        },
      ]);

      // Clean up by deleting the created referent and tableDeRepartition
      await deleteReferentByIdHelper(referent._id);
      await tableDeRepartition.delete();
    });

    it("should return 400 when cohort parameter is missing", async () => {
      referent.permissions = ["viewTableDeRepartition"];
      await referent.save();

      // Send a GET request to the route without the cohort parameter and with authorization token
      const res = await request(getAppHelper()).get(`/table-de-repartition/national`);

      // Expect a 400 response with an error message
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("INVALID_PARAMS");
    });

    it("should return 403 when user does not have permission to view tableDeRepartition", async () => {
      const res = await request(getAppHelper()).get(`/table-de-repartition/national/Février 2023 - C`);

      // Expect a 403 response with an error message
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("OPERATION_UNAUTHORIZED");
    });

    it("should return 500 when an error occurs", async () => {
      // Create a new referent with permission to view tableDeRepartition
      referent.permissions = ["viewTableDeRepartition"];
      await referent.save();

      // Mock the tableDeRepartition.find() method to throw an error
      jest.spyOn(TableDeRepartitionModel, "find").mockRejectedValue(new Error("Mock server error"));

      // Send a GET request to the route with a valid cohort parameter and authorization token
      const res = await request(getAppHelper()).get(`/table-de-repartition/national/Février 2023 - C`);

      // Expect a 500 response with an error message
      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe("SERVER_ERROR");

      // Restore the original implementation of the tableDeRepartition.find() method
      jest.restoreAllMocks();
    });
  });
});
