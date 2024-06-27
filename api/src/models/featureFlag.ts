import mongoose from "mongoose";
import { FeatureFlagDocument } from "./featureFlagType";

const featureFlagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  date: {
    from: {
      type: Date,
      default: null,
    },
    to: {
      type: Date,
      default: null,
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const featureFlagDocumentModel = mongoose.model<FeatureFlagDocument>("featureFlag", featureFlagSchema);
export { featureFlagDocumentModel };
