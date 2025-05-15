import mongoose, { Schema, InferSchemaType } from "mongoose";

import { EventSchema, InterfaceExtended, MONGO_COLLECTION, DocumentExtended } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.EVENT;

const schema = new Schema(EventSchema);

type EventType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type EventDocument<T = {}> = DocumentExtended<EventType & T>;

export const EventModel = mongoose.model<EventDocument>(MODELNAME, schema);
