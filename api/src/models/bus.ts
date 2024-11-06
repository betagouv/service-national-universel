import mongoose, { Schema, InferSchemaType } from "mongoose";

import { BusSchema, InterfaceExtended } from "snu-lib";

import { DocumentExtended } from "./types";

const MODELNAME = "bus";

const schema = new Schema(BusSchema);

type BusType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type BusDocument<T = {}> = DocumentExtended<BusType & T>;

export const BusModel = mongoose.model<BusDocument>(MODELNAME, schema);
