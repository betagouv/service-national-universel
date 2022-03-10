require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper } = require("./helpers/young");
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
    it("Should update Young with statut code 200", async () => {
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
  describe("PUT /young/inscription/particulieres", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      let response = await request(getAppHelper()).put("/young/inscription/particulieres").send(body);
      updatedYoung = response.body.data;
      passport.user = previous;

      return response;
    }
    it("Should update Young particulieres with statut code 200", async () => {
      let response = await selfUpdateYoung({
        handicap: "false",
        ppsBeneficiary: "false",
        paiBeneficiary: "false",
        allergies: "false",
        highSkilledActivity: "false",
        moreInformation: "false",
      });
      expect(response.statusCode).toBe(200);

      response = await selfUpdateYoung({
        handicap: "true",
        ppsBeneficiary: "false",
        paiBeneficiary: "false",
        allergies: "false",
        highSkilledActivity: "false",
        moreInformation: "true",
        specificAmenagment: "true",
        reducedMobilityAccess: "true",
        handicapInSameDepartment: "false",
      });
      expect(response.statusCode).toBe(200);

      response = await selfUpdateYoung({
        handicap: "true",
        ppsBeneficiary: "false",
        paiBeneficiary: "false",
        allergies: "false",
        highSkilledActivity: "true",
        moreInformation: "true",
        specificAmenagment: "true",
        reducedMobilityAccess: "true",
        handicapInSameDepartment: "false",
        highSkilledActivityInSameDepartment: "false",
      });
      expect(response.statusCode).toBe(200);
    });
    it("should return 400 when parameters invalid", async () => {
      response = await selfUpdateYoung({
        handicap: "false",
      });
      expect(response.statusCode).toBe(400);

      response = await selfUpdateYoung({
        handicap: "Bad parameter",
        ppsBeneficiary: "false",
        paiBeneficiary: "false",
        allergies: "false",
        highSkilledActivity: "true",
        moreInformation: "true",
        specificAmenagment: "true",
        reducedMobilityAccess: "true",
        handicapInSameDepartment: "false",
        highSkilledActivityInSameDepartment: "false",
      });
      expect(response.statusCode).toBe(400);

      response = await selfUpdateYoung({
        handicap: "false",
        ppsBeneficiary: "false",
        paiBeneficiary: "false",
        allergies: "false",
        highSkilledActivity: "true",

        moreInformation: "true", //error

        specificAmenagment: "true",
        reducedMobilityAccess: "true",
        handicapInSameDepartment: "false",
        highSkilledActivityInSameDepartment: "false",
      });
      expect(response.statusCode).toBe(400);

      response = await selfUpdateYoung({
        handicap: "true",
        ppsBeneficiary: "true",
        paiBeneficiary: "true",
        allergies: "false",
        highSkilledActivity: "true",

        moreInformation: "false", //error

        specificAmenagment: "true",
        reducedMobilityAccess: "true",
        handicapInSameDepartment: "false",
        highSkilledActivityInSameDepartment: "false",
      });
      expect(response.statusCode).toBe(400);
    });
    it("should return 404 if user don't exist", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email.toLowerCase();
      const response = await request(getAppHelper()).put("/young/inscription/particulieres").send({
        handicap: "true",
        ppsBeneficiary: "false",
        paiBeneficiary: "false",
        allergies: "false",
        highSkilledActivity: "true",
        moreInformation: "true",
        specificAmenagment: "true",
        reducedMobilityAccess: "true",
        handicapInSameDepartment: "false",
        highSkilledActivityInSameDepartment: "false",
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
