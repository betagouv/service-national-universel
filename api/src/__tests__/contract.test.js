require("dotenv").config({ path: "./.env-testing" });
const fetch = require("node-fetch");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewReferentFixture = require("./fixtures/referent");
const { createReferentHelper, getReferentByIdHelper } = require("./helpers/referent");
const { ROLES } = require("snu-lib/roles");

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
      const structure = getNewStructureFixture();
      const res = await request(getAppHelper()).post("/structure").send(structure);
      expect(res.status).toBe(200);
    });
  });
});
