import request from "supertest";

import { ROLES } from "snu-lib";

import { dbConnect, dbClose } from "../helpers/db";
import getAppHelper from "../helpers/app";
import getNewLigneBusFixture from "../fixtures/PlanDeTransport/ligneBus";
import { LigneBusModel } from "../../models";
import { BusDocument } from "../../models/PlanDeTransport/ligneBus.type";

beforeAll(dbConnect);
afterAll(dbClose);

describe("pdtController", () => {
  beforeEach(async () => {
    await LigneBusModel.deleteMany();
  });
  describe("GET /plan-de-transport/:cohort/ligne-de-bus/:busId", () => {
    it("should return 400 for invalid ID", async () => {
      const res = await request(getAppHelper()).get(`/plan-de-transport/invalidID/ligne-de-bus/line-m3`);
      expect(res.status).toBe(404);
    });
    it("should return 403 for unauthorized user", async () => {
      const res = await request(getAppHelper(ROLES.VISITOR)).get(`/plan-de-transport/invalidID/ligne-de-bus/line-m3`);
      expect(res.status).toBe(403);
    });
    it("should return ligne de bus from pdt for cohort", async () => {
      const ligneBus = (await LigneBusModel.create(getNewLigneBusFixture())) as BusDocument;
      const res = await request(getAppHelper(ROLES.ADMIN)).get(`/plan-de-transport/${ligneBus.cohort}/ligne-de-bus/${ligneBus.busId}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});
