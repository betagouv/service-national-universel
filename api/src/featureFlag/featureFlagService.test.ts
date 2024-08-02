import { FeatureFlagModel } from "../models";

import { isFeatureAvailable, getFeatureFlagsAvailable } from "./featureFlagService";

describe("featureFlagService", () => {
  describe("isFeatureAvailable", () => {
    it("should return false if feature does not exist", async () => {
      jest.spyOn(FeatureFlagModel, "findOne").mockResolvedValueOnce(null);
      const result = await isFeatureAvailable("nonExistentFeature");
      expect(result).toBe(false);
    });

    it("should return true if feature is enabled", async () => {
      jest.spyOn(FeatureFlagModel, "findOne").mockResolvedValueOnce({ name: "enabledFeature", enabled: true });
      const result = await isFeatureAvailable("enabledFeature");
      expect(result).toBe(true);
    });

    it("should return true if feature is within date range", async () => {
      const from = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      const to = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      jest.spyOn(FeatureFlagModel, "findOne").mockResolvedValueOnce({ name: "dateFeature", date: { from, to } });
      const result = await isFeatureAvailable("dateFeature");
      expect(result).toBe(true);
    });

    it("should return false if feature is outside date range", async () => {
      const from = new Date(Date.now() - 1000 * 60 * 60 * 2); // 2 hours ago
      const to = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      jest.spyOn(FeatureFlagModel, "findOne").mockResolvedValueOnce({ name: "dateFeature", date: { from, to } });
      const result = await isFeatureAvailable("dateFeature");
      expect(result).toBe(false);
    });
  });

  describe("getFeatureFlagsAvailable", () => {
    it("should return an empty object if no features are available", async () => {
      jest.spyOn(FeatureFlagModel, "find").mockResolvedValueOnce([{ name: "disabledFeature", enabled: false }]);
      const result = await getFeatureFlagsAvailable();
      expect(result).toEqual({});
    });

    it("should return an object with available features", async () => {
      const from = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      const to = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      jest.spyOn(FeatureFlagModel, "find").mockResolvedValueOnce([
        { name: "enabledFeature", enabled: true },
        { name: "dateFeature", date: { from, to } },
      ]);
      const result = await getFeatureFlagsAvailable();
      expect(result).toEqual({ enabledFeature: true, dateFeature: true });
    });
  });
});
