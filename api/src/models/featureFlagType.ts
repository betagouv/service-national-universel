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
