import { config } from "../config";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import patchHistory from "mongoose-patch-history";

import {
  YOUNG_SOURCE,
  YOUNG_STATUS,
  YoungSchema,
  YoungSchemaCorrectionRequest,
  YoungSchemaFile,
  YoungSchemaNote,
  YoungType,
  MONGO_COLLECTION,
  getVirtualUser,
  buildPatchUser,
  DocumentExtended,
  CustomSaveParams,
  UserExtension,
  UserSaved,
} from "snu-lib";

import * as brevo from "../brevo";
import anonymize from "../anonymization/young";
import ClasseStateManager from "../cle/classe/stateManager";

const MODELNAME = MONGO_COLLECTION.YOUNG;

const schema = new Schema({
  ...YoungSchema,
  files: {
    ...Object.keys(YoungSchema.files).reduce((acc, key) => {
      acc[key] = [new Schema(YoungSchemaFile)];
      return acc;
    }, {}),
  },
  correctionRequests: {
    ...YoungSchema.correctionRequests,
    type: [new Schema(YoungSchemaCorrectionRequest)],
  },
  notes: {
    ...YoungSchema.notes,
    type: [new Schema(YoungSchemaNote)],
  },
});

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.pre<SchemaExtended>("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      return next();
    });
  } else {
    return next();
  }
});

schema.methods.comparePassword = async function (p) {
  const user = await YoungModel.findById(this._id).select("password");
  return bcrypt.compare(p, user?.password || "");
};

schema.methods.anonymise = function () {
  return anonymize(this);
};

//Sync with brevo
schema.post<SchemaExtended>("save", async function (doc) {
  //TODO ajouter la transaction
  if (doc.source === YOUNG_SOURCE.CLE && (doc.status === YOUNG_STATUS.VALIDATED || doc.status === YOUNG_STATUS.WITHDRAWN)) {
    await ClasseStateManager.compute(doc.classeId, doc._user, { YoungModel });
  }

  if (config.ENVIRONMENT === "test") return;
  brevo.sync(doc, MODELNAME);
});
schema.post("findOneAndUpdate", function (doc) {
  brevo.sync(doc, MODELNAME);
});
schema.post("deleteOne", function (doc) {
  brevo.unsync(doc);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  if (params?.fromUser) {
    this.user = buildPatchUser(params.fromUser);
  }
  this.updatedAt = new Date();
  this.previousStatus = this.status; // Used to compute classe if a young CLE has a change in status (see post save hook)
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
    "/phase3Token",
    "/loginAttempts",
    "/updatedAt",
    "/statusPhase2UpdatedAt",
    "/statusPhase3UpdatedAt",
    "/statusPhase2ValidatedAt",
    "/statusPhase3ValidatedAt",
    "/userIps",
    "/token2FA",
    "/token2FAExpires",
  ],
});

schema.index({ ligneId: 1 });
schema.index({ sessionPhase1Id: 1 });
schema.index({ sessionPhase1Id: 1, status: 1 });
schema.index({ classeId: -1 });
schema.index({ department: 1 });
schema.index({ region: 1 });

export type YoungDocument<T = {}> = DocumentExtended<YoungType & T>;
type SchemaExtended = YoungDocument & UserExtension & { previousStatus?: YoungType["status"] };

export const YoungModel = mongoose.model<YoungDocument>(MODELNAME, schema);
