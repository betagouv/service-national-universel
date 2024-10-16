import request from "supertest";
import getAppHelper from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { YOUNG_STATUS } from "../utils";
import { ERRORS, GRADES } from "snu-lib";
import { fakerFR as faker } from "@faker-js/faker";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";
import { addYears } from "date-fns";
import { CohortModel } from "../models";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);

describe("Young preinscription", () => {
  beforeEach(async () => {
    await CohortModel.deleteMany({});
  });
  describe("PUT /preinscription/eligibilite", () => {
    it("should return 400 if young data is invalid", async () => {
      const response = await request(getAppHelper()).post("/preinscription/eligibilite").send({ invalidData: true });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ERRORS.INVALID_BODY);
    });

    it("should return 200 if young data is valid", async () => {
      const response = await request(getAppHelper()).post("/preinscription/eligibilite").send({
        schoolDepartment: "",
        department: "Department Name",
        region: "Region Name",
        schoolRegion: "",
        birthdateAt: "2000-01-01",
        grade: "Grade Name",
        status: "Status Name",
        zip: "",
        isReInscription: "false",
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
        isReInscription: "false",
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
      const response = await request(getAppHelper()).post("/preinscription/eligibilite").send(young);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });
  });
});
