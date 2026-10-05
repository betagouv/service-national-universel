import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import anonymize from "../anonymization/application";
import { needsPreviousStatus, nextProposalMarker } from "../application/applicationProposal";

import { ApplicationSchema, InterfaceExtended, MONGO_COLLECTION, getVirtualUser, buildPatchUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";
import { MissionDocument } from "./mission";
import { ContractDocument } from "./contract";
import { ReferentDocument } from "./referent";

const MODELNAME = MONGO_COLLECTION.APPLICATION;

const schema = new Schema(ApplicationSchema);

schema.virtual("mission", {
  ref: "mission",
  localField: "missionId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("contract", {
  ref: "contract",
  localField: "contractId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("tutor", {
  ref: "referent",
  localField: "tutorId",
  foreignField: "_id",
  justOne: true,
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

// Marqueur d'une proposition de mission non acceptée : tenu ici, et non dans chaque route, parce que
// le statut change par plusieurs chemins (volontaire, référents, lot, crons, annulation de mission).
schema.pre<SchemaExtended>("save", async function () {
  if (!this.isNew && !this.isModified("status")) return;
  let previousStatus: string | null | undefined;
  if (!this.isNew && needsPreviousStatus({ status: this.status, current: this.proposalNotAccepted })) {
    const previous = await (this.constructor as typeof ApplicationModel).findById(this._id).select({ status: 1 }).lean();
    previousStatus = previous?.status;
  }
  const marker = nextProposalMarker({ status: this.status, previousStatus, current: this.proposalNotAccepted });
  if (marker !== undefined) this.proposalNotAccepted = marker;
});

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

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

type ApplicationType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ApplicationDocument<T = {}> = DocumentExtended<
  ApplicationType & {
    mission?: MissionDocument;
    tutor?: ReferentDocument;
    contract?: ContractDocument;
  } & T
>;
type SchemaExtended = ApplicationDocument & UserExtension;

export const ApplicationModel = mongoose.model<ApplicationDocument>(MODELNAME, schema);
