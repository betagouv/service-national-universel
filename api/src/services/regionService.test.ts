import { regionList } from "snu-lib";
import { mapRegionToTrigramme, mapTrigrammeToRegion } from "./regionService";

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

describe("mapTrigrammeToRegion", () => {
  it("should map trigramme to region correctly", () => {
    expect(mapTrigrammeToRegion("ARA")).toBe("Auvergne-Rhône-Alpes");
    expect(mapTrigrammeToRegion("BFC")).toBe("Bourgogne-Franche-Comté");
    expect(mapTrigrammeToRegion("BRE")).toBe("Bretagne");
    expect(mapTrigrammeToRegion("CVL")).toBe("Centre-Val de Loire");
    expect(mapTrigrammeToRegion("COR")).toBe("Corse");
    expect(mapTrigrammeToRegion("GES")).toBe("Grand Est");
    expect(mapTrigrammeToRegion("GUA")).toBe("Guadeloupe");
    expect(mapTrigrammeToRegion("GUY")).toBe("Guyane");
    expect(mapTrigrammeToRegion("HDF")).toBe("Hauts-de-France");
    expect(mapTrigrammeToRegion("IDF")).toBe("Île-de-France");
    expect(mapTrigrammeToRegion("REU")).toBe("La Réunion");
    expect(mapTrigrammeToRegion("MAR")).toBe("Martinique");
    expect(mapTrigrammeToRegion("MAY")).toBe("Mayotte");
    expect(mapTrigrammeToRegion("NOR")).toBe("Normandie");
    expect(mapTrigrammeToRegion("NAQ")).toBe("Nouvelle-Aquitaine");
    expect(mapTrigrammeToRegion("OCC")).toBe("Occitanie");
    expect(mapTrigrammeToRegion("PDL")).toBe("Pays de la Loire");
    expect(mapTrigrammeToRegion("PAC")).toBe("Provence-Alpes-Côte d'Azur");
    expect(mapTrigrammeToRegion("NCA")).toBe("Nouvelle-Calédonie");
  });

  it("should return undefined for unknown trigramme", () => {
    expect(mapTrigrammeToRegion("XYZ")).toBeUndefined();
  });
});
