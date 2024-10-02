import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";
import bcrypt from "bcryptjs";

import mongooseElastic from "@selego/mongoose-elastic";
import { ReferentSchema, ReferentType } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";
import esClient from "../es";
import * as brevo from "../brevo";
import anonymize from "../anonymization/referent";

const MODELNAME = "referent";

const schema = new Schema(ReferentSchema);

schema.virtual("fullName").get(function () {
  const { firstName, lastName } = this;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  else return firstName || lastName;
});

schema.pre<SchemaExtended>("save", async function (next) {
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  return next();
});

schema.methods.comparePassword = async function (p: string) {
  const user = await ReferentModel.findById(this._id).select("password");
  return bcrypt.compare(p, user!.password || "");
};

schema.methods.anonymise = function () {
  return anonymize(this);
};

//Sync with Sendinblue
schema.post("save", function (doc) {
  brevo.sync(doc, MODELNAME);
});
schema.post("findOneAndUpdate", function (doc) {
  brevo.sync(doc, MODELNAME);
});
schema.post("remove", function (doc) {
  brevo.unsync(doc);
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
  excludes: [
    "/password",
    "/lastLoginAt",
    "/lastActivityAt",
    "/lastLogoutAt",
    "/passwordChangedAt",
    "/nextLoginAttemptIn",
    "/forgotPasswordResetToken",
    "/forgotPasswordResetExpires",
    "/invitationToken",
    "/invitationExpires",
    "/loginAttempts",
    "/attempts2FA",
    "/updatedAt",
    "/token2FA",
    "/token2FAExpires",
  ],
});

schema.plugin(
  mongooseElastic(esClient, {
    selectiveIndexing: true,
    ignore: [
      "password",
      "lastLogoutAt",
      "passwordChangedAt",
      "nextLoginAttemptIn",
      "forgotPasswordResetToken",
      "forgotPasswordResetExpires",
      "invitationToken",
      "invitationExpires",
      "loginAttempts",
      "attempts2FA",
      "updatedAt",
      "lastActivityAt",
      "token2FA",
      "token2FAExpires",
    ],
  }),
  MODELNAME,
);

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

export type ReferentDocument<T = {}> = DocumentExtended<
  ReferentType & {
    // virtual fields
    fullName?: string;
  } & T
>;
type SchemaExtended = ReferentDocument & UserExtension;

export const ReferentModel = mongoose.model<ReferentDocument>(MODELNAME, schema);
