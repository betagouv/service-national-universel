import { ROLES } from "@/utils";
export type Young = { _id: string };

export type BusLine = { _id: string };

export type User = {
  role: (typeof ROLES)[keyof typeof ROLES];
  structureId: string;
  subRole?: string;
};

export type Center = {
  academy: string;
  address: string;
  addressVerified: string;
  centerDesignation: string;
  city: string;
  code: string;
  code2022: string;
  cohorts: string[];
  complement: string;
  createdAt: string;
  department: string;
  domain: string;
  name: string;
  placesTotal?: number;
  pmr: string;
  region: string;
  sessionStatus: string[];
  typology: string;
  updatedAt: string;
  waitingList: string[];
  zip: string;
  __v: number;
  _id: string;
};

export type Session = {
  _id: string;
  cohort: string;
  placesTotal: number;
  placesLeft: number;
  dateStart: string | null;
  dateEnd: string | null;
  canBeDeleted?: boolean;
  sanitaryContactEmail: string;
};
