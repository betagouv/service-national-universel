import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneService } from "./Campagne.service";

describe("CampagneService.findById - identifiant invalide (GOO-158, PL15)", () => {
    const campagneGateway = { findById: jest.fn() };
    let service: CampagneService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new CampagneService(campagneGateway as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    });

    it("lève CAMPAIGN_NOT_FOUND sans interroger la base quand l'identifiant n'est pas un ObjectId", async () => {
        const erreur = await service.findById("zzz").catch((e) => e);

        expect(erreur).toBeInstanceOf(FunctionalException);
        expect(erreur.message).toBe(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        expect(campagneGateway.findById).not.toHaveBeenCalled();
    });

    it("interroge la base pour un ObjectId valide", async () => {
        campagneGateway.findById.mockResolvedValue({ id: "aaaaaaaaaaaaaaaaaaaaaaaa" });

        await expect(service.findById("aaaaaaaaaaaaaaaaaaaaaaaa")).resolves.toEqual({ id: "aaaaaaaaaaaaaaaaaaaaaaaa" });
    });
});
