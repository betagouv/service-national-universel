import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";
import bcrypt from "bcryptjs";

import { ReferentSchema, ReferentType, UserDto, MONGO_COLLECTION, getVirtualUser, buildPatchUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

import * as brevo from "../brevo";
import anonymize from "../anonymization/referent";

const MODELNAME = MONGO_COLLECTION.REFERENT;

const schema = new Schema(ReferentSchema);

schema
  .virtual("impersonatedBy")
  .get(function (this: any) {
    return this._impersonatedBy;
  })
  .set(function (this: any, user: any) {
    this._impersonatedBy = user;
  });

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
schema.post("deleteOne", function (doc) {
  brevo.unsync(doc);
});

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  if (params?.fromUser) {
    this.user = buildPatchUser(params.fromUser);
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
    "/impersonatedBy",
  ],
});

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

export type ReferentDocument<T = {}> = DocumentExtended<
  ReferentType & {
    // virtual fields
    fullName?: string;
    impersonatedBy?: UserDto;
  } & T
>;
type SchemaExtended = ReferentDocument & UserExtension;

export const ReferentModel = mongoose.model<ReferentDocument>(MODELNAME, schema);
