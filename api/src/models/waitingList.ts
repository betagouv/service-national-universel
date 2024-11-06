import mongoose, { Schema, InferSchemaType } from "mongoose";
import anonymize from "../anonymization/waitingList";

import { WaitingListSchema, InterfaceExtended } from "snu-lib";

import { DocumentExtended } from "./types";

const MODELNAME = "waitinglist";

const schema = new Schema(WaitingListSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

type WaitingListType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type WaitingListDocument<T = {}> = DocumentExtended<WaitingListType & T>;

export const WaitingListModel = mongoose.model<WaitingListDocument>(MODELNAME, schema);
