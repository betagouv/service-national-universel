import { ROLES } from "snu-lib";

export type RouteResponse<T> = { ok: boolean; code?: string; data: T };

export type Young = { _id: string };

export type BusLine = { _id: string };

export type User = {
  role: (typeof ROLES)[keyof typeof ROLES];
  structureId?: string;
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

export type Bus = {
  _id?: string;
  cohort?: string;
  busId?: string;
  departuredDate?: string;
  returnDate?: string;
  youngCapacity?: number | string;
  totalCapacity?: number | string;
  followerCapacity?: number | string;
  travelTime?: string;
  lunchBreak?: string;
  lunchBreakReturn?: string;
  classeId?: string;
  mergedBusIds?: string[];
  mergedBusDetail?: {
    _id: string;
    busId: string;
    totalCapacity: number;
    youngCapacity: number;
    youngSeatsTaken: number;
  }[];
};
