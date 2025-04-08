import { PointDeRassemblementType } from "../mongoSchema";

export type CenterDetailDto = {
  cohorts: string[];
  waitingList: any[];
  sessionStatus: any[];
  _id: string;
  name: string;
  code2022: string;
  address: string;
  city: string;
  zip: string;
  department: string;
  region: string;
  addressVerified: string;
  placesTotal: number;
  pmr: string;
  academy: string;
  typology: string;
  domain: string;
  complement: string;
  centerDesignation: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  code: string;
};

export type LigneBusDto = {
  youngSeatsTaken: number;
  meetingPointsIds: string[];
  delayedForth: string;
  delayedBack: string;
  mergedBusIds?: string[];
  _id: string;
  cohort: string;
  cohortId: string;
  busId: string;
  codeCourtDeRoute?: string;
  departuredDate: string;
  returnDate: string;
  centerId: string;
  centerArrivalTime: string;
  centerDepartureTime: string;
  followerCapacity: number;
  youngCapacity: number;
  totalCapacity: number;
  lunchBreak: boolean;
  lunchBreakReturn: boolean;
  travelTime: string;
  sessionId: string;
  team: BusTeamDto[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  meetingsPointsDetail: PointDeRassemblementType[];
  centerDetail: CenterDetailDto;
  mergedBusDetails?: Pick<LigneBusDto, "_id" | "busId" | "totalCapacity" | "youngCapacity" | "youngSeatsTaken">[];
  mirrorBusDetails?: Pick<LigneBusDto, "_id" | "busId" | "totalCapacity" | "youngCapacity" | "youngSeatsTaken">;
  classeId?: string;
};

export type BusTeamUpdateDto = {
  role: BusTeamRole;
  idTeam?: string;
  lastName?: string;
  firstName?: string;
  birthdate?: Date;
  mail?: string;
  phone?: string;
  forth: boolean;
  back: boolean;
};

export type BusTeamDto = BusTeamUpdateDto & {
  _id?: string;
};

export enum BusTeamRole {
  SUPERVISOR = "supervisor",
  LEADER = "leader",
}
