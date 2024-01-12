require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { ROLES } = require("snu-lib");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Email", () => {
  let res;
  describe("GET /email", () => {
    it("should return 400 if email param is missing", async () => {
      res = await request(getAppHelper()).get("/email");
      expect(res.status).toBe(400);
    });
    it("should return 400 if email param is not an email", async () => {
      res = await request(getAppHelper()).get("/email?email=test");
      expect(res.status).toBe(400);
    });
    it("should return 200 if email param is an email", async () => {
      res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.status).toBe(200);
    });
    it("should reject if not ADMIN, REFERENT_DEPARTMENT, REFERENT_REGION, REFERENT_CLASSE, ADMINISTRATEUR_CLE", async () => {
      const passport = require("passport");
      const { ADMIN, REFERENT_DEPARTMENT, REFERENT_REGION, REFERENT_CLASSE, ADMINISTRATEUR_CLE, ...unauthorizedRoles } = ROLES;
      for (const role of Object.values(unauthorizedRoles)) {
        passport.user.role = role;
        res = await request(getAppHelper()).get("/email?email=test@example.org");
        expect(res.statusCode).toEqual(403);
      }
      passport.user.role = ADMIN;
      res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      passport.user.role = REFERENT_DEPARTMENT;
      res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      passport.user.role = REFERENT_REGION;
      res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      passport.user.role = REFERENT_CLASSE;
      res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      passport.user.role = ADMINISTRATEUR_CLE;
      res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
    });
  });
});
