type MeetingPointDetailDto = {
  _id: string;
  lineId: string;
  meetingPointId: string;
  transportType: string;
  busArrivalHour: string;
  departureHour: string;
  meetingHour: string;
  returnHour: string;
  stepPoints: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  location: any;
  cohorts: string[];
  code: string;
  name: string;
  address: string;
  complementAddress: { _id: string; cohort: string; complement: string }[];
  city: string;
  zip: string;
  department: string;
  region: string;
};

type CenterDetailDto = {
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
  mergedBusIds: string[];
  _id: string;
  cohort: string;
  busId: string;
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
  meetingsPointsDetail: MeetingPointDetailDto[];
  centerDetail: CenterDetailDto;
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
