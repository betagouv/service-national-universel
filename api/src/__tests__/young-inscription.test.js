require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

describe("Young", () => {
  describe("PUT /young/inscription2023/eligibilite", () => {
    it("Should return 404 when young is not found", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/eligibilite");
      expect(res.status).toBe(404);

      const passport = require("passport");
      passport.user._id = null;
      res = await request(getAppHelper()).put("/young/inscription2023/eligibilite");
      expect(res.status).toBe(404);

      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;
    });

    it("Should return 400 when eliligibility scheme is invalid", async () => {
      const eligibilityObj = {
        birthdateAt: "",
        schooled: "",
        grade: "",
        schoolName: "",
      };
      let res = await request(getAppHelper()).put("/young/inscription2023/eligibilite");
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).put("/young/inscription2023/eligibilite").send({});
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).put("/young/inscription2023/eligibilite").send(eligibilityObj);
      expect(res.status).toBe(400);

      res = await request(getAppHelper())
        .put("/young/inscription2023/eligibilite")
        .send({ ...eligibilityObj, grade: "grade-test" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper())
        .put("/young/inscription2023/eligibilite")
        .send({
          ...eligibilityObj,
          grade: "3eme",
          schooled: "true",
          schoolName: "test-school",
          birthdateAt: "2006-09-25",
          zip: 75,
        });
      expect(res.status).toBe(400);
    });

    // This case is not tested because the 403 status is never sent
    // it("Should return 403 if update is not authorized", async () => {});

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      const eligibilityObj = {
        birthdateAt: "2006-09-25",
        schooled: "true",
        grade: "3eme",
        schoolName: "test-school",
        schoolType: "a-test-school-type",
        schoolAddress: "1 Avenue des Champs-Élysées",
        schoolZip: "75008",
        schoolCity: "Paris",
        schoolDepartment: "Paris",
        schoolRegion: "Ile de France",
        schoolCountry: "France",
        schoolId: "dummy-school-id",
        zip: "75008",
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/eligibilite").send(eligibilityObj);
      const responseData = res.body.data;
      const updatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);

      const formatedDate = new Date(eligibilityObj.birthdateAt);
      formatedDate.setUTCHours(11, 0, 0, 0);
      expect(updatedYoung).toMatchObject({ ...eligibilityObj, birthdateAt: formatedDate });
      expect(responseData).toMatchObject({ ...eligibilityObj, birthdateAt: formatedDate.toISOString() });
    });
  });
});
