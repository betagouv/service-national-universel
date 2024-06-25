const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const { STEPS2023, YOUNG_STATUS, YOUNG_SITUATIONS } = require("../utils");
const { START_DATE_SESSION_PHASE1, COHORTS } = require("snu-lib");
const { fakerFR: faker } = require("@faker-js/faker");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

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
    // "Should return 403 if update is not authorized";

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

  describe("PUT /young/inscription2023/noneligible", () => {
    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};

      let res = await request(getAppHelper()).put("/young/inscription2023/noneligible");
      expect(res.status).toBe(404);

      passport.user._id = null;
      res = await request(getAppHelper()).put("/young/inscription2023/noneligible");
      expect(res.status).toBe(404);
    });
    it("Should return 200 otherwise", async () => {
      const user = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = user;
      let res = await request(getAppHelper()).put("/young/inscription2023/noneligible");
      const responseData = res.body.data;
      const updatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);
      expect(updatedYoung.status).toBe(YOUNG_STATUS.NOT_ELIGIBLE);
      expect(responseData.status).toBe(YOUNG_STATUS.NOT_ELIGIBLE);
    });
  });

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
        situation: YOUNG_SITUATIONS.GENERAL_SCHOOL,
        livesInFrance: "true",
        addressVerified: "true",
        coordinatesAccuracyLevel: "housenumber",
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

      const correctCoordonneeObj = {
        ...coordonneeObj,
        gender: "male",
        handicap: "false",
      };

      res = await request(getAppHelper()).put(`/young/inscription2023/coordinates/${typeUrlParam}`).send(correctCoordonneeObj);
      expect(res.status).toBe(200);
      const correctionResponseData = res.body.data;
      const correctionUpdatedYoung = await getYoungByIdHelper(passport.user._id);

      delete coordonneeObj.livesInFrance;
      delete coordonneeObj.moreInformation;
      delete correctCoordonneeObj.livesInFrance;
      delete correctCoordonneeObj.moreInformation;
      expect(nextUpdatedYoung).toMatchObject(coordonneeObj);
      expect(nextResponseData).toMatchObject(coordonneeObj);
      expect(correctionUpdatedYoung).toMatchObject(correctCoordonneeObj);
      expect(correctionResponseData).toMatchObject(correctCoordonneeObj);
    });
  });

  describe("PUT /young/inscription2023/consentement", () => {
    it("Should return 400 when no body is sent", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/consentement");
      expect(res.status).toBe(400);
    });

    it("Should return 400 when the body sent is invalid", async () => {
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
    // "Should return 403 if update is not authorized"

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

  describe("PUT /young/inscription2023/representants/:type", () => {
    it("Should return 400 when type is wrong in url params", async () => {
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

    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};

      const representantObj = {
        parent1Status: "mother",
        parent1FirstName: "Jane",
        parent1LastName: "Doe",
        parent1Email: "jane@doe.com",
        parent1Phone: "0600020305",
        parent1PhoneZone: "FRANCE",
        parent2: false,
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/representants/next").send(representantObj);
      expect(res.status).toBe(404);

      passport.user._id = null;
      res = await request(getAppHelper()).put("/young/inscription2023/representants/next").send(representantObj);
      expect(res.status).toBe(404);
    });

    // This case is not tested because the 403 status is never sent
    // "Should return 403 if update is not authorized"

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
        parent1PhoneZone: "FRANCE",
        parent2: false,
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/representants/next").send(representantObj);
      expect(res.status).toBe(200);
      const nextResponseData = res.body.data;
      const nextUpdatedYoung = await getYoungByIdHelper(passport.user._id);

      const correctRepresentantObj = {
        ...representantObj,
        parent1Phone: "0602050844",
        parent1Email: "jane.doe@snu.fr",
      };

      res = await request(getAppHelper()).put("/young/inscription2023/representants/correction").send(correctRepresentantObj);
      expect(res.status).toBe(200);
      const correctionResponseData = res.body.data;
      const correctionUpdatedYoung = await getYoungByIdHelper(passport.user._id);

      delete representantObj.parent2;
      delete correctRepresentantObj.parent2;
      expect(nextUpdatedYoung).toMatchObject({ ...representantObj, inscriptionStep2023: STEPS2023.DOCUMENTS });
      expect(nextResponseData).toMatchObject({ ...representantObj, inscriptionStep2023: STEPS2023.DOCUMENTS });
      expect(correctionUpdatedYoung).toMatchObject(correctRepresentantObj);
      expect(correctionResponseData).toMatchObject(correctRepresentantObj);
    });
  });

  describe("PUT /young/inscription2023/confirm", () => {
    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};
      let res = await request(getAppHelper()).put("/young/inscription2023/confirm");
      expect(res.status).toBe(404);
    });

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      let res = await request(getAppHelper()).put("/young/inscription2023/confirm");
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ informationAccuracy: "true", inscriptionStep2023: STEPS2023.WAITING_CONSENT });
    });
  });

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
      const passport = require("passport");
      passport.user = {};
      const cohortObj = {
        cohort: "Juillet 2023",
      };
      let res = await request(getAppHelper()).put("/young/inscription2023/changeCohort").set("x-user-timezone", -60).send(cohortObj);
      expect(res.status).toBe(404);
    });

    // This case is not tested because the 403 status is never sent
    // "Should return 403 if update is not authorized"

    it("Should return 409 if the cohort goal is reached or the cohort session is not found or full", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      const cohortObj = {
        cohort: "Juillet 2023",
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/changeCohort").set("x-user-timezone", -60).send(cohortObj);
      expect(res.status).toBe(409);
    });

    it.skip("Should return 200 otherwise", async () => {
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

  describe("PUT /young/inscription2023/documents/:type", () => {
    it("Should return 400 when type is wrong in url params", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/documents/something-wrong");
      expect(res.status).toBe(400);
    });

    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};
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

    it("Should return 200 otherwise using 'next' route param (cohort avenir)", async () => {
      const cniFile = {
        name: "CNI_TEST.pdf",
        uploadedAt: new Date().toISOString(),
        size: 150244,
        mimetype: "application/pdf",
        category: "pdf",
        expirationDate: new Date().toISOString(),
      };

      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture({ cohort: COHORTS.AVENIR, files: { cniFiles: [cniFile] } }));
      passport.user = user;

      const documentObj = {
        date: new Date(),
      };

      const CNIFileNotValidOnStart = documentObj.date < START_DATE_SESSION_PHASE1[user.cohort];

      let res = await request(getAppHelper()).put("/young/inscription2023/documents/next").send(documentObj);
      const nextResponseData = res.body.data;
      const nextUpdatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);
      expect(nextResponseData).toMatchObject({ latestCNIFileExpirationDate: documentObj.date.toISOString() });
      expect(nextUpdatedYoung).toMatchObject({ latestCNIFileExpirationDate: documentObj.date });
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
    // "Should return 403 using 'correction' route param if update is not authorized";

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

  describe("PUT /young/inscription2023/relance", () => {
    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};
      let res = await request(getAppHelper()).put("/young/inscription2023/relance");
      expect(res.status).toBe(404);
    });

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;
      let res = await request(getAppHelper()).put("/young/inscription2023/relance");
      expect(res.status).toBe(200);
    });
  });

  describe("PUT /young/inscription2023/done", () => {
    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};
      let res = await request(getAppHelper()).put("/young/inscription2023/done");
      expect(res.status).toBe(404);
    });

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;
      let res = await request(getAppHelper()).put("/young/inscription2023/done");
      const responseData = res.body.data;
      const updatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);
      expect(responseData).toMatchObject({ inscriptionStep2023: STEPS2023.DONE });
      expect(updatedYoung).toMatchObject({ inscriptionStep2023: STEPS2023.DONE });
    });
  });

  describe("PUT /young/inscription2023/goToInscriptionAgain", () => {
    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};
      let res = await request(getAppHelper()).put("/young/inscription2023/goToInscriptionAgain");
      expect(res.status).toBe(404);
    });

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;
      let res = await request(getAppHelper()).put("/young/inscription2023/goToInscriptionAgain");
      const responseData = res.body.data;
      const updatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);
      expect(responseData).toMatchObject({ inscriptionStep2023: STEPS2023.CONFIRM });
      expect(updatedYoung).toMatchObject({ inscriptionStep2023: STEPS2023.CONFIRM });
    });
  });

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
      const passport = require("passport");
      passport.user = {};

      const profilObj = {
        firstName: "John",
        lastName: "DOE",
        email: "john@doe.com",
        phone: "600000000",
        phoneZone: "FRANCE",
      };
      let res = await request(getAppHelper()).put("/young/inscription2023/profil").send(profilObj);
      expect(res.status).toBe(404);
    });

    // This case is not tested because the 403 status is never sent
    // "Should return 403 using 'correction' route param if update is not authorized"

    it("Should return 200 otherwise", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;

      const profilObj = {
        firstName: faker.person.firstName().toLowerCase(),
        lastName: faker.person.lastName().toUpperCase(),
        email: faker.internet.email().toLowerCase(),
        phone: "600000000",
        phoneZone: "FRANCE",
      };

      let res = await request(getAppHelper()).put("/young/inscription2023/profil").send(profilObj);
      const responseData = res.body.data;
      const updatedYoung = await getYoungByIdHelper(passport.user._id);

      expect(res.status).toBe(200);
      expect(responseData).toMatchObject({ ...profilObj, firstName: profilObj.firstName.charAt(0).toUpperCase() + profilObj.firstName.slice(1) });
      expect(updatedYoung).toMatchObject({ ...profilObj, firstName: profilObj.firstName.charAt(0).toUpperCase() + profilObj.firstName.slice(1) });
    });
  });
});
