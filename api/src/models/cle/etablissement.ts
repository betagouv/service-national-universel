import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { EtablissementSchema, EtablissementType, MONGO_COLLECTION, getUserToSave, getVirtualUser, CustomSaveParams, UserExtension, UserSaved, DocumentExtended } from "snu-lib";

import { ClasseModel } from "./classe";

const MODELNAME = MONGO_COLLECTION.ETABLISSEMENT;

const schema = new Schema(EtablissementSchema);

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.pre<SchemaExtended>("save", async function (next, params: CustomSaveParams) {
  if (params?.fromUser) {
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
