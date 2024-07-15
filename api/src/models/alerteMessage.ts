import mongoose, { Schema, InferSchemaType } from "mongoose";
import mongooseElastic from "@selego/mongoose-elastic";
import esClient from "../es";
import patchHistory from "mongoose-patch-history";

import { ROLES_LIST } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "alerteMessage";

const schema = new Schema({
  priority: {
    type: String,
    enum: ["normal", "important", "urgent"],
    required: true,
    documentation: {
      description: "Niveau de priorité du message.",
    },
  },
  to_role: {
    type: [String],
    enum: ROLES_LIST,
    required: true,
    documentation: {
      description: "Destinateire(s) du message",
    },
  },
  title: {
    type: String,
    maxLength: 100,
    required: true,
    documentation: {
      description: "Titre du message",
    },
  },
  content: {
    type: String,
    maxLength: 1000,
    required: true,
    documentation: {
      description: "Contenu du message",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de création du message",
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de la dernière modification du message",
    },
  },
  deletedAt: {
    type: Date,
    documentation: {
      description: "Date de suppression du message",
    },
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

schema.plugin(mongooseElastic(esClient), MODELNAME);

export type AlerteMessageType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type AlerteMessageDocument<T = {}> = DocumentExtended<AlerteMessageType & T>;
type SchemaExtended = AlerteMessageDocument & UserExtension;

export const AlerteMessageModel = mongoose.model<AlerteMessageDocument>(MODELNAME, schema);
