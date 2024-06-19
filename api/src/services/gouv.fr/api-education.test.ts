import { apiEducation } from "./api-education";

describe("apiEducation", () => {
  it("should return an array of EtablissementProviderDto", async () => {
    const result = await apiEducation({
      filters: [{ key: "city", value: "Bordeaux" }],
      page: 0,
      size: 1,
    });
    expect(result[0]).toHaveProperty("identifiant_de_l_etablissement");
    expect(result[0]).toHaveProperty("nom_etablissement");
    expect(result[0]).toHaveProperty("siren_siret");
  });
});
