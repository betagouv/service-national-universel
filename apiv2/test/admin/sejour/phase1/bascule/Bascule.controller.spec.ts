import { Test, TestingModule } from "@nestjs/testing";
import { BasculeController } from "@admin/infra/sejours/phase1/bascule/api/Bascule.controller";
import { BasculeCLEtoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeCLEtoCLE";
import { BasculeCLEtoHTS } from "@admin/core/sejours/phase1/bascule/useCase/BasculeCLEtoHTS";
import { BasculeHTStoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeHTStoCLE";
import { BasculeHTStoHTS } from "@admin/core/sejours/phase1/bascule/useCase/BasculeHTStoHTS";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { JeuneReferentGuard } from "@admin/infra/sejours/jeune/guard/JeuneReferent.guard";
import { ChangerLaSessionDuJeunePayloadDto } from "@admin/infra/sejours/phase1/bascule/api/Bascule.validation";
import { YOUNG_SOURCE } from "snu-lib";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";

describe("BasculeController", () => {
    let controller: BasculeController;
    let jeuneGateway: jest.Mocked<JeuneGateway>;
    let basculeCLEtoCLE: jest.Mocked<BasculeCLEtoCLE>;
    let basculeCLEtoHTS: jest.Mocked<BasculeCLEtoHTS>;
    let basculeHTStoCLE: jest.Mocked<BasculeHTStoCLE>;
    let basculeHTStoHTS: jest.Mocked<BasculeHTStoHTS>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BasculeController],
            providers: [
                { provide: BasculeCLEtoCLE, useValue: { execute: jest.fn() } },
                { provide: BasculeCLEtoHTS, useValue: { execute: jest.fn() } },
                { provide: BasculeHTStoCLE, useValue: { execute: jest.fn() } },
                { provide: BasculeHTStoHTS, useValue: { execute: jest.fn() } },
                { provide: JeuneGateway, useValue: { findById: jest.fn() } },
            ],
        })
            .overrideGuard(JeuneReferentGuard)
            .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
            .compile();

        controller = module.get<BasculeController>(BasculeController);
        jeuneGateway = module.get(JeuneGateway);
        basculeCLEtoCLE = module.get(BasculeCLEtoCLE);
        basculeCLEtoHTS = module.get(BasculeCLEtoHTS);
        basculeHTStoCLE = module.get(BasculeHTStoCLE);
        basculeHTStoHTS = module.get(BasculeHTStoHTS);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("changeCohort", () => {
        const jeuneMock: JeuneModel = { id: "1", source: YOUNG_SOURCE.CLE } as JeuneModel;

        it("should call basculeCLEtoCLE.execute when both sources are CLE", async () => {
            jeuneGateway.findById.mockResolvedValue(jeuneMock);
            const clePayload: ChangerLaSessionDuJeunePayloadDto = {
                source: YOUNG_SOURCE.CLE,
                cohortId: "fakeCohortId",
                etablissementId: "fakeEtablissementId",
                classeId: "fakeClasseId",
            };

            await controller.changeCohort("1", clePayload);

            expect(jeuneGateway.findById).toHaveBeenCalledWith("1");
            expect(basculeCLEtoCLE.execute).toHaveBeenCalledWith("1", clePayload);
        });

        it("should call basculeCLEtoHTS.execute when jeune source is CLE and payload source is VOLONTAIRE", async () => {
            jeuneGateway.findById.mockResolvedValue({ ...jeuneMock, source: YOUNG_SOURCE.CLE });
            const volontairePayload: ChangerLaSessionDuJeunePayloadDto = {
                source: YOUNG_SOURCE.VOLONTAIRE,
                cohortId: "fakeCohortId",
                cohortDetailedChangeReason: "fakeReason",
                cohortChangeReason: "fakeReason",
            };

            await controller.changeCohort("1", volontairePayload);

            expect(jeuneGateway.findById).toHaveBeenCalledWith("1");
            expect(basculeCLEtoHTS.execute).toHaveBeenCalledWith("1", volontairePayload);
        });

        it("should call basculeHTStoCLE.execute when jeune source is VOLONTAIRE and payload source is CLE", async () => {
            jeuneGateway.findById.mockResolvedValue({ ...jeuneMock, source: YOUNG_SOURCE.VOLONTAIRE });
            const clePayload: ChangerLaSessionDuJeunePayloadDto = {
                source: YOUNG_SOURCE.CLE,
                cohortId: "fakeCohortId",
                etablissementId: "fakeEtablissementId",
                classeId: "fakeClasseId",
            };

            await controller.changeCohort("1", clePayload);

            expect(jeuneGateway.findById).toHaveBeenCalledWith("1");
            expect(basculeHTStoCLE.execute).toHaveBeenCalledWith("1", clePayload);
        });

        it("should call basculeHTStoHTS.execute when both sources are VOLONTAIRE", async () => {
            jeuneGateway.findById.mockResolvedValue({ ...jeuneMock, source: YOUNG_SOURCE.VOLONTAIRE });
            const volontairePayload: ChangerLaSessionDuJeunePayloadDto = {
                source: YOUNG_SOURCE.VOLONTAIRE,
                cohortId: "fakeCohortId",
                cohortDetailedChangeReason: "fakeReason",
                cohortChangeReason: "fakeReason",
            };

            await controller.changeCohort("1", volontairePayload);

            expect(jeuneGateway.findById).toHaveBeenCalledWith("1");
            expect(basculeHTStoHTS.execute).toHaveBeenCalledWith("1", volontairePayload);
        });

        it("should return the jeune object if no conditions are met", async () => {
            jeuneGateway.findById.mockResolvedValue({ ...jeuneMock, source: YOUNG_SOURCE.VOLONTAIRE });
            const otherPayload = { source: "ANOTHER_SOURCE" } as any;

            const result = await controller.changeCohort("1", otherPayload);

            expect(jeuneGateway.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual({ ...jeuneMock, source: "OTHER_SOURCE" });
            expect(basculeCLEtoCLE.execute).not.toHaveBeenCalled();
            expect(basculeCLEtoHTS.execute).not.toHaveBeenCalled();
            expect(basculeHTStoCLE.execute).not.toHaveBeenCalled();
            expect(basculeHTStoHTS.execute).not.toHaveBeenCalled();
        });
    });
});
