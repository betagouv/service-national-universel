import request from "supertest";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES } from "snu-lib";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";

beforeAll(async () => {
  await dbConnect();
  await PermissionModel.deleteMany({ roles: { $in: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE] } });
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE],
    PERMISSION_RESOURCES.USER_NOTIFICATIONS,
    PERMISSION_ACTIONS.READ,
  );
});
afterAll(async () => {
  await dbClose();
});
afterEach(resetAppAuth);

describe("Email", () => {
  let res;
  describe("GET /email", () => {
    it("should return 400 if email param is missing", async () => {
      res = await request(await getAppHelperWithAcl()).get("/email");
      expect(res.status).toBe(400);
    });
    it("should return 400 if email param is not an email", async () => {
      res = await request(await getAppHelperWithAcl()).get("/email?email=test");
      expect(res.status).toBe(400);
    });
    it("should return 200 if email param is an email", async () => {
      res = await request(await getAppHelperWithAcl()).get("/email?email=test@example.org");
      expect(res.status).toBe(200);
    });
    it("should reject if not ADMIN, REFERENT_DEPARTMENT, REFERENT_REGION, REFERENT_CLASSE, ADMINISTRATEUR_CLE", async () => {
      const { ADMIN, REFERENT_DEPARTMENT, REFERENT_REGION, REFERENT_CLASSE, ADMINISTRATEUR_CLE, ...unauthorizedRoles } = ROLES;
      for (const role of Object.values(unauthorizedRoles)) {
        res = await request(await getAppHelperWithAcl({ role })).get("/email?email=test@example.org");
        expect(res.statusCode).toEqual(403);
      }
      res = await request(await getAppHelperWithAcl({ role: ADMIN })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      res = await request(await getAppHelperWithAcl({ role: REFERENT_DEPARTMENT })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      res = await request(await getAppHelperWithAcl({ role: REFERENT_REGION })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      res = await request(await getAppHelperWithAcl({ role: REFERENT_CLASSE })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
      res = await request(await getAppHelperWithAcl({ role: ADMINISTRATEUR_CLE })).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
    });
  });
});
