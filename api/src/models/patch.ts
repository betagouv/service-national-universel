import mongoose, { InferSchemaType } from "mongoose";

import { InterfaceExtended, PatchOperationSchema, PatchSchema, PatchUserSchema } from "snu-lib";

import { DocumentExtended } from "./types";

const MODELNAME = "patche";

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
