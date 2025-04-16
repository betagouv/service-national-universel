export const PERMISSION_ACTIONS = {
  CREATE: "create",
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  EXECUTE: "execute",
  FULL: "full",
} as const;

export const PERMISSION_ACTIONS_LIST = Object.values(PERMISSION_ACTIONS);
