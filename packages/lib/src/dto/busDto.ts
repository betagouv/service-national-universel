export type BusDto = {
  _id?: string;
  cohort?: string;
  busId?: string;
  departuredDate?: string;
  returnDate?: string;
  youngCapacity?: number | string;
  youngSeatsTaken?: number | string;
  totalCapacity?: number | string;
  followerCapacity?: number | string;
  travelTime?: string;
  lunchBreak?: string;
  lunchBreakReturn?: string;
  classeId?: string;
  mergedBusIds?: string[];
  mergedBusDetails?: Pick<BusDto, "_id" | "busId" | "totalCapacity" | "youngCapacity" | "youngSeatsTaken">[];
  team?: BusTeam[];
};

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
