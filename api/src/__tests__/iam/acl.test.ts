import { getAcl } from "../../services/iam/Permission.service";
import { RoleModel } from "../../models/permissions/role";
import { PermissionModel } from "../../models/permissions/permission";
import { PERMISSION_ACTIONS, ROLES, SUB_ROLES } from "snu-lib";
import { dbConnect, dbClose } from "../helpers/db";
import { createRole, createPermission } from "./acl.helper";
beforeAll(dbConnect);
afterAll(dbClose);

describe("getAcl", () => {
  beforeEach(async () => {
    await RoleModel.deleteMany();
    await PermissionModel.deleteMany();
  });

  it("should return empty array when user has no roles", async () => {
    const user = {};
    const result = await getAcl(user);
    expect(result).toEqual([]);
  });

  it("should return permissions for user with role", async () => {
    // Create a role
    const role = await createRole(ROLES.ADMIN);

    // Create a permission
    const permission = await createPermission("CodePermission", [role.code], "ressource", PERMISSION_ACTIONS.READ);

    const result = await getAcl({ roles: [ROLES.ADMIN] });

    expect(result).toHaveLength(1);
    expect(result[0].code).toBe(permission.code);
  });

  it("should return permissions for user with subRole", async () => {
    // Create a role
    const role = await createRole(ROLES.ADMIN);

    // Create a subRole
    await createRole(SUB_ROLES.manager_department, role.code);

    // Create a permission
    const permission = await createPermission("CodePermission", [ROLES.ADMIN], "ressource", PERMISSION_ACTIONS.READ);

    const user = { roles: [ROLES.ADMIN, SUB_ROLES.manager_department] };
    const result = await getAcl(user);
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe(permission.code);
  });

  it("should return permissions for user with multiple roles", async () => {
    // Create roles
    await createRole(ROLES.ADMIN);
    await createRole(ROLES.REFERENT_DEPARTMENT);

    // Create permissions
    const adminPermission = await createPermission("AdminPermission", [ROLES.ADMIN], "ressource", PERMISSION_ACTIONS.READ);
    const referentPermission = await createPermission("ReferentPermission", [ROLES.REFERENT_DEPARTMENT], "ressource", PERMISSION_ACTIONS.READ);

    const user = { roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT] };
    const result = await getAcl(user);

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.code)).toEqual(expect.arrayContaining([adminPermission.code, referentPermission.code]));
  });
});
