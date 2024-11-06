import mongoose, { Schema, InferSchemaType } from "mongoose";
import { DocumentExtended } from "./types";
import { AreasSchema, InterfaceExtended } from "snu-lib";

const MODELNAME = "area";

// This object is used to get the density of a city and assign it to a young

const schema = new Schema(AreasSchema);

type AreasType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type AreasDocument<T = {}> = DocumentExtended<AreasType & T>;

export const AreasModel = mongoose.model<AreasDocument>(MODELNAME, schema);
