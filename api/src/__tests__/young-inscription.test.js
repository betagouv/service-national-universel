require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const { YOUNG_SITUATIONS } = require("../utils");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

describe("Young", () => {
  describe("PUT /young/inscription2023/coordinates/:type", () => {
    it("should return return 400 when type is wrong in url params", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/coordinates/something-wrong");
      expect(res.status).toBe(400);
    });
    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};

      let res = await request(getAppHelper()).put("/young/inscription2023/coordinates/next");
      expect(res.status).toBe(404);

      passport.user._id = null;
      res = await request(getAppHelper()).put("/young/inscription2023/coordinates/next");
      expect(res.status).toBe(404);
    });

    it("Should return 400 when no body is sent when type url param is 'next' or 'correction'", async () => {
      let typeUrlParam = "next";

      const user = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = user;

      let res = await request(getAppHelper()).put(`/young/inscription2023/coordinates/${typeUrlParam}`);
      expect(res.status).toBe(400);

      typeUrlParam = "correction";
      res = await request(getAppHelper()).put(`/young/inscription2023/coordinates/${typeUrlParam}`);
      expect(res.status).toBe(400);
    });

    it("Should return 200 when no body is sent when type url param is 'save'", async () => {
      const typeUrlParam = "save";

      let res = await request(getAppHelper()).put(`/young/inscription2023/coordinates/${typeUrlParam}`);
      expect(res.status).toBe(200);
    });

    it("Should return 400 when body sent is invalid when type url param is 'next' or 'correction'", async () => {
      let typeUrlParam = "next";

      const coordonneeObj = {
        gender: "female",
        birthCountry: "France",
        birthCity: "Paris",
        birthCityZip: "75008",
        phone: "0600010203",
      };

      let res = await request(getAppHelper()).put(`/young/inscription2023/coordinates/${typeUrlParam}`).send(coordonneeObj);
      expect(res.status).toBe(400);

      typeUrlParam = "correction";
      res = await request(getAppHelper()).put(`/young/inscription2023/coordinates/${typeUrlParam}`).send(coordonneeObj);
      expect(res.status).toBe(400);
    });

    it("Should return 200 when body sent is valid when type url param is 'next' or 'correction'", async () => {
      const user = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = user;

      const coordonneeObj = {
        gender: "female",
        birthCountry: "France",
        birthCity: "Paris",
        birthCityZip: "75008",
        phone: "0600010203",
        situation: YOUNG_SITUATIONS.GENERAL_SCHOOL,
        livesInFrance: "true",
        addressVerified: "true",
        country: "France",
        city: "Paris",
        zip: "75008",
        address: "1 Avenue des Champs-Élysées",
        location: {
          lon: 0,
          lat: 0,
        },
        department: "Paris",
        region: "Ile de France",
        cityCode: null,
        handicap: "true",
        ppsBeneficiary: "false",
        paiBeneficiary: "false",
        allergies: "true",
        moreInformation: "false",
      };

      let typeUrlParam = "next";
      let res = await request(getAppHelper()).put(`/young/inscription2023/coordinates/${typeUrlParam}`).send(coordonneeObj);
      expect(res.status).toBe(200);
      const nextResponseData = res.body.data;
      const nextUpdatedYoung = await getYoungByIdHelper(passport.user._id);

      typeUrlParam = "correction";
      res = await request(getAppHelper()).put(`/young/inscription2023/coordinates/${typeUrlParam}`).send(coordonneeObj);
      expect(res.status).toBe(200);
      const correctionResponseData = res.body.data;
      const correctionUpdatedYoung = await getYoungByIdHelper(passport.user._id);

      delete coordonneeObj.livesInFrance;
      delete coordonneeObj.moreInformation;
      expect(nextUpdatedYoung).toMatchObject(coordonneeObj);
      expect(nextResponseData).toMatchObject(coordonneeObj);
      expect(correctionUpdatedYoung).toMatchObject(coordonneeObj);
      expect(correctionResponseData).toMatchObject(coordonneeObj);
    });
  });
});
