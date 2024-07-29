import { FeatureFlagName } from "../models/featureFlag";
import { FeatureFlagModel } from "../models";

export const isFeatureAvailable = async (featureName: FeatureFlagName) => {
  const feature = await FeatureFlagModel.findOne({ name: featureName });
  if (!feature) {
    return false;
  }
  const isBetween = feature.date!.from <= new Date() && feature.date!.to >= new Date();
  console.log("isFeatureAvailable - featureName:", featureName, "- feature.enabled:", feature.enabled, "- isNowBetweenDates:", isBetween);
  return !!(feature.enabled || isBetween);
};
