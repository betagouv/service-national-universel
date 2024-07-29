import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "sessionphase1token";

const schema = new Schema({
  token: {
    type: String,
    documentation: {
      description: "Token de session publique",
    },
  },

  startAt: {
    type: Date,
    documentation: {
      description: "Date de debut validité du token",
    },
  },

  expireAt: {
    type: Date,
    documentation: {
      description: "Date de fin validité du token",
    },
  },

  sessionId: {
    type: String,
    documentation: {
      description: "Id de session",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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

export type SessionPhase1TokenType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SessionPhase1TokenDocument<T = {}> = DocumentExtended<SessionPhase1TokenType & T>;
type SchemaExtended = SessionPhase1TokenDocument & UserExtension;

export const SessionPhase1TokenModel = mongoose.model<SessionPhase1TokenDocument>(MODELNAME, schema);
