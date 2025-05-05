import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
  InterfaceExtended,
  ModificationBusSchema,
  MONGO_COLLECTION,
  PlanTransportPointDeRassemblementEnrichedSchema,
  PlanTransportSchema,
  TRANSPORT_MODES_LIST,
  getUserToSave,
  getVirtualUser,
  DocumentExtended,
  CustomSaveParams,
  UserExtension,
  UserSaved,
} from "snu-lib";

import { PointDeRassemblementModel } from "./pointDeRassemblement";

const MODELNAME = MONGO_COLLECTION.PLAN_TRANSPORT;

const EnrichedPointDeRassemblementSchema = PointDeRassemblementModel.discriminator("Enriched", new Schema(PlanTransportPointDeRassemblementEnrichedSchema)).schema;

const schema = new Schema({
  ...PlanTransportSchema,
  modificationBuses: {
    ...PlanTransportSchema["modificationBuses"],
    type: [new Schema(ModificationBusSchema)],
  },
  pointDeRassemblements: {
    ...PlanTransportSchema["pointDeRassemblements"],
    type: [EnrichedPointDeRassemblementSchema],
  },
});

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  if (params?.fromUser) {
    this.user = getUserToSave(params.fromUser);
  }
  this.updatedAt = new Date();
  next();
});

schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

schema.index({ ligneDeBusId: 1 });

type PlanTransportType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type PlanTransportDocument<T = {}> = DocumentExtended<PlanTransportType & T>;
type SchemaExtended = PlanTransportDocument & UserExtension;

export const PlanTransportModel = mongoose.model<PlanTransportDocument>(MODELNAME, schema);
export type PlanTransportModesType = (typeof TRANSPORT_MODES_LIST)[number];
