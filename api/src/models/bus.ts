import mongoose, { Schema, InferSchemaType } from "mongoose";

import { BusSchema, InterfaceExtended, MONGO_COLLECTION, DocumentExtended } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.BUS;

const schema = new Schema(BusSchema);

type BusType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type BusDocument<T = {}> = DocumentExtended<BusType & T>;

export const BusModel = mongoose.model<BusDocument>(MODELNAME, schema);
