import request from "supertest";
import { dbConnect, dbClose } from "../helpers/db";
import getAppHelper from "../helpers/app";
import getNewLigneBusFixture from "../fixtures/PlanDeTransport/ligneBus";
import { LigneBusModel } from "../../models";
import mongoose from "mongoose";
import { ROLES } from "snu-lib";
const { ObjectId } = mongoose.Types;

beforeAll(dbConnect);
afterAll(dbClose);

describe("ligneDeBusController", () => {
  beforeEach(async () => {
    await LigneBusModel.deleteMany();
  });
  describe("POST /ligne-de-bus/:id/ligne-fusionnee", () => {
    it("should return 400 for invalid ID", async () => {
      const res = await request(getAppHelper(ROLES.ADMIN)).post(`/ligne-de-bus/invalidID/ligne-fusionnee`).send({
        mergedBusId: "line-m3",
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 when missing payload", async () => {
      const res = await request(getAppHelper(ROLES.ADMIN)).post(`/ligne-de-bus/${ObjectId()}/ligne-fusionnee`).send({});
      expect(res.status).toBe(400);
    });
    it("should return 403 for unauthorized user", async () => {
      const res = await request(getAppHelper(ROLES.VISITOR)).post(`/ligne-de-bus/${ObjectId()}/ligne-fusionnee`).send({ mergedBusId: "line-m3" });
      expect(res.status).toBe(403);
    });
    it("should return 404 for non-existent bus", async () => {
      const res = await request(getAppHelper(ROLES.ADMIN)).post(`/ligne-de-bus/${ObjectId()}/ligne-fusionnee`).send({ mergedBusId: "non-existent" });
      expect(res.status).toBe(404);
    });
    it("should return 404 for non-existent line to merge", async () => {
      const ligneBus = await LigneBusModel.create(getNewLigneBusFixture());
      const res = await request(getAppHelper(ROLES.ADMIN)).post(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee`).send({ mergedBusId: "non-existent" });
      expect(res.status).toBe(404);
    });
    it("should return 400 when merging itself", async () => {
      const ligneBus = await LigneBusModel.create(getNewLigneBusFixture({ busId: "line-m3" }));
      const res = await request(getAppHelper(ROLES.ADMIN)).post(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee`).send({ mergedBusId: "line-m3" });
      expect(res.status).toBe(400);
    });
    it("should return 400 for already merged line", async () => {
      const ligneBus = await LigneBusModel.create(getNewLigneBusFixture({ busId: "line-m1", mergedBusIds: ["line-m1", "line-m2"] }));
      await LigneBusModel.create(getNewLigneBusFixture({ busId: "line-m2" }));
      const res = await request(getAppHelper(ROLES.ADMIN)).post(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee`).send({ mergedBusId: "line-m2" });
      expect(res.status).toBe(400);
    });
    it("should return 200 and updated info for successful updated", async () => {
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          busId: "line-m1",
          cohort: "Février 2023 - C",
          mergedBusIds: ["line-m1", "line-m2"],
        }),
      );
      await LigneBusModel.create(getNewLigneBusFixture({ busId: "line-m3" }));
      const res = await request(getAppHelper(ROLES.ADMIN)).post(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee`).send({
        mergedBusId: "line-m3",
      });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.mergedBusIds).toEqual(["line-m1", "line-m2", "line-m3"]);
    });
    it("should return 200 and updated info for successful updated on wrong data", async () => {
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          busId: "line-m1",
          cohort: "Février 2023 - C",
          mergedBusIds: ["line-m2"],
        }),
      );
      await LigneBusModel.create(getNewLigneBusFixture({ busId: "line-m3" }));
      const res = await request(getAppHelper(ROLES.ADMIN)).post(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee`).send({
        mergedBusId: "line-m3",
      });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.mergedBusIds).toEqual(["line-m1", "line-m2", "line-m3"]);
    });
  });

  // Tests for removing a merged line
  describe("DELETE /ligne-de-bus/:id/ligne-fusionnee/:mergedBusId", () => {
    it("should return 400 for invalid ID or mergedBusId", async () => {
      const res = await request(getAppHelper(ROLES.ADMIN)).delete(`/ligne-de-bus/invalidID/ligne-fusionnee/invalidMergedBusId`);
      expect(res.status).toBe(400);
    });
    it("should return 403 for unauthorized user", async () => {
      const res = await request(getAppHelper(ROLES.VISITOR)).delete(`/ligne-de-bus/${ObjectId()}/ligne-fusionnee/line-3`);
      expect(res.status).toBe(403);
    });
    it("should return 404 for non-existent or not merged line", async () => {
      const res = await request(getAppHelper(ROLES.ADMIN)).delete(`/ligne-de-bus/${ObjectId()}/ligne-fusionnee/line-3`);
      expect(res.status).toBe(404);
    });
    it("should return 200 and updated info for successful removal", async () => {
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          busId: "line-1",
          cohort: "Février 2023 - C",
          mergedBusIds: ["line-1", "line-2", "line-3"],
        }),
      );
      const res = await request(getAppHelper(ROLES.ADMIN)).delete(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee/line-3`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.mergedBusIds).toEqual(["line-1", "line-2"]);
    });
    it("should return 200 and updated info for successful removal of last mergedLine", async () => {
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          busId: "line-1",
          cohort: "Février 2023 - C",
          mergedBusIds: ["line-1", "line-2"],
        }),
      );
      await LigneBusModel.create(getNewLigneBusFixture({ busId: "line-m2", cohort: "Février 2023 - C", mergedBusIds: ["line-1", "line-2"] }));
      const res = await request(getAppHelper(ROLES.ADMIN)).delete(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee/line-2`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.mergedBusIds).toEqual([]);
    });
    it("should return 200 and updated info for successful removal on wrong data", async () => {
      const ligneBus = await LigneBusModel.create(
        getNewLigneBusFixture({
          busId: "line-1",
          cohort: "Février 2023 - C",
          mergedBusIds: ["line-2"],
        }),
      );
      await LigneBusModel.create(getNewLigneBusFixture({ busId: "line-m2", cohort: "Février 2023 - C", mergedBusIds: ["line-2"] }));
      const res = await request(getAppHelper(ROLES.ADMIN)).delete(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee/line-2`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.mergedBusIds).toEqual([]);
    });
  });
});
