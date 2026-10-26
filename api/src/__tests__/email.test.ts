import request from "supertest";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES } from "snu-lib";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";

// Les cas de périmètre (qui peut consulter les notifications de qui) sont couverts par email-scope.test.ts.
// Ici on ne teste que la validation de la query et la porte « permission », en visant sa propre adresse :
// un utilisateur est toujours dans son propre périmètre.
const MON_EMAIL = "moi@example.org";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
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
        res = await request(await getAppHelperWithAcl({ role, email: MON_EMAIL })).get(`/email?email=${MON_EMAIL}`);
        expect(res.statusCode).toEqual(403);
      }
      for (const role of [ADMIN, REFERENT_DEPARTMENT, REFERENT_REGION, REFERENT_CLASSE, ADMINISTRATEUR_CLE]) {
        res = await request(await getAppHelperWithAcl({ role, email: MON_EMAIL })).get(`/email?email=${MON_EMAIL}`);
        expect(res.statusCode).toEqual(200);
      }
    });
  });
});
