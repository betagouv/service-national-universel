export const PERMISSION_CODES = {
  EXPORT_INJEP: "ExportInjep",
  PROFILE: "Profile",
  SUPPORT_WRITE: "SupportWrite",
  SUPPORT_READ: "SupportRead",
} as const;

export const PERMISSION_CODES_LIST = Object.values(PERMISSION_CODES);
