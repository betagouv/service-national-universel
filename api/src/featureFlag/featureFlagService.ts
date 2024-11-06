import { FeatureFlagName } from "snu-lib";
import { FeatureFlagDocument, FeatureFlagModel } from "../models";

const checkFeatureAvailable = (feature?: FeatureFlagDocument | null) => {
  if (!feature) {
    return false;
  }
  const isBetween = feature.date && feature.date.from <= new Date() && feature.date.to >= new Date();
  return !!(feature.enabled || isBetween);
};

export const isFeatureAvailable = async (featureName: FeatureFlagName) => {
  const feature = await FeatureFlagModel.findOne({ name: featureName });
  return checkFeatureAvailable(feature);
};

export const getFeatureFlagsAvailable = async (): Promise<{ [key: string]: boolean }> => {
  const features = await FeatureFlagModel.find({});
  return features.reduce((acc, feature) => {
    const isAvailable = checkFeatureAvailable(feature);
    if (isAvailable) {
      acc[feature.name] = true;
    }
    return acc;
  }, {});
};
