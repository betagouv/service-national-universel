import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import getAppHelper from "../helpers/app";
import { dbConnect, dbClose } from "../helpers/db";
import { createSessionPhase1 } from "../helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "../fixtures/sessionPhase1";

beforeAll(dbConnect);
afterAll(dbClose);

describe("GET /:id/plan-de-transport", () => {
  it("should return 200 and the plan de transport", async () => {
    const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture());
    const response = await request(getAppHelper()).get(`/session-phase1/${sessionPhase1._id}/plan-de-transport`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });

  it("should return 404 if session phase 1 is not found", async () => {
    const sessionId = new ObjectId();
    const response = await request(getAppHelper()).get(`/session-phase1/${sessionId}/plan-de-transport`);

    expect(response.status).toBe(404);
  });

  it("should return 404 if plan de transport is not found", async () => {
    const sessionId = new ObjectId();
    const response = await request(getAppHelper()).get(`/session-phase1/${sessionId}/plan-de-transport`);

    expect(response.status).toBe(404);
  });

  it("should return 400 if id is not valid", async () => {
    const response = await request(getAppHelper()).get("/session-phase1/invalidId/plan-de-transport");

    expect(response.status).toBe(400);
  });
});
