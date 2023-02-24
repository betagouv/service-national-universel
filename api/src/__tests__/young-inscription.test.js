require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const { STEPS2023, YOUNG_STATUS } = require("../utils");
const { START_DATE_SESSION_PHASE1 } = require("snu-lib");
const { default: faker } = require("@faker-js/faker");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

describe("Young", () => {
  describe("PUT /young/inscription2023/profil", () => {
    it("Should return 400 if no body is provided", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/profil");
      expect(res.status).toBe(400);
    });

    it("Should return 400 if the body provided is invalid", async () => {
      const profilObj = {
        firstName: 0,
        lastName: ["invalid", "value"],
        email: "invalid email value",
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/profil").send(profilObj);
      expect(res.status).toBe(400);
    });

    it("Should return 404 when young is not found", async () => {
      const profilObj = {
        firstName: "John",
        lastName: "DOE",
        email: "john@doe.com",
      };
      let res = await request(getAppHelper()).put("/young/inscription2023/profil").send(profilObj);
      expect(res.status).toBe(404);
    });

    // This case is not tested because the 403 status is never sent
    // it("Should return 403 using 'correction' route param if update is not authorized", async () => {});

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      const profilObj = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName().toUpperCase(),
        email: faker.internet.email().toLowerCase(),
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/profil").send(profilObj);
      const responseData = res.body.data;
      const updatedYoung = await getYoungByIdHelper(passport.user._id);

      expect(res.status).toBe(200);
      expect(responseData).toMatchObject(profilObj);
      expect(updatedYoung).toMatchObject(profilObj);
    });
  });
});
