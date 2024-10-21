import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const EventSchema = {
  userType: {
    type: String,
    documentation: {
      description: "young ou referent",
    },
  },
  userId: {
    type: String,
  },
  category: {
    type: String,
  },
  action: {
    type: String,
  },
  value: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(EventSchema);
export type EventType = InterfaceExtended<InferSchemaType<typeof schema>>;
