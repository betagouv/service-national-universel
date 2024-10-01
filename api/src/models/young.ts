import config from "config";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import mongooseElastic from "@selego/mongoose-elastic";
import patchHistory from "mongoose-patch-history";
import { YOUNG_SOURCE, YOUNG_STATUS, YoungSchema, YoungSchemaCorrectionRequest, YoungSchemaFile, YoungSchemaNote, YoungType } from "snu-lib";
import esClient from "../es";
import * as brevo from "../brevo";
import anonymize from "../anonymization/young";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = "young";

const ClasseStateManager = require("../cle/classe/stateManager").default;

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

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
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
  if (doc.source === YOUNG_SOURCE.CLE && doc.status === YOUNG_STATUS.VALIDATED) {
    await ClasseStateManager.compute(doc.classeId, doc._user, { YoungModel });
  }

  if (config.ENVIRONMENT === "test") return;
  brevo.sync(doc, MODELNAME);
});
schema.post("findOneAndUpdate", function (doc) {
  brevo.sync(doc, MODELNAME);
});
schema.post("remove", function (doc) {
  brevo.unsync(doc);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.fromUser = params?.fromUser;
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

if (config.get("ENABLE_MONGOOSE_ELASTIC")) {
  schema.plugin(
    mongooseElastic(esClient, {
      selectiveIndexing: true,
      ignore: [
        "historic",
        "missionsInMail",
        "password",
        "lastLogoutAt",
        "passwordChangedAt",
        "nextLoginAttemptIn",
        "forgotPasswordResetToken",
        "forgotPasswordResetExpires",
        "invitationExpires",
        "phase3Token",
        "loginAttempts",
        "parent1Inscription2023Token",
        "parent2Inscription2023Token",
        "updatedAt",
        "lastActivityAt",
        "userIps",
        "token2FA",
        "token2FAExpires",
      ],
    }),
    MODELNAME,
  );
}

schema.index({ ligneId: 1 });
schema.index({ sessionPhase1Id: 1 });
schema.index({ sessionPhase1Id: 1, status: 1 });
schema.index({ classeId: -1 });

export type YoungDocument<T = {}> = DocumentExtended<YoungType & T>;
type SchemaExtended = YoungDocument & UserExtension & { previousStatus?: YoungType["status"] };

export const YoungModel = mongoose.model<YoungDocument>(MODELNAME, schema);
