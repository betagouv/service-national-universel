import mongoose, { Schema } from "mongoose";
import { isAfter, isWithinInterval } from "date-fns";
import patchHistory from "mongoose-patch-history";

import { CohortSchema, CohortType, getDateTimeByTimeZoneOffset, YoungDSNJExportDatesSchema, YoungEligibilitySchema } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = "cohort";

const schema = new Schema({
  ...CohortSchema,
  dsnjExportDates: {
    ...CohortSchema.dsnjExportDates,
    type: new Schema(YoungDSNJExportDatesSchema),
  },
  eligibility: {
    ...CohortSchema.eligibility,
    type: new Schema(YoungEligibilitySchema),
  },
});

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.methods.getIsInstructionOpen = function (timeZoneOffset) {
  const now = getDateTimeByTimeZoneOffset(timeZoneOffset);
  const end = this.instructionEndDate;
  if (!end || isAfter(now, end)) return false;
  return true;
};

schema.virtual("isInstructionOpen").get<SchemaExtended>(function () {
  return this.getIsInstructionOpen();
});

schema.methods.getIsInscriptionOpen = function (timeZoneOffset) {
  const now = getDateTimeByTimeZoneOffset(timeZoneOffset);
  const start = this.inscriptionStartDate;
  const end = this.inscriptionEndDate;
  if (!start || !end || isAfter(start, end)) return false;
  return isWithinInterval(now, { start, end });
};

schema.virtual("isInscriptionOpen").get<SchemaExtended>(function () {
  return this.getIsInscriptionOpen();
});

schema.methods.getIsReInscriptionOpen = function (timeZoneOffset) {
  const now = getDateTimeByTimeZoneOffset(timeZoneOffset);
  const start = this.reInscriptionStartDate;
  const end = this.reInscriptionEndDate;
  if (!start || !end) return this.getIsInscriptionOpen(timeZoneOffset);
  if (isAfter(start, end)) return false;
  return isWithinInterval(now, { start, end });
};

schema.virtual("isReInscriptionOpen").get<SchemaExtended>(function () {
  return this.getIsReInscriptionOpen();
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

export type CohortDocument<T = {}> = DocumentExtended<CohortType & T>;
type SchemaExtended = CohortDocument & UserExtension;

export const CohortModel = mongoose.model<CohortDocument>(MODELNAME, schema);
