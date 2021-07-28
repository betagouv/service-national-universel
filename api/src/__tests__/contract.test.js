require("dotenv").config({ path: "./.env-testing" });

const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewContractFixture = require("./fixtures/contract");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Structure", () => {
  describe("POST /contract", () => {
    it("should create contract", async () => {
      const contract = getNewContractFixture();
      const res = await request(getAppHelper()).post("/contract").send(contract);
      expect(res.status).toBe(200);
    });
  });
});
