require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const { STEPS2023, YOUNG_STATUS } = require("../utils");
const { START_DATE_SESSION_PHASE1 } = require("snu-lib");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

describe("Young", () => {
  describe("PUT /young/inscription2023/documents/:type", () => {
    it("Should return 400 when type is wrong in url params", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/documents/something-wrong");
      expect(res.status).toBe(400);
    });

    it("Should return 404 when young is not found", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/documents/next");
      expect(res.status).toBe(404);
    });

    it("Should return 409 when young has no provided cni file using 'next' route param", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      let res = await request(getAppHelper()).put("/young/inscription2023/documents/next");
      expect(res.status).toBe(409);
    });

    it("Should return 400 when no body is provided using 'next' route param", async () => {
      const cniFile = {
        name: "CNI_TEST.pdf",
        uploadedAt: new Date().toISOString(),
        size: 150244,
        mimetype: "application/pdf",
        category: "cniNew",
        expirationDate: new Date().toISOString(),
      };

      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture({ files: { cniFiles: [cniFile] } }));
      passport.user = user;

      let res = await request(getAppHelper()).put("/young/inscription2023/documents/next");
      expect(res.status).toBe(400);
    });

    it("Should return 400 when the body is invalid using 'next' route param", async () => {
      const documentObj = {
        date: "invalid value",
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/documents/next").send(documentObj);
      expect(res.status).toBe(400);
    });

    it("Should return 200 otherwise using 'next' route param", async () => {
      const cniFile = {
        name: "CNI_TEST.pdf",
        uploadedAt: new Date().toISOString(),
        size: 150244,
        mimetype: "application/pdf",
        category: "pdf",
        expirationDate: new Date().toISOString(),
      };

      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture({ files: { cniFiles: [cniFile] } }));
      passport.user = user;

      const documentObj = {
        date: new Date(),
      };

      const CNIFileNotValidOnStart = documentObj.date < START_DATE_SESSION_PHASE1[user.cohort];

      let res = await request(getAppHelper()).put("/young/inscription2023/documents/next").send(documentObj);
      const nextResponseData = res.body.data;
      const nextUpdatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);
      expect(nextResponseData).toMatchObject({ CNIFileNotValidOnStart: CNIFileNotValidOnStart + "", latestCNIFileExpirationDate: documentObj.date.toISOString() });
      expect(nextUpdatedYoung).toMatchObject({ CNIFileNotValidOnStart: CNIFileNotValidOnStart + "", latestCNIFileExpirationDate: documentObj.date });
    });

    it("Should return 400 when no body is provided using 'correction' route param", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      let res = await request(getAppHelper()).put("/young/inscription2023/documents/correction");
      expect(res.status).toBe(400);
    });

    it("Should return 400 when body is invalid using 'correction' route param", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      const fileObj = {
        latestCNIFileExpirationDate: "invalid value",
        latestCNIFileCategory: "invalid value",
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/documents/correction").send(fileObj);
      expect(res.status).toBe(400);
    });

    // This case is not tested because the 403 status is never sent
    // it("Should return 403 using 'correction' route param if update is not authorized", async () => {});

    it("Should return 200 otherwise using 'correction' route param", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      const fileObj = {
        latestCNIFileExpirationDate: new Date(),
        latestCNIFileCategory: "cniNew",
      };

      const CNIFileNotValidOnStart = fileObj.latestCNIFileExpirationDate < START_DATE_SESSION_PHASE1[user.cohort];

      let res = await request(getAppHelper()).put("/young/inscription2023/documents/correction").send(fileObj);
      const correctionResponseData = res.body.data;
      const correctionUpdatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);
      expect(correctionResponseData).toMatchObject({ CNIFileNotValidOnStart: CNIFileNotValidOnStart + "" });
      expect(correctionUpdatedYoung).toMatchObject({ CNIFileNotValidOnStart: CNIFileNotValidOnStart + "" });
    });
  });
});
