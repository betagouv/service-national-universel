import { ROLES, SUB_ROLES } from "snu-lib";

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type SousRole = (typeof SUB_ROLES)[keyof typeof SUB_ROLES];
