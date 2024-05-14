import { ROLES } from "@/utils";
export type Young = { _id: string };

export type BusLine = { _id: string };

export type User = {
  role: (typeof ROLES)[keyof typeof ROLES];
  structureId: string;
  subRole?: string;
};

export type Center = {
  _id: string;
  name: string;
  department: string;
  region: string;
  placesTotal: number;
  cohorts: string[];
};

export type Session = {
  _id: string;
  cohort: string;
  placesTotal: number;
  placesLeft: number;
  dateStart: string | null;
  dateEnd: string | null;
  sanitaryContactEmail: string;
};
