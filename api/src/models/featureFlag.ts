import mongoose, { InferSchemaType, Schema } from "mongoose";

import { FeatureFlagSchema, InterfaceExtended } from "snu-lib";

import { DocumentExtended } from "./types";

const schema = new Schema(FeatureFlagSchema);

type FeatureFlagType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type FeatureFlagDocument<T = {}> = DocumentExtended<FeatureFlagType & T>;

export const FeatureFlagModel = mongoose.model<FeatureFlagDocument>("featureFlag", schema);
