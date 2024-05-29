const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { createClass } = require("./helpers/classe");
const { ROLES } = require("snu-lib");
const passport = require("passport");

describe("DELETE /classe/:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).delete("/classe/invalidId").query({ type: "delete" }).send();
    expect(res.status).toBe(400);
  });

  it("should return 400 when type is invalid", async () => {
    const validId = (await createClass())._id;
    const res = await request(getAppHelper()).delete(`/classe/${validId}`).query({ type: "invalidType" }).send();
    expect(res.status).toBe(400);
  });

  it("should return 403 when type is withdraw and user cannot withdraw classes", async () => {
    const validId = (await createClass())._id;
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).delete(`/classe/${validId}`).query({ type: "withdraw" }).send();
    expect(res.status).toBe(403);
  });

  it("should return 403 when type is delete and user cannot delete classes", async () => {
    const validId = (await createClass())._id;
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).delete(`/classe/${validId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(403);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).delete(`/classe/${nonExistingId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(404);
  });

  it("should return 200 when class is deleted successfully", async () => {
    const validId = (await createClass())._id;
    const res = await request(getAppHelper()).delete(`/classe/${validId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(200);
  });

  it("should return 200 when class is withdrawn successfully", async () => {
    const validId = (await createClass())._id;
    const res = await request(getAppHelper()).delete(`/classe/${validId}`).query({ type: "withdraw" }).send();
    expect(res.status).toBe(200);
  });
});
