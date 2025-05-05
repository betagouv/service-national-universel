import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { EtablissementSchema, EtablissementType, MONGO_COLLECTION } from "snu-lib";

import { CustomSaveParams, UserExtension, UserSaved, DocumentExtended } from "../types";

import { ClasseModel } from "./classe";
import { getUserToSave } from "../utils";

const MODELNAME = MONGO_COLLECTION.ETABLISSEMENT;

const schema = new Schema(EtablissementSchema);

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model, impersonatedBy } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model, impersonatedBy };
  }
});

schema.pre<SchemaExtended>("save", async function (next, params: CustomSaveParams) {
  if (params.fromUser) {
    this.user = getUserToSave(params.fromUser);
  }
  this.updatedAt = new Date();
  if (!this.isNew && (this.isModified("department") || this.isModified("region"))) {
    const classes = await ClasseModel.find({ etablissementId: this._id });
    if (classes.length > 0) {
      const transaction = this.$session();
      await ClasseModel.updateMany(
        { etablissementId: this._id },
        {
          department: this.department,
          region: this.region,
          academy: this.academy,
        },
        { session: transaction },
      );
    }
  }

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

export type EtablissementDocument<T = {}> = DocumentExtended<EtablissementType & T>;
type SchemaExtended = EtablissementDocument & UserExtension;

export const EtablissementModel = mongoose.model<EtablissementDocument>(MODELNAME, schema);
