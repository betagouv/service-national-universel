require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper } = require("./helpers/young");
const { YOUNG_SITUATIONS, YOUNG_STATUS } = require("../utils");
jest.setTimeout(10_000);
beforeAll(dbConnect);
afterAll(dbClose);

describe("Young", () => {
  describe("PUT /young/inscription/profile", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put("/young/inscription/profile").send(body);
      updatedYoung = response.body.data;
      passport.user = previous;

      return { young, updatedYoung, response };
    }
    it("Should update Young profil with statut code 200", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email.toLowerCase();
      const { updatedYoung, response } = await selfUpdateYoung({
        email: email,
        firstName: "foo",
        lastName: "bar",
        birthdateAt: fixture.birthdateAt,
        birthCountry: fixture.birthCountry,
        birthCity: fixture.birthCity,
        birthCityZip: fixture.birthCityZip,
      });
      expect(response.statusCode).toBe(200);
      expect(updatedYoung.email).toEqual(email);
      expect(updatedYoung.firstName).toEqual("Foo");
      expect(updatedYoung.lastName).toEqual("BAR");
      expect(updatedYoung.birthdateAt).toEqual(fixture.birthdateAt);
      expect(updatedYoung.birthCountry).toEqual(fixture.birthCountry);
      expect(updatedYoung.birthCity).toEqual(fixture.birthCity);
      expect(updatedYoung.birthCityZip).toEqual(fixture.birthCityZip);
    });
    it("should return 400 when parameters invalid", async () => {
      const fixture = getNewYoungFixture();
      const { response } = await selfUpdateYoung({
        firstName: "foo",
        lastName: "bar",
        birthdateAt: fixture.birthdateAt,
        birthCountry: fixture.birthCountry,
        birthCity: fixture.birthCity,
        birthCityZip: fixture.birthCityZip,
      });
      expect(response.statusCode).toBe(400);
    });
    it("should return 409 if user don't have right to update", async () => {
      const me = await createYoungHelper(getNewYoungFixture());
      const they = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = they;
      const res = await request(getAppHelper()).put(`/young/inscription/profile`).send({
        email: me.email,
        firstName: "foo",
        lastName: "bar",
        birthdateAt: me.birthdateAt,
        birthCountry: me.birthCountry,
        birthCity: me.birthCity,
        birthCityZip: me.birthCityZip,
      });
      expect(res.statusCode).toEqual(409);
      passport.user = previous;
    });
    it("should return 404 if user don't exist", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email.toLowerCase();
      const response = await request(getAppHelper()).put("/young/inscription/profile").send({
        email: email,
        firstName: "foo",
        lastName: "bar",
        birthdateAt: fixture.birthdateAt,
        birthCountry: fixture.birthCountry,
        birthCity: fixture.birthCity,
        birthCityZip: fixture.birthCityZip,
      });
      expect(response.statusCode).toBe(404);
    });
  });
  describe("PUT /young/inscription/coordonnee", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      let response = await request(getAppHelper()).put("/young/inscription/coordonnee").send(body);
      updatedYoung = response.body.data;
      passport.user = previous;

      return response;
    }
    function getBasicFixture() {
      const fixture = getNewYoungFixture();
      return {
        gender: "female",
        phone: fixture.phone,
        country: fixture.country,
        city: fixture.city,
        zip: fixture.zip,
        address: "Une adresse qualitative",
        location: fixture.location,
        department: fixture.department,
        region: fixture.region,
        cityCode: fixture.cityCode,
        academy: fixture.academy,
        addressVerified: "true",
      };
    }
    function getForeignFixture() {
      const fixture = getNewYoungFixture();
      return {
        hostLastName: fixture.hostLastName,
        hostFirstName: fixture.hostFirstName,
        hostRelationship: fixture.hostRelationship,
        foreignCountry: fixture.foreignCountry,
        foreignCity: fixture.foreignCity,
        foreignZip: fixture.foreignZip,
        foreignAddress: fixture.foreignAddress,
      };
    }
    function getSchoolFixture(schooled, country) {
      const fixture = getNewYoungFixture();
      if (schooled) {
        if (country === "France") {
          return {
            schoolCountry: country,
            schoolName: fixture.schoolName,
            schoolCity: fixture.schoolCity,
            schoolId: fixture.schoolId,
            schoolDepartment: fixture.schoolDepartment,
            grade: "3eme",
          };
        } else {
          return {
            schoolCountry: country,
            schoolName: fixture.schoolName,
            grade: "3eme",
          };
        }
      }
    }
    it("Should update Young coordonnee with statut code 200", async () => {
      const base = getBasicFixture();
      const foreign = getForeignFixture();

      const response = await selfUpdateYoung({
        ...base,
        livesInFrance: "true",
        schooled: "true",
        ...getSchoolFixture(true, "France"),
        situation: YOUNG_SITUATIONS.GENERAL_SCHOOL,
      });
      expect(response.statusCode).toBe(200);

      const response2 = await selfUpdateYoung({
        ...base,
        livesInFrance: "false",
        ...foreign,
        schooled: "true",
        ...getSchoolFixture(true, "France"),
        situation: YOUNG_SITUATIONS.GENERAL_SCHOOL,
      });
      expect(response2.statusCode).toBe(200);

      const response3 = await selfUpdateYoung({
        ...base,
        livesInFrance: "true",
        schooled: "true",
        ...getSchoolFixture(true, "Maroc"),
        situation: YOUNG_SITUATIONS.GENERAL_SCHOOL,
      });
      expect(response3.statusCode).toBe(200);

      const response4 = await selfUpdateYoung({
        ...base,
        livesInFrance: "true",
        schooled: "false",
        employed: "true",
        situation: YOUNG_SITUATIONS.EMPLOYEE,
      });
      expect(response4.statusCode).toBe(200);

      const response5 = await selfUpdateYoung({
        ...base,
        livesInFrance: "true",
        schooled: "false",
        employed: "false",
        situation: YOUNG_SITUATIONS.POLE_EMPLOI,
      });
      expect(response5.statusCode).toBe(200);
    });
    it("should return 400 when parameters invalid", async () => {
      const base = getBasicFixture();
      const foreign = getForeignFixture();

      const response = await selfUpdateYoung({
        ...base,
        livesInFrance: "true",
        ...foreign,
        schooled: "true",
        ...getSchoolFixture(true, "France"),
        situation: YOUNG_SITUATIONS.GENERAL_SCHOOL,
      });
      expect(response.statusCode).toBe(400);

      const response1 = await selfUpdateYoung({
        ...base,
        livesInFrance: "true",
        schooled: "false",
        ...getSchoolFixture(true, "France"),
        situation: YOUNG_SITUATIONS.GENERAL_SCHOOL,
      });
      expect(response1.statusCode).toBe(400);

      const response3 = await selfUpdateYoung({
        ...base,
        livesInFrance: "true",
        schooled: "false",
        employed: "false",
        situation: YOUNG_SITUATIONS.EMPLOYEE,
      });
      expect(response3.statusCode).toBe(400);
    });
    it("should return 404 if user don't exist", async () => {
      const base = getBasicFixture();
      const foreign = getForeignFixture();

      const response = await request(getAppHelper())
        .put("/young/inscription/coordonnee")
        .send({
          ...base,
          livesInFrance: "true",
          schooled: "true",
          ...getSchoolFixture(true, "France"),
          situation: YOUNG_SITUATIONS.GENERAL_SCHOOL,
        });
      expect(response.statusCode).toBe(404);
    });
  });
  describe("PUT /young/inscription/availability", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put("/young/inscription/availability").send(body);
      updatedYoung = response.body.data;
      passport.user = previous;

      return { young, updatedYoung, response };
    }
    it("Should update Young cochort with statut code 200", async () => {
      let date = new Date();
      date.setFullYear(date.getFullYear() - 16);

      const { response, updatedYoung } = await selfUpdateYoung(
        {
          cohort: "Juillet 2022",
        },
        {
          birthdateAt: date,
        },
      );
      expect(response.statusCode).toBe(200);
      expect(updatedYoung.cohort).toEqual("Juillet 2022");
    });
    it("should return 400 when parameters invalid", async () => {
      let date = new Date();
      date.setFullYear(date.getFullYear() - 16);

      const { response } = await selfUpdateYoung(
        {
          cohort: "coucou",
        },
        {
          birthdateAt: date,
        },
      );
      expect(response.statusCode).toBe(400);
    });
    it("should return 404 if user don't exist", async () => {
      const response = await request(getAppHelper()).put("/young/inscription/availability").send({
        cohort: "coucou",
      });
      expect(response.statusCode).toBe(404);
    });
  });
  describe("PUT /young/inscription/availability/reset", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put("/young/inscription/availability").send(body);
      updatedYoung = response.body.data;
      passport.user = previous;

      return { young, updatedYoung, response };
    }
    it("Should update Young cochort with statut code 200", async () => {
      let date = new Date();
      date.setFullYear(date.getFullYear() - 16);

      const { response, updatedYoung } = await selfUpdateYoung(
        {
          cohort: "Juillet 2022",
        },
        {
          birthdateAt: date,
        },
      );
      expect(response.statusCode).toBe(200);
      expect(updatedYoung.cohort).toEqual("Juillet 2022");
    });
    it("should return 400 when parameters invalid", async () => {
      let date = new Date();
      date.setFullYear(date.getFullYear() - 16);

      const { response } = await selfUpdateYoung(
        {
          cohort: "coucou",
        },
        {
          birthdateAt: date,
        },
      );
      expect(response.statusCode).toBe(400);
    });
    it("should return 404 if user don't exist", async () => {
      const response = await request(getAppHelper()).put("/young/inscription/availability").send({
        cohort: "coucou",
      });
      expect(response.statusCode).toBe(404);
    });
  });
  describe("PUT /young/inscription/availability/reset", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put("/young/inscription/availability/reset").send(body);
      updatedYoung = response.body.data;
      passport.user = previous;

      return { young, updatedYoung, response };
    }
    it("Should reset Young cochort with statut code 200", async () => {
      let date = new Date();
      date.setFullYear(date.getFullYear() - 16);

      const { response, updatedYoung } = await selfUpdateYoung(
        {},
        {
          birthdateAt: date,
        },
      );
      expect(response.statusCode).toBe(200);
      expect(updatedYoung.cohort).toEqual("2022");
    });
    it("should return 404 if user don't exist", async () => {
      const response = await request(getAppHelper()).put("/young/inscription/availability/reset");
      expect(response.statusCode).toBe(404);
    });
  });
  describe("PUT /young/inscription/availability/notEligible", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put("/young/inscription/availability/notEligible").send(body);
      updatedYoung = response.body.data;
      passport.user = previous;

      return { young, updatedYoung, response };
    }
    it("Should set Young status to notEligible with statut code 200", async () => {
      let date = new Date();
      date.setFullYear(date.getFullYear() - 10);

      const { response, updatedYoung } = await selfUpdateYoung(
        {},
        {
          birthdateAt: date,
          cohort: "2022",
        },
      );
      expect(response.statusCode).toBe(200);
      expect(updatedYoung.status).toEqual(YOUNG_STATUS.NOT_ELIGIBLE);
    });
    it("Should return 403 if user is eligible", async () => {
      let date = new Date();
      date.setFullYear(date.getFullYear() - 16);

      const { response } = await selfUpdateYoung(
        {},
        {
          birthdateAt: date,
        },
      );
      expect(response.statusCode).toBe(403);
    });
    it("should return 404 if user don't exist", async () => {
      const response = await request(getAppHelper()).put("/young/inscription/availability/notEligible");
      expect(response.statusCode).toBe(404);
    });
  });
});
