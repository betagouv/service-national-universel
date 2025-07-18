import mongoose, { Schema, InferSchemaType } from "mongoose";
import anonymize from "../anonymization/waitingList";

import { WaitingListSchema, InterfaceExtended, MONGO_COLLECTION, DocumentExtended } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.WAITING_LIST;

const schema = new Schema(WaitingListSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

type WaitingListType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type WaitingListDocument<T = {}> = DocumentExtended<WaitingListType & T>;

export const WaitingListModel = mongoose.model<WaitingListDocument>(MODELNAME, schema);
