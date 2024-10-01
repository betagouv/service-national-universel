import { UserDto } from "snu-lib";

export type Young = { _id: string };

export type BusLine = { _id: string };

export type User = UserDto & { featureFlags?: { [key: string]: boolean } };

export type Center = {
  academy: string;
  address: string;
  addressVerified: string;
  centerDesignation: string;
  city: string;
  code: string;
  matricule?: string;
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

export type TStatus =
  | "none"
  | "DRAFT"
  | "CANCEL"
  | "REFUSED"
  | "IN_PROGRESS"
  | "WAITING_VALIDATION"
  | "WAITING_CORRECTION"
  | "VALIDATED"
  | "WAITING_LIST"
  | "secondary"
  | "primary";
