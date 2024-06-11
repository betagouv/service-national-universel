import type { Document } from "mongoose";

export type BusDocument = IBus & Document;
export type BusTeamDocument = BusTeam & Document;

export interface IBus {
  cohort: string;
  busId: string;
  departuredDate?: Date;
  returnDate?: Date;
  youngCapacity?: number;
  totalCapacity?: number;
  followerCapacity?: number;
  youngSeatsTaken?: number;
  travelTime?: string;
  lunchBreak?: boolean;
  lunchBreakReturn?: boolean;
  sessionId?: string;
  centerId?: string;
  centerArrivalTime?: string;
  centerDepartureTime?: string;
  classeId?: string;
  meetingPointsIds?: string[];
  team?: BusTeam[];
  delayedForth?: "true" | "false";
  delayedBack?: "true" | "false";
  mergedBusIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface BusTeam {
  _id?: string;
  role?: string;
  lastName?: string;
  firstName?: string;
  birthdate?: Date;
  mail?: string;
  phone?: string;
  forth?: boolean;
  back?: boolean;
}
