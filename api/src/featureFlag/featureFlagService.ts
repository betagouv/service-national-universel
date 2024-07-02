import { FeatureFlagName } from "../models/featureFlagType";
import { featureFlagDocumentModel } from "../models/featureFlag";

export const isFeatureAvailable = async (featureName: FeatureFlagName) => {
  const feature = await featureFlagDocumentModel.findOne({ name: featureName });
  if (!feature) {
    return false;
  }
  const isBetween = feature.date.from <= new Date() && feature.date.to >= new Date();
  console.log("isFeatureAvailable - featureName:", featureName, "- feature.enabled:", feature.enabled, "- isNowBetweenDates:", isBetween);
  return !!(feature.enabled || isBetween);
};
