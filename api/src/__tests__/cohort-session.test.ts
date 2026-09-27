import request from "supertest";
import { fakerFR as faker } from "@faker-js/faker";
import { COHORT_TYPE } from "snu-lib";

import { CohortModel } from "../models";
import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper, { resetAppAuth } from "./helpers/app";

// cohort
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);

describe("Cohort Session Controller", () => {
  beforeEach(async () => {
    await CohortModel.deleteMany({});
  });
  afterEach(resetAppAuth);

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
