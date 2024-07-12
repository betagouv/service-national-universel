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
        { etablissement: { uai: "sameUaiDifferentEmail" }, referentEtablissement: { email: "test1@test.com" }, classe: { name: "a", coloration: "", estimatedSeats: 0 } },
        { etablissement: { uai: "sameUaiDifferentEmail" }, referentEtablissement: { email: "test2@test.com" }, classe: { name: "b", coloration: "", estimatedSeats: 0 } },
        { etablissement: { uai: "sameUaiSameEmail" }, referentEtablissement: { email: "test3@test.com" }, classe: { name: "c", coloration: "", estimatedSeats: 0 } },
        { etablissement: { uai: "sameUaiSameEmail" }, referentEtablissement: { email: "test3@test.com" }, classe: { name: "d", coloration: "", estimatedSeats: 0 } },
        { etablissement: { uai: "8910" }, referentEtablissement: { email: "sameUaiSameEmail@test.com" }, classe: { name: "e", coloration: "", estimatedSeats: 0 } },
        { etablissement: { uai: "" }, referentEtablissement: { email: "pasduai@test.com" }, classe: { name: "f", coloration: "", estimatedSeats: 0 } },
        { etablissement: { uai: "pasdemail" }, referentEtablissement: { email: "" }, classe: { name: "g", coloration: "", estimatedSeats: 0 } },
        {
          numberDS: 1,
          etablissement: { uai: "sameUniqueId" },
          referentEtablissement: { email: "sameUniqueId@test.com" },
          classe: { name: "d", coloration: "a", estimatedSeats: 0 },
        },
        {
          numberDS: 2,
          etablissement: { uai: "sameUniqueId" },
          referentEtablissement: { email: "sameUniqueId@test.com" },
          classe: { name: "d", coloration: "a", estimatedSeats: 0 },
        },
      ] as IAppelAProjet[];

      const result = service.filterAppelAProjetsSameUaiButDifferentEmailChefEtablissement(appelAProjets, {});
      const expectedResult = {
        retained: [
          {
            etablissement: {
              uai: "sameUaiDifferentEmail",
            },
            referentEtablissement: {
              email: "test1@test.com",
            },
            classe: {
              name: "a",
              coloration: "",
              estimatedSeats: 0,
            },
          },
          {
            etablissement: {
              uai: "sameUaiDifferentEmail",
            },
            referentEtablissement: {
              email: "test2@test.com",
            },
            classe: {
              name: "b",
              coloration: "",
              estimatedSeats: 0,
            },
          },
          {
            etablissement: {
              uai: "sameUaiSameEmail",
            },
            referentEtablissement: {
              email: "test3@test.com",
            },
            classe: {
              name: "c",
              coloration: "",
              estimatedSeats: 0,
            },
          },
          {
            etablissement: {
              uai: "sameUaiSameEmail",
            },
            referentEtablissement: {
              email: "test3@test.com",
            },
            classe: {
              name: "d",
              coloration: "",
              estimatedSeats: 0,
            },
          },
          {
            etablissement: {
              uai: "8910",
            },
            referentEtablissement: {
              email: "sameUaiSameEmail@test.com",
            },
            classe: {
              name: "e",
              coloration: "",
              estimatedSeats: 0,
            },
          },
          {
            numberDS: 1,
            etablissement: {
              uai: "sameUniqueId",
            },
            referentEtablissement: {
              email: "sameUniqueId@test.com",
            },
            classe: {
              name: "d",
              coloration: "a",
              estimatedSeats: 0,
            },
          },
          {
            numberDS: 2,
            etablissement: {
              uai: "sameUniqueId",
            },
            referentEtablissement: {
              email: "sameUniqueId@test.com",
            },
            classe: {
              name: "d",
              coloration: "a",
              estimatedSeats: 0,
            },
          },
        ],
        warning: [
          {
            etablissement: {
              uai: "sameUaiDifferentEmail",
            },
            referentEtablissement: {
              email: "test1@test.com",
            },
            classe: {
              name: "a",
              coloration: "",
              estimatedSeats: 0,
            },
            removedReason: "sameUaiDifferentEmail",
          },
          {
            etablissement: {
              uai: "sameUaiDifferentEmail",
            },
            referentEtablissement: {
              email: "test2@test.com",
            },
            classe: {
              name: "b",
              coloration: "",
              estimatedSeats: 0,
            },
            removedReason: "sameUaiDifferentEmail",
          },
          {
            numberDS: 1,
            etablissement: {
              uai: "sameUniqueId",
            },
            referentEtablissement: {
              email: "sameUniqueId@test.com",
            },
            classe: {
              name: "d",
              coloration: "a",
              estimatedSeats: 0,
            },
            removedReason: "sameClasseUniqueId",
          },
          {
            numberDS: 2,
            etablissement: {
              uai: "sameUniqueId",
            },
            referentEtablissement: {
              email: "sameUniqueId@test.com",
            },
            classe: {
              name: "d",
              coloration: "a",
              estimatedSeats: 0,
            },
            removedReason: "sameClasseUniqueId",
          },
        ],
        removed: [
          {
            etablissement: {
              uai: "",
            },
            referentEtablissement: {
              email: "pasduai@test.com",
            },
            classe: {
              name: "f",
              coloration: "",
              estimatedSeats: 0,
            },
            removedReason: "noUaiOrEmail",
          },
          {
            etablissement: {
              uai: "pasdemail",
            },
            referentEtablissement: {
              email: "",
            },
            classe: {
              name: "g",
              coloration: "",
              estimatedSeats: 0,
            },
            removedReason: "noUaiOrEmail",
          },
        ],
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
