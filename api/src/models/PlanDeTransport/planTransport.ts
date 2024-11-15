import config from "config";
import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";

import { InterfaceExtended, ModificationBusSchema, PlanTransportPointDeRassemblementEnrichedSchema, PlanTransportSchema, TRANSPORT_MODES_LIST } from "snu-lib";

import esClient from "../../es";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";

import { PointDeRassemblementModel } from "./pointDeRassemblement";

const MODELNAME = "plandetransport";

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
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.user = params?.fromUser;
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

if (config.get("ENABLE_MONGOOSE_ELASTIC")) {
  schema.plugin(mongooseElastic(esClient), MODELNAME);
}

schema.index({ ligneDeBusId: 1 });

type PlanTransportType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type PlanTransportDocument<T = {}> = DocumentExtended<PlanTransportType & T>;
type SchemaExtended = PlanTransportDocument & UserExtension;

export const PlanTransportModel = mongoose.model<PlanTransportDocument>(MODELNAME, schema);
export type PlanTransportModesType = (typeof TRANSPORT_MODES_LIST)[number];
