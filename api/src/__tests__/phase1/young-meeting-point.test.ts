import request from "supertest";
import getAppHelper from "../helpers/app";
import getNewYoungFixture from "../fixtures/young";
import { createYoungHelper, notExistingYoungId } from "../helpers/young";
import { createMeetingPointHelper, notExistingMeetingPointId } from "../helpers/meetingPoint";
import getNewMeetingPointFixture from "../fixtures/meetingPoint";
import { dbConnect, dbClose } from "../helpers/db";

beforeAll(dbConnect);
afterAll(dbClose);

describe("GET /young/:id/meeting-point", () => {
  it("should return 404 when young is not found", async () => {
    const res = await request(getAppHelper()).get(`/young/${notExistingYoungId}/meeting-point`).send();
    expect(res.status).toBe(404);
  });
  it("should return null when young has no meeting point", async () => {
    const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: notExistingMeetingPointId });
    const res = await request(getAppHelper()).get(`/young/${young._id}/meeting-point`).send();
    expect(res.status).toBe(200);
    expect(res.body.data).toBeFalsy();
  });
  it.skip("should return 200 when young has a meeting point", async () => {
    const meetingPoint = await createMeetingPointHelper(getNewMeetingPointFixture());
    const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: meetingPoint._id });
    const res = await request(getAppHelper()).get(`/young/${young._id}/meeting-point`).send();
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(meetingPoint._id.toString());
  });
});
