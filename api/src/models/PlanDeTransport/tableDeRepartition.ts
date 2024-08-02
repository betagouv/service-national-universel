import mongoose, { Schema, InferSchemaType } from "mongoose";
import mongooseElastic from "@selego/mongoose-elastic";
import esClient from "../../es";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "../types";

const MODELNAME = "tablederepartition";

const schema = new Schema({
  cohort: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte",
    },
  },
  fromDepartment: {
    type: String,
    documentation: {
      description: "Département d'origine",
    },
  },
  fromRegion: {
    type: String,
    required: true,
    documentation: {
      description: "Région d'origine",
    },
  },
  toRegion: {
    type: String,
    documentation: {
      description: "Région de destination",
    },
  },
  toDepartment: {
    type: String,
    documentation: {
      description: "Département de destination",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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

schema.plugin(mongooseElastic(esClient), MODELNAME);

export type TableDeRepartitionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type TableDeRepartitionDocument<T = {}> = DocumentExtended<TableDeRepartitionType & T>;
type SchemaExtended = TableDeRepartitionDocument & UserExtension;

export const TableDeRepartitionModel = mongoose.model<TableDeRepartitionDocument>(MODELNAME, schema);
