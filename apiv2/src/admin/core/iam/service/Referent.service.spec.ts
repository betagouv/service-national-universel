import { Test, TestingModule } from "@nestjs/testing";
import { ROLES } from "snu-lib";
import { ReferentGateway } from "../Referent.gateway";
import { ReferentModel } from "../Referent.model";
import { ReferentService } from "./Referent.service";
import { FunctionalException } from "@shared/core/FunctionalException";

describe("ReferentService", () => {
    let service: ReferentService;
    let referentGateway: ReferentGateway;

    const mockReferent: ReferentModel = {
        id: "1",
        email: "test@example.com",
        prenom: "John",
        nom: "Doe",
        metadata: {},
        region: "",
        invitationToken: "",
        role: ROLES.REFERENT_CLASSE,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReferentService,
                {
                    provide: ReferentGateway,
                    useValue: {
                        findByEmail: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ReferentService>(ReferentService);
        referentGateway = module.get<ReferentGateway>(ReferentGateway);
    });

    describe("findByEmail", () => {
        it("should return a referent when email exists", async () => {
            const email = "test@example.com";
            (referentGateway.findByEmail as jest.Mock).mockResolvedValue(mockReferent);

            const result = await service.findByEmail(email);

            expect(referentGateway.findByEmail).toHaveBeenCalledWith(email);
            expect(result).toEqual(mockReferent);
        });

        it("should throw an error when email does not exist", async () => {
            const email = "nonexistent@example.com";
            (referentGateway.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(service.findByEmail(email)).rejects.toThrow(FunctionalException);
        });
    });
});
