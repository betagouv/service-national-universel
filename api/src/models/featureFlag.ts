import mongoose, { InferSchemaType, Schema } from "mongoose";

import { FeatureFlagSchema, InterfaceExtended, MONGO_COLLECTION, DocumentExtended } from "snu-lib";

const schema = new Schema(FeatureFlagSchema);

type FeatureFlagType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type FeatureFlagDocument<T = {}> = DocumentExtended<FeatureFlagType & T>;

export const FeatureFlagModel = mongoose.model<FeatureFlagDocument>(MONGO_COLLECTION.FEATURE_FLAG, schema);
