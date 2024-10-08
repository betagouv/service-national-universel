import request from "supertest";

import { CohortModel, LigneBusModel, PlanTransportModel } from "../models";

import getAppHelper from "./helpers/app";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import { dbConnect, dbClose } from "./helpers/db";
import getPlanDeTransportFixture from "./fixtures/PlanDeTransport/planDeTransport";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";

beforeAll(dbConnect);
afterAll(dbClose);

describe("demande-de-modification", () => {
  beforeEach(async () => {
    await Promise.all([PlanTransportModel.deleteMany({}), LigneBusModel.deleteMany({}), CohortModel.deleteMany({})]);
  });
  describe("POST /plan-de-transport/demande-de-modification", () => {
    it("should create a new modification request", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Avril 2023 - A" }));
      const ligneBus = await LigneBusModel.create(getNewLigneBusFixture({ cohort: cohort.name }));

      await PlanTransportModel.create(
        getPlanDeTransportFixture({
          _id: ligneBus._id,
          cohort: cohort.name,
        }),
      );

      const response = await request(getAppHelper()).post("/demande-de-modification").send({
        lineId: ligneBus._id,
        message: "message",
      });

      expect(response.statusCode).toEqual(200);

      const pdt = await PlanTransportModel.findById(ligneBus._id);
      expect(pdt?.modificationBuses?.length).toEqual(1);
      expect(pdt?.modificationBuses[0].requestMessage).toBeDefined();
      expect(pdt?.modificationBuses[0]._id).toBeDefined();
    });
  });
});
