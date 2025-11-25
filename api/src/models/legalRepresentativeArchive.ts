import mongoose, { Schema } from "mongoose";
import { MONGO_COLLECTION, DocumentExtended } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.LEGAL_REPRESENTATIVE_ARCHIVE;

const LegalRepresentativeArchiveSchema = {
  youngId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "young",
    index: true,
  },
  parentIndex: {
    type: Number,
    required: true,
    enum: [1, 2],
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  allowImageRights: {
    type: String,
  },
  allowSNU: {
    type: String,
  },
  validationDate: {
    type: Date,
  },
  rulesParent: {
    type: String,
  },
  archivedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
};

const schema = new Schema(LegalRepresentativeArchiveSchema);

export type LegalRepresentativeArchiveType = {
  youngId: mongoose.Types.ObjectId;
  parentIndex: 1 | 2;
  firstName?: string;
  lastName?: string;
  allowImageRights?: string;
  allowSNU?: string;
  validationDate?: Date;
  rulesParent?: string;
  archivedAt: Date;
};

export type LegalRepresentativeArchiveDocument<T = {}> = DocumentExtended<LegalRepresentativeArchiveType & T>;

export const LegalRepresentativeArchiveModel = mongoose.model<LegalRepresentativeArchiveDocument>(
  MODELNAME,
  schema,
);

