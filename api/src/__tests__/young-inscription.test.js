require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const { STEPS2023 } = require("../utils");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

describe("Young", () => {
  describe("PUT /young/inscription2023/consentement", () => {
    it("should return return 400 when no body is sent", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/consentement");
      expect(res.status).toBe(400);
    });

    it("should return return 400 when the body sent is invalid", async () => {
      const consentementObj = {
        consentment1: "invalid value",
        consentment2: ["another", "invalid", "value"],
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/consentement").send(consentementObj);
      expect(res.status).toBe(400);

      res = await request(getAppHelper())
        .put("/young/inscription2023/consentement")
        .send({ ...consentementObj, consentment1: true, consentment2: false });
      expect(res.status).toBe(400);
    });

    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};

      const consentementObj = {
        consentment1: true,
        consentment2: true,
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/consentement").send(consentementObj);
      expect(res.status).toBe(404);

      passport.user._id = null;
      res = await request(getAppHelper()).put("/young/inscription2023/consentement").send(consentementObj);
      expect(res.status).toBe(404);
    });

    // This case is not tested because the 403 status is never sent
    // it("Should return 403 if update is not authorized", async () => {});

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      const consentementObj = {
        consentment1: true,
        consentment2: true,
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/consentement").send(consentementObj);
      const responseData = res.body.data;
      const updatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);
      expect(responseData).toMatchObject({ acceptCGU: "true", consentment: "true", inscriptionStep2023: STEPS2023.REPRESENTANTS });
      expect(updatedYoung).toMatchObject({ acceptCGU: "true", consentment: "true", inscriptionStep2023: STEPS2023.REPRESENTANTS });
    });
  });
});
