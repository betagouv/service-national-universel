import { ClsModule, ClsService } from "nestjs-cls";
import { Test, TestingModule } from "@nestjs/testing";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

import { ValiderAffectationHTSService } from "./ValiderAffectationHTS.service";
import { YOUNG_STATUS } from "snu-lib";
import { JeuneModel } from "../../jeune/Jeune.model";
import { RapportData } from "./SimulationAffectationHTS.service";
import { SejourModel } from "../sejour/Sejour.model";
import { FunctionalException } from "@shared/core/FunctionalException";
import { Logger } from "@nestjs/common";

type JeuneRapportData = RapportData["jeunesNouvellementAffectedList"][0];

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("ValiderAffectationHTS Service", () => {
    let validerAffectationHTSService: ValiderAffectationHTSService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ClsModule],
            providers: [
                Logger,
                ValiderAffectationHTSService,
                {
                    provide: FileGateway,
                    useValue: {},
                },

                {
                    provide: TaskGateway,
                    useValue: {},
                },
            ],
        }).compile();
        validerAffectationHTSService = module.get<ValiderAffectationHTSService>(ValiderAffectationHTSService);
    });

    describe("ValiderAffectationHTSService", () => {
        it('should return "jeune n\'ayant pas le statut validé" when young status is not VALIDATED', () => {
            const jeuneRapport = { sejourId: "1" } as JeuneRapportData;
            const jeune = { id: "1", statut: YOUNG_STATUS.IN_PROGRESS } as JeuneModel;

            const result = validerAffectationHTSService.checkValiderAffectation(jeuneRapport, jeune);

            expect(result).toBe("jeune n'ayant pas le statut validé");
        });

        it("should throw FunctionalException when sejour is not found", () => {
            const jeuneRapport = { sejourId: "1" } as JeuneRapportData;
            const jeune = { id: "1", statut: YOUNG_STATUS.VALIDATED } as JeuneModel;

            expect(() => validerAffectationHTSService.checkValiderAffectation(jeuneRapport, jeune)).toThrow(
                FunctionalException,
            );
        });

        it('should return "plus de place pour ce sejour" when sejour has no places', () => {
            const jeuneRapport = { sejourId: "1" } as JeuneRapportData;
            const jeune = { id: "1", statut: YOUNG_STATUS.VALIDATED } as JeuneModel;
            const sejour = { id: "1", placesRestantes: 0 } as SejourModel;

            const result = validerAffectationHTSService.checkValiderAffectation(jeuneRapport, jeune, sejour);

            expect(result).toBe("plus de place pour ce sejour");
        });

        it('should return "jeune ayant changé de cohorte depuis la simulation" when young sessionNom does not match sejour sessionNom', () => {
            const jeuneRapport = { sejourId: "1" } as JeuneRapportData;
            const jeune = { id: "1", statut: YOUNG_STATUS.VALIDATED, sessionNom: "session1" } as JeuneModel;
            const sejour = { id: "1", placesRestantes: 1, sessionNom: "session2" } as SejourModel;

            const result = validerAffectationHTSService.checkValiderAffectation(jeuneRapport, jeune, sejour);

            expect(result).toBe("jeune ayant changé de cohorte depuis la simulation");
        });

        it("should return null when all conditions are met", () => {
            const jeuneRapport = { sejourId: "1" } as JeuneRapportData;
            const jeune = { id: "1", statut: YOUNG_STATUS.VALIDATED, sessionNom: "session1" } as JeuneModel;
            const sejour = { id: "1", placesRestantes: 1, sessionNom: "session1" } as SejourModel;

            const result = validerAffectationHTSService.checkValiderAffectation(jeuneRapport, jeune, sejour);

            expect(result).toBeNull();
        });
    });
});
