import request from "supertest";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { ROLES } from "snu-lib";

beforeAll(dbConnect);
afterAll(dbClose);
afterEach(resetAppAuth);

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
      const { ADMIN, REFERENT_DEPARTMENT, REFERENT_REGION, REFERENT_CLASSE, ADMINISTRATEUR_CLE, ...unauthorizedRoles } = ROLES;
      for (const role of Object.values(unauthorizedRoles)) {
        res = await request(getAppHelper({ role })).get("/email?email=test@example.org");
        expect(res.statusCode).toEqual(403);
      }
      res = await request(getAppHelper({ role: ADMIN })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      res = await request(getAppHelper({ role: REFERENT_DEPARTMENT })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      res = await request(getAppHelper({ role: REFERENT_REGION })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      res = await request(getAppHelper({ role: REFERENT_CLASSE })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      res = await request(getAppHelper({ role: ADMINISTRATEUR_CLE })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
    });
  });
});
