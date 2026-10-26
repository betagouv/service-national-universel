import { regionList } from "snu-lib";
import { mapRegionToTrigramme } from "./regionService";

describe("mapRegionToTrigramme", () => {
  it("should map region to trigramme correctly", () => {
    for (const region of regionList) {
      const trigramme = mapRegionToTrigramme(region);
      console.log(`Region: ${region}, Trigramme: ${trigramme}`);
      expect(trigramme).toBeDefined();
    }
  });

  it("should return undefined for unknown region", () => {
    expect(mapRegionToTrigramme("Unknown Region")).toBeUndefined();
  });
});
