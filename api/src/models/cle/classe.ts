import mongoose from "mongoose";
import patchHistory from "mongoose-patch-history";

import { ClasseType, ClasseSchema, MONGO_COLLECTION, buildPatchUser, getVirtualUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

import { EtablissementDocument } from "./etablissement";
import { ReferentDocument } from "../referent";
import { CohesionCenterDocument } from "../cohesionCenter";
import { SessionPhase1Document } from "../sessionPhase1";
import { PointDeRassemblementDocument } from "../PlanDeTransport/pointDeRassemblement";
import { LigneBusDocument } from "../PlanDeTransport/ligneBus";
import { CohortDocument } from "../cohort";

const MODELNAME = MONGO_COLLECTION.CLASSE;

const schema = new mongoose.Schema(ClasseSchema);

schema.virtual("etablissement", {
  ref: MONGO_COLLECTION.ETABLISSEMENT,
  localField: "etablissementId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("referents", {
  ref: MONGO_COLLECTION.REFERENT,
  localField: "referentClasseIds",
  foreignField: "_id",
});

schema.virtual("cohesionCenter", {
  ref: MONGO_COLLECTION.COHESION_CENTER,
  localField: "cohesionCenterId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("session", {
  ref: MONGO_COLLECTION.SESSION_PHASE1,
  localField: "sessionId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("pointDeRassemblement", {
  ref: MONGO_COLLECTION.POINT_DE_RASSEMBLEMENT,
  localField: "pointDeRassemblementId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("ligne", {
  ref: MONGO_COLLECTION.LIGNE_BUS,
  localField: "ligneId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("cohortDetails", {
  ref: MONGO_COLLECTION.COHORT,
  localField: "cohort",
  foreignField: "name",
  justOne: true,
});

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

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
  excludes: ["/updatedAt"],
});

export type ClasseDocument<T = {}> = DocumentExtended<
  ClasseType & {
    // virtual fields
    etablissement?: EtablissementDocument;
    referents?: ReferentDocument[];
    cohesionCenter?: CohesionCenterDocument;
    session?: SessionPhase1Document;
    pointDeRassemblement?: PointDeRassemblementDocument;
    ligne?: LigneBusDocument;
    cohortDetails?: CohortDocument;
  } & T
>;
type SchemaExtended = ClasseDocument & UserExtension;

export const ClasseModel = mongoose.model<ClasseDocument>(MODELNAME, schema);
