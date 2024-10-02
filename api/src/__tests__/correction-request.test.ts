import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper from "./helpers/app";
import { ERRORS, YOUNG_STATUS } from "snu-lib";

// young
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";

beforeAll(dbConnect);
afterAll(dbClose);

describe("Young Correction Request Controller", () => {
  describe("POST /correction-request/:youngId", () => {
    it("should return 200 and update the young user status and correction requests", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const newRequests = [
        {
          cohort: "cohort1",
          field: "cniFile",
          reason: "UNREADABLE",
          message: "The file is unreadable",
          status: "PENDING",
        },
      ];
      const response = await request(getAppHelper()).post(`/correction-request/${young._id}`).send(newRequests);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.status).toBe(YOUNG_STATUS.WAITING_CORRECTION);
      expect(response.body.data.correctionRequests).toHaveLength(newRequests.length);
    });

    it("should return 400 if the youngId is invalid", async () => {
      const response = await request(getAppHelper()).post("/correction-request/invalidId").send([]);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ERRORS.INVALID_PARAMS);
    });

    it("should return 400 if the request body is invalid", async () => {
      const response = await request(getAppHelper())
        .post(`/correction-request/${new ObjectId().toString()}`)
        .send([{ invalidField: "invalidValue" }]);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ERRORS.INVALID_BODY);
    });

    it("should return 404 if the young user is not found", async () => {
      const response = await request(getAppHelper()).post(`/correction-request/${new ObjectId().toString()}`).send([]);
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(ERRORS.NOT_FOUND);
    });
  });
});
