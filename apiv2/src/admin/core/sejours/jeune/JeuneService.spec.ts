import { Test, TestingModule } from "@nestjs/testing";
import { JeuneService } from "./Jeune.service";
import { JeuneGateway } from "./Jeune.gateway";
import { JeuneModel } from "./Jeune.model";
import { YOUNG_STATUS } from "snu-lib";

describe("Jeune.service", () => {
    let service: JeuneService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JeuneService,
                {
                    provide: JeuneGateway,
                    useValue: {
                        findAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<JeuneService>(JeuneService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("groupJeunesByReponseAuxAffectations", () => {
        it("should group jeunes by categories", () => {
            const jeunes: JeuneModel[] = [
                { sessionId: "sessionId1", statut: YOUNG_STATUS.WITHDRAWN, youngPhase1Agreement: "true" } as JeuneModel,
                {
                    sessionId: "sessionId1",
                    statut: YOUNG_STATUS.VALIDATED,
                    youngPhase1Agreement: "false",
                } as JeuneModel,
                { sessionId: "sessionId2", statut: YOUNG_STATUS.VALIDATED, youngPhase1Agreement: "true" } as JeuneModel,
            ];

            const result = service.groupJeunesByReponseAuxAffectations(jeunes, "sessionId1");

            expect(result).toEqual({
                jeunesAutreSession: [jeunes[2]],
                jeunesDesistes: [jeunes[0]],
                jeunesConfirmes: [],
                jeunesNonConfirmes: [jeunes[1]],
            });
        });
    });
});
