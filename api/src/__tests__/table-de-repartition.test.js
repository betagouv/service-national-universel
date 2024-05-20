const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { createReferentHelper, deleteReferentByIdHelper } = require("./helpers/referent");
const getNewReferentFixture = require("./fixtures/referent");
const TableDeRepartitionModel = require("../models/PlanDeTransport/tableDeRepartition");

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
      const res1 = await request(getAppHelper()).post("/table-de-repartition/region").send({ cohort: "Février 2023 - C", fromRegion: "Paris441112", toRegion: "HOHOs1321" });
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
    it("should return 200 when request is valid and user can edit tableDeRepartition department", async () => {
      // Create a new referent with permission to edit tableDeRepartition department
      const referent = await createReferentHelper(getNewReferentFixture());
      referent.permissions = ["editTableDeRepartitionDepartment"];
      await referent.save();

      // Create a new tableDeRepartition
      const tableDeRepartition = await TableDeRepartitionModel.create({
        cohort: "Février 2023 - C",
        fromRegion: "Paris14621",
        toRegion: "HOH2136",
      });

      // Send a POST request to the route with the valid parameters and authorization token
      const res = await request(getAppHelper()).post("/table-de-repartition/department").send({
        cohort: "Février 2023 - C",
        fromRegion: "Paris14621",
        toRegion: "HOH2136",
        fromDepartment: "Department1",
        toDepartment: "Department2",
      });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      // Clean up by deleting the created referent and tableDeRepartition
      await deleteReferentByIdHelper(referent._id);
      await tableDeRepartition.delete();
    });
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
    it("should return 200 when request is valid and user can view tableDeRepartition", async () => {
      // Create a new referent with permission to view tableDeRepartition
      const referent = await createReferentHelper(getNewReferentFixture());
      referent.permissions = ["viewTableDeRepartition"];
      await referent.save();

      // Send a GET request to the route with the valid cohort parameter and authorization token
      const res = await request(getAppHelper()).get(`/table-de-repartition/national/Février 2023 - C`).send();

      // Expect a 200 response
      expect(res.status).toBe(200);

      // Clean up by deleting the created referent
      await deleteReferentByIdHelper(referent._id);
    });

    it("should return 404 when cohort parameter is missing", async () => {
      // Create a new referent with permission to view tableDeRepartition
      const referent = await createReferentHelper(getNewReferentFixture());
      referent.permissions = ["viewTableDeRepartition"];
      await referent.save();

      // Send a GET request to the route without the cohort parameter and authorization token
      const res = await request(getAppHelper()).get(`/table-de-repartition/national`);

      // Expect a 404 response
      expect(res.status).toBe(404);

      // Clean up by deleting the created referent
      await deleteReferentByIdHelper(referent._id);
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
  describe("GET /toRegion/:cohort/:region", () => {
    it("should return 200 and data when request is valid and user can view tableDeRepartition", async () => {
      // Define a mock table de répartition object
      const mockTableDeRepartition = {
        _id: "mockId",
        cohort: "Février 2023 - C",
        region: "Paris",
        data: [
          {
            trainNumber: "1234",
            departureTime: "08:00",
            arrivalTime: "10:00",
          },
          {
            trainNumber: "5678",
            departureTime: "10:00",
            arrivalTime: "12:00",
          },
        ],
      };

      // Create a mock request parameters with valid values
      const requestParams = {
        cohort: "Février 2023 - C",
        region: "Paris",
      };

      // Mock the tableDeRepartition.find() method to return a mock table de répartition
      jest.spyOn(TableDeRepartitionModel, "find").mockResolvedValueOnce([mockTableDeRepartition]);

      // Send a GET request to the /table-de-repartition/toRegion/:cohort/:region endpoint with the mock request parameters and user object
      const res = await request(getAppHelper()).get(`/table-de-repartition/toRegion/${requestParams.cohort}/${requestParams.region}`);

      // Assert that the response status code is 200 and the response body contains the expected data
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        data: [
          {
            _id: mockTableDeRepartition._id,
            cohort: mockTableDeRepartition.cohort,
            data: mockTableDeRepartition.data,
            region: mockTableDeRepartition.region,
          },
        ],
      });

      // Restore the original implementation of the tableDeRepartition.find() method
      jest.restoreAllMocks();
    });
    it("should return 500 when an error occurs", async () => {
      // Create a mock request parameters with valid values
      const requestParams = {
        cohort: "Février 2023 - C",
        region: "Paris",
      };

      // Mock the tableDeRepartition.find() method to throw an error
      jest.spyOn(TableDeRepartitionModel, "find").mockRejectedValueOnce(new Error("Mock server error"));

      // Send a GET request to the /table-de-repartition/toRegion/:cohort/:region endpoint with the mock request parameters and user object
      const res = await request(getAppHelper()).get(`/table-de-repartition/toRegion/${requestParams.cohort}/${requestParams.region}`);

      // Assert that the response status code is 500 and the response body contains the expected error code
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        ok: false,
        code: "SERVER_ERROR",
      });

      // Restore the original implementation of the tableDeRepartition.find() method
      jest.restoreAllMocks();
    });
  });
  describe("GET /fromRegion/:cohort/:region", () => {
    it("should return 200 and data when request is valid and user can view tableDeRepartition", async () => {
      // Define a mock table de répartition object
      const mockTableDeRepartition = {
        _id: "mockId",
        cohort: "Février 2023 - C",
        region: "Paris",
        data: [
          {
            trainNumber: "1234",
            departureTime: "08:00",
            arrivalTime: "10:00",
          },
          {
            trainNumber: "5678",
            departureTime: "10:00",
            arrivalTime: "12:00",
          },
        ],
      };

      // Create a mock request parameters with valid values
      const requestParams = {
        cohort: "Février 2023 - C",
        region: "Paris",
      };

      // Mock the tableDeRepartition.find() method to return a mock table de répartition
      jest.spyOn(TableDeRepartitionModel, "find").mockResolvedValueOnce([mockTableDeRepartition]);

      // Send a GET request to the /table-de-repartition/toRegion/:cohort/:region endpoint with the mock request parameters and user object
      const res = await request(getAppHelper()).get(`/table-de-repartition/fromRegion/${requestParams.cohort}/${requestParams.region}`);

      // Assert that the response status code is 200 and the response body contains the expected data
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        data: [
          {
            _id: mockTableDeRepartition._id,
            cohort: mockTableDeRepartition.cohort,
            data: mockTableDeRepartition.data,
            region: mockTableDeRepartition.region,
          },
        ],
      });

      // Restore the original implementation of the tableDeRepartition.find() method
      jest.restoreAllMocks();
    });
    it("should return 500 when an error occurs", async () => {
      // Create a mock request parameters with valid values
      const requestParams = {
        cohort: "Février 2023 - C",
        region: "Paris",
      };

      // Mock the tableDeRepartition.find() method to throw an error
      jest.spyOn(TableDeRepartitionModel, "find").mockRejectedValueOnce(new Error("Mock server error"));

      // Send a GET request to the /table-de-repartition/toRegion/:cohort/:region endpoint with the mock request parameters and user object
      const res = await request(getAppHelper()).get(`/table-de-repartition/fromRegion/${requestParams.cohort}/${requestParams.region}`);

      // Assert that the response status code is 500 and the response body contains the expected error code
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        ok: false,
        code: "SERVER_ERROR",
      });

      // Restore the original implementation of the tableDeRepartition.find() method
      jest.restoreAllMocks();
    });
  });
  describe("POST /delete/department", () => {
    it("should return 200 when tableDeRepartition department is deleted successfully", async () => {
      // Create a new referent with permission to edit tableDeRepartition department
      const referent = await createReferentHelper(getNewReferentFixture());
      referent.permissions = ["editTableDeRepartitionDepartment"];
      await referent.save();

      // Create a new tableDeRepartition with a department
      const tableDeRepartition = await TableDeRepartitionModel.create({
        cohort: "Février 2023 - C",
        fromRegion: "Paris14621",
        toRegion: "HOH2136",
        fromDepartment: "Department1",
        toDepartment: "Department2",
      });

      // Send a POST request to the route with the valid parameters and authorization token
      const res = await request(getAppHelper()).post("/table-de-repartition/delete/department").send({
        cohort: "Février 2023 - C",
        fromRegion: "Paris14621",
        toRegion: "HOH2136",
        fromDepartment: "Department1",
        toDepartment: "Department2",
      });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      // Clean up by deleting the created referent and tableDeRepartition
      await deleteReferentByIdHelper(referent._id);
      await tableDeRepartition.delete();
    });

    it("should return 400 when request body is invalid", async () => {
      const res = await request(getAppHelper()).post("/table-de-repartition/delete/department").send({
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
      const res = await request(getAppHelper()).post("/table-de-repartition/delete/department").send({
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
});
