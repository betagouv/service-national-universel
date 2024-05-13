import { ROLES } from "@/utils";
export type Young = { _id: string };

export type BusLine = { _id: string };

export type User = {
  role: (typeof ROLES)[keyof typeof ROLES];
  structureId: string;
  subRole?: string;
};
