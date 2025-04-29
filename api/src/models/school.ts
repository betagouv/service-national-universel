import mongoose, { Schema, InferSchemaType } from "mongoose";

import { InterfaceExtended, SchoolSchema, MONGO_COLLECTION } from "snu-lib";

import { DocumentExtended } from "./types";

const MODELNAME = MONGO_COLLECTION.SCHOOL;

const schema = new Schema(SchoolSchema, { timestamps: true });

type SchoolType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SchoolDocument<T = {}> = DocumentExtended<SchoolType & T>;

export const SchoolModel = mongoose.model<SchoolDocument>(MODELNAME, schema);
