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
      const updatedYoung = response.body.data;
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
  describe("PUT /young/inscription/coordonnee/next", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      let response = await request(getAppHelper()).put("/young/inscription/coordonnee/next").send(body);
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

      const response = await request(getAppHelper())
        .put("/young/inscription/coordonnee/next")
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
      const updatedYoung = response.body.data;
      passport.user = previous;

      return { young, updatedYoung, response };
    }
    // WARNING: this test is skipped since no session is available as of 2022-02-05
    it.skip("Should update Young cochort with statut code 200", async () => {
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
      const updatedYoung = response.body.data;
      passport.user = previous;

      return { young, updatedYoung, response };
    }
    // WARNING: this test is skipped since no session is available as of 2022-02-05
    it.skip("Should update Young cochort with statut code 200", async () => {
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
      const updatedYoung = response.body.data;
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
      const updatedYoung = response.body.data;
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
  describe("PUT /young/inscription/particulieres/next", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      let response = await request(getAppHelper()).put("/young/inscription/particulieres/next").send(body);
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
      let response = await selfUpdateYoung({
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
      const response = await request(getAppHelper()).put("/young/inscription/particulieres/next").send({
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
  describe("PUT /young/inscription/representant/next", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      let response = await request(getAppHelper()).put("/young/inscription/representant/next").send(body);
      passport.user = previous;

      return response;
    }
    function getParent1Fixture(ownCoordonnee, country) {
      const fixture = getNewYoungFixture();
      let data = {
        parent1Status: "mother",
        parent1FirstName: fixture.parent1FirstName,
        parent1LastName: fixture.parent1LastName,
        parent1Email: fixture.parent1Email,
        parent1Phone: fixture.parent1Phone,
        parent1FromFranceConnect: "true",
        parent1OwnAddress: ownCoordonnee,
      };
      if (ownCoordonnee === "true") {
        if (country === "France") {
          data = {
            ...data,
            parent1Country: "France",
            parent1City: fixture.parent1City,
            parent1Zip: fixture.parent1Zip,
            parent1Address: fixture.parent1Address,
            parent1Location: fixture.parent1Location,
            parent1Department: fixture.parent1Department,
            parent1Region: fixture.parent1Region,
            addressParent1Verified: "true",
          };
        } else {
          data = {
            ...data,
            parent1Country: country,
            parent1City: fixture.parent1City,
            parent1Zip: fixture.parent1Zip,
            parent1Address: fixture.parent1Address,
          };
        }
      }
      return data;
    }
    function getParent2Fixture(ownCoordonnee, country = "coucou") {
      const fixture = getNewYoungFixture();
      let data = {
        parent2Status: "mother",
        parent2FirstName: fixture.parent2FirstName,
        parent2LastName: fixture.parent2LastName,
        parent2Email: fixture.parent2Email,
        parent2Phone: fixture.parent2Phone,
        parent2FromFranceConnect: "true",
        parent2OwnAddress: ownCoordonnee,
      };
      if (ownCoordonnee === "true") {
        if (country === "France") {
          data = {
            ...data,
            parent2Country: "France",
            parent2City: fixture.parent2City,
            parent2Zip: fixture.parent2Zip,
            parent2Address: fixture.parent2Address,
            parent2Location: fixture.parent2Location,
            parent2Department: fixture.parent2Department,
            parent2Region: fixture.parent2Region,
            addressParent2Verified: "true",
          };
        } else {
          data = {
            ...data,
            parent2Country: country,
            parent2City: fixture.parent2City,
            parent2Zip: fixture.parent2Zip,
            parent2Address: fixture.parent2Address,
          };
        }
      }
      return data;
    }

    //Set country, ownAdress, asdressverif
    it("Should update Young representant with statut code 200", async () => {
      const response = await selfUpdateYoung({
        ...getParent1Fixture("false"),
        parent2: false,
        parent2FromFranceConnect: "false",
      });
      expect(response.statusCode).toBe(200);

      const response1 = await selfUpdateYoung({
        ...getParent1Fixture("true", "UK"),
        parent2: false,
        parent2FromFranceConnect: "false",
      });
      expect(response1.statusCode).toBe(200);

      const response2 = await selfUpdateYoung({
        ...getParent1Fixture("true", "France"),
        parent2: false,
        parent2FromFranceConnect: "false",
      });
      expect(response2.statusCode).toBe(200);

      const response3 = await selfUpdateYoung({
        ...getParent1Fixture("true", "France"),
        parent2: true,
        ...getParent2Fixture("false"),
      });
      expect(response3.statusCode).toBe(200);

      const response4 = await selfUpdateYoung({
        ...getParent1Fixture("true", "France"),
        parent2: true,
        ...getParent2Fixture("true", "UK"),
      });
      expect(response4.statusCode).toBe(200);

      const response5 = await selfUpdateYoung({
        ...getParent1Fixture("true", "France"),
        parent2: true,
        ...getParent2Fixture("true", "France"),
      });
      expect(response5.statusCode).toBe(200);
    });
    it("should return 400 when parameters invalid", async () => {
      const response = await selfUpdateYoung({});
      expect(response.statusCode).toBe(400);

      const response1 = await selfUpdateYoung({
        ...getParent1Fixture("false"),
        parent2: true,
        parent2FromFranceConnect: "false",
      });
      expect(response1.statusCode).toBe(400);

      const response2 = await selfUpdateYoung({
        ...getParent1Fixture("false"),
        parent2: false,
        ...getParent2Fixture("false"),
      });
      expect(response2.statusCode).toBe(400);

      const response3 = await selfUpdateYoung({
        ...getParent1Fixture("false", "France"),
        parent2: true,
        ...getParent2Fixture("true", "UK"),
      });
      expect(response3.statusCode).toBe(200);
    });
    it("should return 404 if user don't exist", async () => {
      const response = await request(getAppHelper())
        .put("/young/inscription/representant/next")
        .send({
          ...getParent1Fixture("false", "France"),
          parent2: true,
          ...getParent2Fixture("true", "UK"),
        });
      expect(response.statusCode).toBe(404);
    });
  });
  describe("PUT /young/inscription/representant-fromFranceConnect", () => {
    async function selfUpdateYoung(body = {}, id) {
      const young = await createYoungHelper(getNewYoungFixture({}));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put(`/young/inscription/representant-fromFranceConnect/${id}`).send(body);
      passport.user = previous;

      return response;
    }
    it("Should update Young reprensentant fields with statut code 200", async () => {
      const fixture = getNewYoungFixture();
      const response = await selfUpdateYoung(
        {
          parent1FirstName: fixture.parent1FirstName,
          parent1LastName: fixture.parent1LastName,
          parent1Email: fixture.parent1Email,
          parent1FromFranceConnect: "true",
        },
        "1",
      );
      expect(response.statusCode).toBe(200);

      const response1 = await selfUpdateYoung(
        {
          parent2FirstName: fixture.parent2FirstName,
          parent2LastName: fixture.parent2LastName,
          parent2Email: fixture.parent2Email,
          parent2FromFranceConnect: "true",
        },
        "2",
      );
      expect(response1.statusCode).toBe(200);
    });
    it("should return 400 when parameters invalid", async () => {
      const fixture = getNewYoungFixture();
      const response = await selfUpdateYoung(
        {
          parent1FirstName: "",
          parent1LastName: fixture.parent1LastName,
          parent1Email: fixture.parent1Email,
          parent1FromFranceConnect: "true",
        },
        1,
      );
      expect(response.statusCode).toBe(400);

      const response1 = await selfUpdateYoung(
        {
          parent1FirstName: fixture.parent1FirstName,
          parent1LastName: fixture.parent1LastName,
          parent1Email: fixture.parent1Email,
          parent1FromFranceConnect: "false",
        },
        1,
      );
      expect(response1.statusCode).toBe(400);

      const response2 = await selfUpdateYoung(
        {
          parent2FirstName: fixture.parent2FirstName,
          parent2LastName: fixture.parent2LastName,
        },
        2,
      );
      expect(response2.statusCode).toBe(400);

      const response3 = await selfUpdateYoung(
        {
          parent2FirstName: fixture.parent2FirstName,
          parent2LastName: fixture.parent2LastName,
          parent2Email: "coucou",
          parent2FromFranceConnect: "true",
        },
        2,
      );
      expect(response3.statusCode).toBe(400);
    });
    it("should return 404 if user don't exist", async () => {
      const fixture = getNewYoungFixture();
      const response = await request(getAppHelper()).put("/young/inscription/representant-fromFranceConnect/2").send({
        parent2FirstName: fixture.parent2FirstName,
        parent2LastName: fixture.parent2LastName,
        parent2Email: fixture.parent2Email,
        parent2FromFranceConnect: "true",
      });
      expect(response.statusCode).toBe(404);

      const response2 = await request(getAppHelper()).put("/young/inscription/representant-fromFranceConnect/1").send({
        parent1FirstName: fixture.parent1FirstName,
        parent1LastName: fixture.parent1LastName,
        parent1Email: fixture.parent1Email,
        parent1FromFranceConnect: "true",
      });
      expect(response2.statusCode).toBe(404);
    });
  });
  describe("PUT /young/inscription/consentements", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put("/young/inscription/consentements").send(body);
      passport.user = previous;

      return response;
    }
    it("Should update Young consentements with statut code 200", async () => {
      //Young 16 years old
      let date1 = new Date();
      date1.setFullYear(date1.getFullYear() - 16);
      const response1 = await selfUpdateYoung(
        {
          parentConsentment1: true,
          parentConsentment2: true,
          parentConsentment3: true,
          parentConsentment4: true,
          parentConsentment5: true,
          parentConsentment7: true,
          consentment1: true,
        },
        {
          birthdateAt: date1,
        },
      );
      expect(response1.statusCode).toBe(200);

      //Young 14 years old
      let date2 = new Date();
      date2.setFullYear(date2.getFullYear() - 14);
      const response2 = await selfUpdateYoung(
        {
          parentConsentment1: true,
          parentConsentment2: true,
          parentConsentment3: true,
          parentConsentment4: true,
          parentConsentment5: true,
          parentConsentment6: true,
          parentConsentment7: true,
          consentment1: true,
          consentment2: true,
        },
        {
          birthdateAt: date2,
        },
      );
      expect(response2.statusCode).toBe(200);
    });
    it("should return 400 when parameters invalid", async () => {
      //Young 16 years old
      let date1 = new Date();
      date1.setFullYear(date1.getFullYear() - 16);
      const response1 = await selfUpdateYoung(
        {
          parentConsentment1: true,
          parentConsentment2: true,
          parentConsentment3: true,
          parentConsentment4: true,
          parentConsentment5: true,
          parentConsentment6: true,
          parentConsentment7: true,
          consentment1: true,
          consentment2: true,
        },
        {
          birthdateAt: date1,
        },
      );
      expect(response1.statusCode).toBe(400);

      //Young 14 years old
      let date2 = new Date();
      date2.setFullYear(date2.getFullYear() - 14);
      const response2 = await selfUpdateYoung(
        {
          parentConsentment1: true,
          parentConsentment2: true,
          parentConsentment3: true,
          parentConsentment4: true,
          parentConsentment5: true,
          parentConsentment7: true,
          consentment1: true,
        },
        {
          birthdateAt: date2,
        },
      );
      expect(response2.statusCode).toBe(400);
    });
    it("should return 404 if user don't exist", async () => {
      const response = await request(getAppHelper()).put("/young/inscription/consentements").send({
        parentConsentment1: true,
        parentConsentment2: true,
        parentConsentment3: true,
        parentConsentment4: true,
        parentConsentment5: true,
        parentConsentment7: true,
        consentment1: true,
      });
      expect(response.statusCode).toBe(404);

      const response2 = await request(getAppHelper()).put("/young/inscription/consentements").send({
        parentConsentment1: true,
        parentConsentment2: true,
        parentConsentment3: true,
        parentConsentment4: true,
        parentConsentment5: true,
        parentConsentment6: true,
        parentConsentment7: true,
        consentment1: true,
        consentment2: true,
      });
      expect(response2.statusCode).toBe(404);
    });
  });
  describe("PUT /young/inscription/documents/next", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put("/young/inscription/documents/next").send(body);
      passport.user = previous;

      return response;
    }
    it("Should update Young documents with statut code 200", async () => {
      //Young 16 years old
      let date1 = new Date();
      date1.setFullYear(date1.getFullYear() - 16);
      const response1 = await selfUpdateYoung(
        {
          cniFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "cniFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
        },
        {
          birthdateAt: date1,
          parent1FromFranceConnect: "true",
        },
      );
      expect(response1.statusCode).toBe(200);

      //Young 16 years old
      const response2 = await selfUpdateYoung(
        {
          cniFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "cniFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
          parentConsentmentFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "parentConsentmentFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
        },
        {
          birthdateAt: date1,
          parent1FromFranceConnect: "false",
        },
      );
      expect(response2.statusCode).toBe(200);

      //Young 14 years old
      let date2 = new Date();
      date2.setFullYear(date2.getFullYear() - 14);
      const response3 = await selfUpdateYoung(
        {
          cniFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "cniFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
          parentConsentmentFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "parentConsentmentFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
          dataProcessingConsentmentFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "dataProcessingConsentmentFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
        },
        {
          birthdateAt: date2,
          parent1FromFranceConnect: "false",
        },
      );
      expect(response3.statusCode).toBe(200);
    });
    it("should return 400 when parameters invalid", async () => {
      //Young 16 years old
      let date1 = new Date();
      date1.setFullYear(date1.getFullYear() - 16);
      const response1 = await selfUpdateYoung(
        {
          cniFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "cniFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
        },

        {
          birthdateAt: date1,
          parent1FromFranceConnect: "false",
        },
      );
      expect(response1.statusCode).toBe(400);

      //Young 16 years old
      const response2 = await selfUpdateYoung(
        {
          parentConsentmentFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "parentConsentmentFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
        },

        {
          birthdateAt: date1,
          parent1FromFranceConnect: "false",
        },
      );
      expect(response2.statusCode).toBe(400);

      //Young 14 years old
      let date2 = new Date();
      date2.setFullYear(date2.getFullYear() - 14);
      const response3 = await selfUpdateYoung(
        {
          cniFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "cniFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
          parentConsentmentFiles: [
            {
              _id: "62f6696dafcf890509c3c743",
              name: "parentConsentmentFiles.jpg",
              size: 279143,
              uploadedAt: "2022-08-12T14:53:33.752+00:00",
              mimetype: "image/jpeg",
            },
          ],
          dataProcessingConsentmentFiles: [],
        },

        {
          birthdateAt: date2,
          parent1FromFranceConnect: "false",
        },
      );
      expect(response3.statusCode).toBe(400);
    });
    it("should return 404 if user don't exist", async () => {
      const response = await request(getAppHelper())
        .put("/young/inscription/documents/next")
        .send({
          cniFiles: ["cniFiles.jpg"],
        });
      expect(response.statusCode).toBe(404);

      const response2 = await request(getAppHelper())
        .put("/young/inscription/documents/next")
        .send({
          cniFiles: ["cniFiles.jpg"],
          parentConsentmentFiles: ["parentConsentmentFiles.pdf"],
        });
      expect(response2.statusCode).toBe(404);

      const response3 = await request(getAppHelper())
        .put("/young/inscription/documents/next")
        .send({
          cniFiles: ["cniFiles.jpg"],
          parentConsentmentFiles: ["parentConsentmentFiles.pdf"],
          dataProcessingConsentmentFiles: ["dataProcessingConsentmentFiles.pdf"],
        });
      expect(response3.statusCode).toBe(404);
    });
  });
  describe("PUT /young/inscription/done", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put("/young/inscription/done").send(body);
      passport.user = previous;

      return response;
    }
    it("Should update Young done with statut code 200", async () => {
      const response1 = await selfUpdateYoung({
        informationAccuracy: true,
      });
      expect(response1.statusCode).toBe(200);

      let grade = "Terminale";
      const response2 = await selfUpdateYoung(
        {
          informationAccuracy: true,
          aknowledgmentTerminaleSessionAvailability: true,
        },
        { grade },
      );
      expect(response2.statusCode).toBe(200);

      grade = "Terminale CAP";
      const response3 = await selfUpdateYoung(
        {
          informationAccuracy: true,
          aknowledgmentTerminaleSessionAvailability: true,
        },
        { grade },
      );
      expect(response3.statusCode).toBe(200);
    });
    it("should return 400 when parameters invalid", async () => {
      const response1 = await selfUpdateYoung({
        informationAccuracy: false,
      });
      expect(response1.statusCode).toBe(400);

      const response2 = await selfUpdateYoung({
        informationAccuracy: true,
        aknowledgmentTerminaleSessionAvailability: true,
      });
      expect(response2.statusCode).toBe(400);

      const grade = "3eme";
      const response3 = await selfUpdateYoung(
        {
          informationAccuracy: true,
          aknowledgmentTerminaleSessionAvailability: true,
        },
        { grade },
      );
      expect(response3.statusCode).toBe(400);
    });
    it("should return 404 if user don't exist", async () => {
      const response = await request(getAppHelper()).put("/young/inscription/done").send({
        informationAccuracy: true,
      });
      expect(response.statusCode).toBe(404);

      const response2 = await request(getAppHelper()).put("/young/inscription/done").send({
        informationAccuracy: true,
        aknowledgmentTerminaleSessionAvailability: true,
      });
      expect(response2.statusCode).toBe(404);
    });
  });
});
