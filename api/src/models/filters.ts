import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "filter";

const schema = new Schema({
  userId: {
    type: String,
  },
  url: {
    type: String,
    documentation: {
      description: "Url contenant tous les filtres preselectionnés",
    },
  },
  page: {
    type: String,
    documentation: {
      description: "Page sur laquelle se trouve le filtre",
    },
  },
  name: {
    type: String,
    documentation: {
      description: "Nom de la sauvegarde des filtres",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.fromUser = params?.fromUser;
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

export type FiltersType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type FiltersDocument<T = {}> = DocumentExtended<FiltersType & T>;
type SchemaExtended = FiltersDocument & UserExtension;

export const FiltersModel = mongoose.model<FiltersDocument>(MODELNAME, schema);
