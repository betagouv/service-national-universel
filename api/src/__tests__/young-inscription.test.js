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
  describe("PUT /young/inscription2023/representants/:type", () => {
    it("should return return 400 when type is wrong in url params", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/representants/something-wrong");
      expect(res.status).toBe(400);
    });

    it("Should return 400 when no body is sent when type url param is 'next' or 'correction'", async () => {
      const user = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = user;

      let typeUrlParam = "next";
      let res = await request(getAppHelper()).put(`/young/inscription2023/representants/${typeUrlParam}`);
      expect(res.status).toBe(400);

      typeUrlParam = "correction";
      res = await request(getAppHelper()).put(`/young/inscription2023/representants/${typeUrlParam}`);
      expect(res.status).toBe(400);
    });

    it("Should return 200 when no body is sent when type url param is 'save'", async () => {
      const typeUrlParam = "save";

      let res = await request(getAppHelper()).put(`/young/inscription2023/representants/${typeUrlParam}`);
      expect(res.status).toBe(200);
    });

    it("Should return 400 when body sent is invalid when type url param is 'next' or 'correction'", async () => {
      let typeUrlParam = "next";

      const representantObj = {
        parent1Status: "",
        parent1FirstName: "",
        parent1LastName: "",
        parent1Email: "",
        parent1Phone: "",
        parent2: null,
      };

      let res = await request(getAppHelper()).put(`/young/inscription2023/representants/${typeUrlParam}`).send(representantObj);
      expect(res.status).toBe(400);

      typeUrlParam = "correction";
      res = await request(getAppHelper()).put(`/young/inscription2023/representants/${typeUrlParam}`).send(representantObj);
      expect(res.status).toBe(400);
    });

    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};

      const representantObj = {
        parent1Status: "mother",
        parent1FirstName: "Jane",
        parent1LastName: "Doe",
        parent1Email: "jane@doe.com",
        parent1Phone: "0600020305",
        parent2: false,
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/representants/next").send(representantObj);
      expect(res.status).toBe(404);

      passport.user._id = null;
      res = await request(getAppHelper()).put("/young/inscription2023/representants/next").send(representantObj);
      expect(res.status).toBe(404);
    });

    // This case is not tested because the 403 status is never sent
    // it("Should return 403 if update is not authorized", async () => {});

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      const representantObj = {
        parent1Status: "mother",
        parent1FirstName: "Jane",
        parent1LastName: "Doe",
        parent1Email: "jane@doe.com",
        parent1Phone: "0600020305",
        parent2: false,
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/representants/next").send(representantObj);
      expect(res.status).toBe(200);
      const nextResponseData = res.body.data;
      const nextUpdatedYoung = await getYoungByIdHelper(passport.user._id);

      res = await request(getAppHelper()).put("/young/inscription2023/representants/next").send(representantObj);
      expect(res.status).toBe(200);
      const correctionResponseData = res.body.data;
      const correctionUpdatedYoung = await getYoungByIdHelper(passport.user._id);

      delete representantObj.parent2;
      expect(nextUpdatedYoung).toMatchObject({ ...representantObj, inscriptionStep2023: STEPS2023.DOCUMENTS });
      expect(nextResponseData).toMatchObject({ ...representantObj, inscriptionStep2023: STEPS2023.DOCUMENTS });
      expect(correctionUpdatedYoung).toMatchObject(representantObj);
      expect(correctionResponseData).toMatchObject(representantObj);
    });
  });
});
