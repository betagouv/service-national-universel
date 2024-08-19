import mongoose, { Schema, InferSchemaType } from "mongoose";
import anonymize from "../anonymization/waitingList";

import { DocumentExtended, InterfaceExtended } from "./types";

const MODELNAME = "waitinglist";

const schema = new Schema({
  zip: {
    type: String,
    documentation: {
      description: "Code postal du jeune",
    },
  },
  mail: {
    type: String,
    documentation: {
      description: "Mail du jeune",
    },
  },
  birthdateAt: {
    type: String,
    documentation: {
      description: "date de naissance",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

export type WaitingListType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type WaitingListDocument<T = {}> = DocumentExtended<WaitingListType & T>;

export const WaitingListModel = mongoose.model<WaitingListDocument>(MODELNAME, schema);