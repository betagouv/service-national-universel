import mongoose, { Schema, InferSchemaType } from "mongoose";

import { DocumentExtended, InterfaceExtended } from "./types";

const MODELNAME = "event";

const schema = new Schema({
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
});

export type EventType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type EventDocument<T = {}> = DocumentExtended<EventType & T>;

export const EventModel = mongoose.model<EventDocument>(MODELNAME, schema);
