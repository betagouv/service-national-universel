import { Document } from "mongoose";

export type FeatureFlagDocument = FeatureFlagType & Document;

export interface FeatureFlagType {
  name: string;
  description: string;
  enabled?: boolean;
  date: { from: Date; to: Date };
  createdAt?: Date;
  updatedAt?: Date;
}

export enum FeatureFlagName {
  SYNC_APPEL_A_PROJET_CLE = "SYNC_APPEL_A_PROJET_CLE",
  CLE_BEFORE_JULY_15 = "CLE_BEFORE_JULY_15",
}
