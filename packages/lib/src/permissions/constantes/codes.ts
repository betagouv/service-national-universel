export enum PERMISSION_CODES {
  DASHBOARD = "Dashboard",
  EXPORT_DSNJ = "ExportDsnj",
  EXPORT_INJEP = "ExportInjep",
  MISSION_FULL = "MissionFull",
  MISSION_READ = "MissionRead",
  MISSION_SAME_STRUCTURE_FULL = "MissionSameStructureFull",
  PROFILE = "Profile",
  STRUCTURE_FULL = "StructureFull",
  STRUCTURE_SAME_STRUCTURE_FULL = "StructureSameStructureFull",
  SUPPORT_READ = "SupportRead",
  SUPPORT_WRITE = "SupportWrite",
  USER_FULL = "UserFull",
  USER_SAME_STRUCTURE_FULL = "UserSameStructureFull",
  USER_SAME_STRUCTURE_CREATE = "UserSameStructureCreate",
  YOUNG_FULL = "YoungFull",
  YOUNG_SAME_STRUCTURE_READ = "YoungSameStructureRead",
}

export const PERMISSION_CODES_LIST = Object.values(PERMISSION_CODES);
