import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
const anonymize = require("../anonymization/meetingPoint");

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "meetingpoint";

const schema = new Schema({
  isValid: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le point de rassemblement est validé",
    },
  },
  cohort: {
    type: String,
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2021"],
    documentation: {
      description: "Cohorte",
    },
  },
  busId: {
    type: String,
    documentation: {
      description: "Id du car qui fera le trajet",
    },
  },
  busExcelId: {
    type: String,
    documentation: {
      description: "Id du fichier import du car qui fera le trajet",
    },
  },

  // centre (destination)
  centerId: {
    type: String,
  },
  centerCode: {
    type: String,
  },

  // lieu de départ
  departureAddress: {
    type: String,
  },
  departureZip: {
    type: String,
  },
  departureCity: {
    type: String,
  },
  departureDepartment: {
    type: String,
  },
  departureRegion: {
    type: String,
  },
  hideDepartmentInConvocation: {
    type: String,
  },

  // date de départ
  departureAt: {
    type: Date,
  },
  departureAtString: {
    type: String,
  },
  realDepartureAtString: {
    type: String,
  },
  // date de retour
  returnAt: {
    type: Date,
  },
  returnAtString: {
    type: String,
  },
  realReturnAtString: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

export type MeetingPointType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type MeetingPointDocument<T = {}> = DocumentExtended<MeetingPointType & T>;
type SchemaExtended = MeetingPointDocument & UserExtension;

export const MeetingPointModel = mongoose.model<MeetingPointDocument>(MODELNAME, schema);
