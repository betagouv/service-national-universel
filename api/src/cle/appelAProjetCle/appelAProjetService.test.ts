import { AppelAProjetService } from "./appelAProjetService";
import { IAppelAProjet } from "./appelAProjetType";

describe("AppelAProjetService", () => {
  let service: AppelAProjetService;

  beforeEach(() => {
    service = new AppelAProjetService();
  });

  describe("appelAProjetsFilteredOutSameUaiButDifferentEmailChefEtablissement", () => {
    it("should filter out appelAProjets with same UAI but different email chefEtablissement", () => {
      const appelAProjets = [
        { etablissement: { uai: "sameUaiDifferentEmail" }, referentEtablissement: { email: "test1@test.com" } },
        { etablissement: { uai: "sameUaiDifferentEmail" }, referentEtablissement: { email: "test2@test.com" } },
        { etablissement: { uai: "sameUaiSameEmail" }, referentEtablissement: { email: "test3@test.com" } },
        { etablissement: { uai: "sameUaiSameEmail" }, referentEtablissement: { email: "test3@test.com" } },
        { etablissement: { uai: "8910" }, referentEtablissement: { email: "sameUaiSameEmail@test.com" } },
        { etablissement: { uai: "" }, referentEtablissement: { email: "pasduai@test.com" } },
        { etablissement: { uai: "pasdemail" }, referentEtablissement: { email: "" } },
      ] as IAppelAProjet[];

      const result = service.filterAppelAProjetsSameUaiButDifferentEmailChefEtablissement(appelAProjets);

      const expectedResult = {
        retained: [
          { etablissement: { uai: "sameUaiSameEmail" }, referentEtablissement: { email: "test3@test.com" } },
          { etablissement: { uai: "sameUaiSameEmail" }, referentEtablissement: { email: "test3@test.com" } },
          { etablissement: { uai: "8910" }, referentEtablissement: { email: "sameUaiSameEmail@test.com" } },
        ],
        removed: [
          { etablissement: { uai: "sameUaiDifferentEmail" }, referentEtablissement: { email: "test1@test.com" }, removedReason: "sameUaiDifferentEmail" },
          { etablissement: { uai: "sameUaiDifferentEmail" }, referentEtablissement: { email: "test2@test.com" }, removedReason: "sameUaiDifferentEmail" },
          { etablissement: { uai: "" }, referentEtablissement: { email: "pasduai@test.com" }, removedReason: "noUaiOrEmail" },
          { etablissement: { uai: "pasdemail" }, referentEtablissement: { email: "" }, removedReason: "noUaiOrEmail" },
        ],
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
