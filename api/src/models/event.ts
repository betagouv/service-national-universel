import mongoose, { Schema, InferSchemaType } from "mongoose";

import { EventSchema, InterfaceExtended } from "snu-lib";

import { DocumentExtended } from "./types";

const MODELNAME = "event";

const schema = new Schema(EventSchema);

type EventType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type EventDocument<T = {}> = DocumentExtended<EventType & T>;

export const EventModel = mongoose.model<EventDocument>(MODELNAME, schema);
