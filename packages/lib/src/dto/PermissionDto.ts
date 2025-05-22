import { PermissionType } from "../mongoSchema";

export type PermissionDto = {
  action: PermissionType["action"];
  code: PermissionType["code"];
  policy: PermissionType["policy"];
  resource: PermissionType["resource"];
};
