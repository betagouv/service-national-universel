import { Permissions } from "./permissionService";

export async function getPermissions(): Promise<Permissions> {
  // TODO: Move to DB
  const json = await import("./permissions.json");
  return json.default;
}
