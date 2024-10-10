import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const WaitingListSchema = {
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
};

const schema = new Schema(WaitingListSchema);
export type WaitingListType = InterfaceExtended<InferSchemaType<typeof schema>>;
