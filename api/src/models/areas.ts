import mongoose, { Schema, InferSchemaType } from "mongoose";
import { AreasSchema, InterfaceExtended, MONGO_COLLECTION, DocumentExtended } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.AREA;

// This object is used to get the density of a city and assign it to a young

const schema = new Schema(AreasSchema);

type AreasType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type AreasDocument<T = {}> = DocumentExtended<AreasType & T>;

export const AreasModel = mongoose.model<AreasDocument>(MODELNAME, schema);
