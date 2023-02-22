require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const { STEPS2023, YOUNG_STATUS } = require("../utils");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

describe("Young", () => {
  describe("PUT /young/inscription2023/changeCohort", () => {
    it("Should return 400 when no body is sent", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/changeCohort");
      expect(res.status).toBe(400);
    });

    it("Should return 400 when the body sent is invalid", async () => {
      const cohortObj = {
        cohort: "invalid value",
      };
      let res = await request(getAppHelper()).put("/young/inscription2023/changeCohort").send(cohortObj);
      expect(res.status).toBe(400);
    });

    it("Should return 404 when young is not found", async () => {
      const cohortObj = {
        cohort: "Juillet 2023",
      };
      let res = await request(getAppHelper()).put("/young/inscription2023/changeCohort").send(cohortObj);
      expect(res.status).toBe(404);
    });

    // This case is not tested because the 403 status is never sent
    // it("Should return 403 if update is not authorized", async () => {});

    it("Should return 409 if the cohort goal is reached or the cohort session is not found or full", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      const cohortObj = {
        cohort: "Juillet 2023",
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/changeCohort").send(cohortObj);
      expect(res.status).toBe(409);
    });

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(
        getNewYoungFixture({
          cohort: "Février 2023 - C",
          grade: "3eme",
          birthdateAt: new Date("2007-09-25").toISOString(),
          status: YOUNG_STATUS.WAITING_CORRECTION,
          region: "Île-de-France",
          schoolRegion: "Île-de-France",
          zip: "75008",
        }),
      );
      passport.user = user;

      const cohortObj = {
        cohort: "Juillet 2023",
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/changeCohort").send(cohortObj);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ cohort: "Juillet 2023" });
    });
  });
});
