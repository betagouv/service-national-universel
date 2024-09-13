import request from "supertest";
import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { COHORT_TYPE, ERRORS, ROLES } from "snu-lib";

import { CohortModel } from "../models";
import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper from "./helpers/app";

// young
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";

// cohort
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";

beforeAll(dbConnect);
afterAll(dbClose);

describe("Cohort Session Controller", () => {
  beforeEach(async () => {
    await CohortModel.deleteMany({});
  });

  describe("POST /cohort-session/eligibility/:year", () => {
    it("should return 404 if young ID is not found", async () => {
      const response = await request(getAppHelper({ role: ROLES.ADMIN })).post(`/cohort-session/eligibility/2023/${new ObjectId().toString()}`);
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ERRORS.NOT_FOUND);
    });

    it("should return 400 if young data is invalid", async () => {
      const response = await request(getAppHelper({ role: ROLES.ADMIN }))
        .post("/cohort-session/eligibility/2023")
        .send({ invalidData: true });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ERRORS.INVALID_BODY);
    });

    it("should return 400 if young data is valid", async () => {
      const response = await request(getAppHelper({ role: ROLES.ADMIN }))
        .post("/cohort-session/eligibility/2023")
        .send({
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
    });

    it("should return filtered sessions if young is valid and admin cle", async () => {
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
            bornAfter: new Date("2000-01-01"),
            bornBefore: new Date("2010-01-01"),
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
            bornAfter: new Date("2000-01-01"),
            bornBefore: new Date("2010-01-01"),
          },
        }),
      );

      const response = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE })).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("should bypass sessions filter if young is valid and ref dep with getAllSessions is true", async () => {
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
            bornAfter: new Date("2000-01-01"),
            bornBefore: new Date("2010-01-01"),
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
            bornAfter: new Date("2000-01-01"),
            bornBefore: new Date("2010-01-01"),
          },
        }),
      );

      const response = await request(getAppHelper({ role: ROLES.REFERENT_DEPARTMENT })).post(`/cohort-session/eligibility/2023/${young._id}?getAllSessions=true`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it("should return sessions if young is valid and cohort available", async () => {
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
            bornAfter: new Date("2000-01-01"),
            bornBefore: new Date("2010-01-01"),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN })).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("should return sessions if young is valid and cohort available (HTZ)", async () => {
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
            bornAfter: new Date("2000-01-01"),
            bornBefore: new Date("2010-01-01"),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN })).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it("should return no sessions if young is valid and cohort not available (wrong dep)", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ region: "Pays de la Loire", department: "Loire-Atlantique", schoolDepartment: "Loire-Atlantique" }));
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          inscriptionEndDate: faker.date.future(),
          eligibility: {
            zones: ["A"],
            schoolLevels: [young.grade || ""],
            bornAfter: new Date("2000-01-01"),
            bornBefore: new Date("2010-01-01"),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN })).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("should return no sessions if young is valid and cohort not available (inscriptionEnded)", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ region: "Pays de la Loire", department: "Loire-Atlantique", schoolDepartment: "Loire-Atlantique" }));
      await createCohortHelper(
        getNewCohortFixture({
          name: young.cohort,
          eligibility: {
            zones: [young.department!],
            schoolLevels: [young.grade || ""],
            bornAfter: new Date("2000-01-01"),
            bornBefore: new Date("2010-01-01"),
          },
        }),
      );
      const response = await request(getAppHelper({ role: ROLES.ADMIN })).post(`/cohort-session/eligibility/2023/${young._id}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe("GET /api/cohort-session/isReInscriptionOpen", () => {
    it("should return 200 OK with data", async () => {
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
    it("should return 200 OK with data", async () => {
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
  });
});
