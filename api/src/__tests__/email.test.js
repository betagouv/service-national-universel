require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { ROLES } = require("snu-lib/roles");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Email", () => {
  describe("POST /email", () => {
    it("should work with valid IP", async () => {
      let res = await request(getAppHelper()).post("/email").set("x-forwarded-for", "185.107.232.1").send({ subject: "hello", email: "foo@bar.fr" });
      expect(res.status).toBe(200);

      res = await request(getAppHelper()).get("/email?email=foo@bar.fr");
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        data: expect.arrayContaining([expect.objectContaining({ subject: "hello", email: "foo@bar.fr" })]),
        ok: true,
      });
    });
    it("should should reject invalid IP", async () => {
      let res = await request(getAppHelper()).post("/email").set("x-forwarded-for", "1.2.3.4").send({ subject: "hello", email: "foo@bar.fr" });
      expect(res.status).toBe(401);
    });
    it("should reject when no IP", async () => {
      let res = await request(getAppHelper()).post("/email").send({ subject: "hello", email: "foo@bar.fr" });
      expect(res.status).toBe(401);
    });
  });
  describe("GET /email", () => {
    it("should return 400 if email param is missing", async () => {
      let res = await request(getAppHelper()).get("/email");
      expect(res.status).toBe(400);
    });
    it("should return 400 if email param is not an email", async () => {
      let res = await request(getAppHelper()).get("/email?email=test");
      expect(res.status).toBe(400);
    });
    it("should return 200 if email param is an email", async () => {
      let res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.status).toBe(200);
    });
    it("should reject if not admin", async () => {
      const passport = require("passport");
      const { ADMIN, ...unauthorizedRoles } = ROLES;
      for (const role of Object.values(unauthorizedRoles)) {
        passport.user.role = role;
        let res = await request(getAppHelper()).get("/email?email=test@example.org");
        expect(res.statusCode).toEqual(401);
      }
      passport.user.role = ADMIN;
      res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
    });
  });
});
