import mongoose, { InferSchemaType } from "mongoose";

import { InterfaceExtended, PatchOperationSchema, PatchSchema, PatchUserSchema, MONGO_COLLECTION, DocumentExtended } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.PATCH;

const schema = new mongoose.Schema({
  ...PatchSchema,
  user: {
    ...PatchSchema.user,
    type: new mongoose.Schema(PatchUserSchema),
  },
  ops: {
    ...PatchSchema.ops,
    type: [new mongoose.Schema(PatchOperationSchema)],
  },
});

type PatchType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type PatchDocument<T = {}> = DocumentExtended<PatchType & T>;

// cf PlanDeTransport/ligneBus.ts
export const PatchLigneBusModel = mongoose.model<PatchDocument>(`lignebus_${MODELNAME}`, schema);
