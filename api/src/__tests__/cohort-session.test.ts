import request from "supertest";
import { fakerFR as faker } from "@faker-js/faker";
import { addDays, addMonths, addYears, startOfDay } from "date-fns";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { COHORT_TYPE, ERRORS, GRADES, ROLES, YOUNG_STATUS } from "snu-lib";

import { CohortModel } from "../models";
import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper from "./helpers/app";

// young
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";

// cohort
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);

describe("Cohort Session Controller", () => {
  beforeEach(async () => {
    await CohortModel.deleteMany({});
  });

  describe("POST /cohort-session/eligibility/:year", () => {
    // TODO: move auth young tests to preinscription
    it("should return 400 if young data is invalid", async () => {
      const response = await request(getAppHelper(null, "young")).post("/cohort-session/eligibility/2023").send({ invalidData: true });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ERRORS.INVALID_BODY);
    });

    it("should return 200 if young data is valid", async () => {
      const response = await request(getAppHelper(null, "young")).post("/cohort-session/eligibility/2023").send({
        schoolDepartment: "",
        department: "Department Name",
        region: "Region Name",
        schoolRegion: "",
        birthdateAt: "2000-01-01",
        grade: "Grade Name",
        status: "Status Name",
        zip: "",
      });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });

    it("should return cohorts if young is valid and has eligibility", async () => {
      const young = {
        department: "Loire-Atlantique",
        region: "Pays de la Loire",
        schoolRegion: "",
        birthdateAt: faker.date.past({ years: 3, refDate: addYears(new Date(), -15) }),
        grade: GRADES["2ndeGT"],
        status: YOUNG_STATUS.REFUSED,
        zip: faker.location.zipCode(),
      };
      await createCohortHelper(
        getNewCohortFixture({
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper(null, "young")).post("/cohort-session/eligibility/2023/").send(young);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("should return cohorts if young is valid and has eligibility (but not in time zone)", async () => {
      const young = {
        department: "Loire-Atlantique",
        region: "Pays de la Loire",
        schoolRegion: "",
        birthdateAt: faker.date.past({ years: 3, refDate: addYears(new Date(), -15) }),
        grade: GRADES["2ndeGT"],
        status: YOUNG_STATUS.REFUSED,
        zip: faker.location.zipCode(),
      };
      // cohort open today, but with timezone not avalaiable
      await createCohortHelper(
        getNewCohortFixture({
          inscriptionStartDate: startOfDay(new Date()),
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const timeZoneOffset = -24 * 3600; // 24 hours in seconds
      // avec un header x-user-timezone
      const response = await request(getAppHelper(null, "young")).post(`/cohort-session/eligibility/2023`).set("x-user-timezone", String(timeZoneOffset)).send(young);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("should return no cohorts if young has a grade not eligible", async () => {
      const young = {
        department: "Loire-Atlantique",
        region: "Pays de la Loire",
        schoolRegion: "",
        birthdateAt: faker.date.past({ years: 3, refDate: addYears(new Date(), -15) }),
        grade: GRADES["2ndeGT"],
        status: YOUNG_STATUS.REFUSED,
        zip: faker.location.zipCode(),
      };
      await createCohortHelper(
        getNewCohortFixture({
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [GRADES["1ereCAP"]],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper(null, "young")).post("/cohort-session/eligibility/2023/").send(young);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("should return 404 if young ID is not found", async () => {
      const response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${new ObjectId().toString()}`);
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ERRORS.NOT_FOUND);
    });

    it("admin cle, should return filtered sessions if young is valid", async () => {
      const young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "false", // not HTZ
          region: "Pays de la Loire",
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          type: COHORT_TYPE.CLE,
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );

      const response = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE })).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("referent dep, should bypass sessions filter with getAllSessions is true if young is valid", async () => {
      const young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "false", // not HTZ
          region: "Pays de la Loire",
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          type: COHORT_TYPE.CLE,
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );

      const response = await request(getAppHelper({ role: ROLES.REFERENT_DEPARTMENT })).post(`/cohort-session/eligibility/2023/${young._id}?getAllSessions=true`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it("admin, should return sessions if young is valid and cohort available", async () => {
      //  résidant+scolarisé dans dép X : si le dép X a un séjour, vérifier que le jeune peut candidater
      const young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "false", // not HTZ
          region: "Pays de la Loire",
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
        }),
      );
      // valid cohort year
      const cohort = await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      // invalid cohort year
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          dateStart: addYears(cohort.dateStart, -2),
          dateEnd: addMonths(addYears(cohort.dateStart, -2), 1),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("admin, should return sessions if young is valid and instruction open", async () => {
      let young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "false", // not HTZ
          region: "Pays de la Loire",
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
          status: YOUNG_STATUS.WAITING_CORRECTION,
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          instructionEndDate: faker.date.future(),
          inscriptionStartDate: faker.date.past(),
          inscriptionEndDate: faker.date.past(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      let response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);

      young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "false", // not HTZ
          region: "Pays de la Loire",
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
          status: YOUNG_STATUS.WAITING_VALIDATION,
        }),
      );
      response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("admin, should return sessions if young does not have cohort and cohort available", async () => {
      const young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "false", // not HTZ
          region: "Pays de la Loire",
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
          cohort: undefined,
          cohortId: undefined,
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("admin, should return no sessions if young cohort does not exists", async () => {
      const young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "false", // not HTZ
          region: "Pays de la Loire",
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: "invalidName",
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("should return no sessions if young is valid and cohort not available for his department", async () => {
      // résidant+scolarisé dans dép X : si le dép X n’a PAS de séjour, vérifier que le jeune peut PAS candidater
      const young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "false", // not HTZ
          region: "Pays de la Loire",
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: ["Morbihan"],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("admin, should return sessions if young is valid and cohort available (HTZ)", async () => {
      //  résidant dans dép Y + scolarisé dans dép X : si le dép X a un séjour, vérifier que le jeune peut candidater
      const young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "true", // HTZ
          region: "Pays de la Loire",
          department: "Morbihan",
          schoolDepartment: "Loire-Atlantique",
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.schoolDepartment!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("admin, should not return sessions if young is valid and cohort not available in his department (HTZ)", async () => {
      // résidant dans dép Y + scolarisé dans dép X : si le dép X n’a PAS de séjour, alors vérifier que le jeune ne peut PAS candidaté
      const young = await createYoungHelper(
        getNewYoungFixture({
          schooled: "true", // HTZ
          region: "Pays de la Loire",
          department: "Morbihan",
          schoolDepartment: "Loire-Atlantique",
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("admin, should return no sessions if young is valid and cohort not available (wrong dep)", async () => {
      //  Cas d’une région qui ne participe pas en totalité à un séjour (seul un département participe)
      const young = await createYoungHelper(
        getNewYoungFixture({
          region: "Pays de la Loire",
          department: "Loire-Atlantique",
          schoolDepartment: "Loire-Atlantique",
        }),
      );
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: ["Morbihan"],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("admin, should return no sessions if young is valid and cohort not available (inscriptionEnded)", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ region: "Pays de la Loire", department: "Loire-Atlantique", schoolDepartment: "Loire-Atlantique" }));
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("admin, should return no sessions if young has invalid birthdate and cohort is available", async () => {
      const cohort = await createCohortHelper(
        getNewCohortFixture({
          inscriptionEndDate: faker.date.future(),
          dateStart: addDays(addYears(new Date(), -18), -7),
          dateEnd: addDays(addYears(new Date(), -18), 0),
          eligibility: {
            zones: ["Loire-Atlantique"],
            schoolLevels: [GRADES["2ndeGT"]],
            bornAfter: addYears(new Date(), -18),
            bornBefore: addYears(new Date(), -15),
          },
        }),
      );
      // 15 ans à J-1
      let young = await createYoungHelper(
        getNewYoungFixture({
          cohort: cohort.name,
          region: "Pays de la Loire",
          department: cohort.eligibility.zones[0],
          schoolDepartment: cohort.eligibility.zones[0],
          birthdateAt: addDays(addYears(new Date(), -15), 1),
        }),
      );
      let response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);

      // 18 ans au cours du jour du séjour
      // young = await createYoungHelper(
      //   getNewYoungFixture({
      //     cohort: cohort.name,
      //     region: "Pays de la Loire",
      //     department: cohort.eligibility.zones[0],
      //     schoolDepartment: cohort.eligibility.zones[0],
      //     birthdateAt: addDays(addYears(new Date(), -18), 3),
      //   }),
      // );
      // response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      // expect(response.status).toBe(200);
      // expect(response.body.data.length).toBe(0);

      // 18 au dernier jour du séjour
      // young = await createYoungHelper(
      //   getNewYoungFixture({
      //     cohort: cohort.name,
      //     region: "Pays de la Loire",
      //     department: cohort.eligibility.zones[0],
      //     schoolDepartment: cohort.eligibility.zones[0],
      //     birthdateAt: addDays(addYears(new Date(), -18), 0),
      //   }),
      // );
      // response = await request(getAppHelper({ role: ROLES.ADMIN }, "referent")).post(`/cohort-session/eligibility/2023/${young._id}`);
      // expect(response.status).toBe(200);
      // expect(response.body.data.length).toBe(0);
    });
  });

  describe("GET /api/cohort-session/isReInscriptionOpen", () => {
    it("admin, should return 200 OK with data", async () => {
      await createCohortHelper(
        getNewCohortFixture({
          type: COHORT_TYPE.VOLONTAIRE,
          reInscriptionStartDate: faker.date.past(),
          reInscriptionEndDate: faker.date.future(),
        }),
      );

      const res = await request(getAppHelper()).get("/cohort-session/isReInscriptionOpen");

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("ok", true);
      expect(res.body).toHaveProperty("data", true);
    });
  });

  describe("GET /cohort-session/isInscriptionOpen", () => {
    it("should return 200 OK and inscription is open when one cohort available", async () => {
      await createCohortHelper(
        getNewCohortFixture({
          type: COHORT_TYPE.VOLONTAIRE,
          inscriptionEndDate: faker.date.future(),
        }),
      );

      const res = await request(getAppHelper()).get("/cohort-session/isInscriptionOpen");

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("ok", true);
      expect(res.body).toHaveProperty("data", true);
    });
    it("should return 200 OK and inscription is close when no cohort available", async () => {
      await createCohortHelper(
        getNewCohortFixture({
          type: COHORT_TYPE.VOLONTAIRE,
          inscriptionEndDate: faker.date.past(),
        }),
      );

      const res = await request(getAppHelper()).get("/cohort-session/isInscriptionOpen");

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("ok", true);
      expect(res.body).toHaveProperty("data", false);
    });
    it("should return 200 OK and inscription is open for a specific cohort", async () => {
      const cohort = await createCohortHelper(
        getNewCohortFixture({
          type: COHORT_TYPE.VOLONTAIRE,
          inscriptionEndDate: faker.date.future(),
        }),
      );

      const res = await request(getAppHelper()).get(`/cohort-session/isInscriptionOpen?sessionName=${cohort.name}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("ok", true);
      expect(res.body).toHaveProperty("data", true);
    });
    it("should return 200 OK and inscription is close for a invalid cohort", async () => {
      await createCohortHelper(
        getNewCohortFixture({
          type: COHORT_TYPE.VOLONTAIRE,
          inscriptionEndDate: faker.date.future(),
        }),
      );

      const res = await request(getAppHelper()).get(`/cohort-session/isInscriptionOpen?sessionName=nonExistant`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("ok", true);
      expect(res.body).toHaveProperty("data", false);
    });
  });
});
