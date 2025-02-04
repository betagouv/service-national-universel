import { Test, TestingModule } from "@nestjs/testing";
import { BasculeController } from "@admin/infra/sejours/phase1/bascule/api/Bascule.controller";
import { BasculeCLEtoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeCLEtoCLE";
import { BasculeHTStoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeHTStoCLE";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { JeuneReferentGuard } from "@admin/infra/sejours/jeune/guard/JeuneReferent.guard";
import { ChangerLaSessionDuJeunePayloadDto } from "@admin/infra/sejours/phase1/bascule/api/Bascule.validation";
import { YOUNG_SOURCE } from "snu-lib";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";
import { CustomRequest } from "@shared/infra/CustomRequest";

describe("BasculeController", () => {
    let controller: BasculeController;
    let jeuneGateway: jest.Mocked<JeuneGateway>;
    let basculeCLEtoCLE: jest.Mocked<BasculeCLEtoCLE>;
    let basculeHTStoCLE: jest.Mocked<BasculeHTStoCLE>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BasculeController],
            providers: [
                { provide: BasculeCLEtoCLE, useValue: { execute: jest.fn() } },
                { provide: BasculeHTStoCLE, useValue: { execute: jest.fn() } },
                { provide: JeuneGateway, useValue: { findById: jest.fn() } },
            ],
        })
            .overrideGuard(JeuneReferentGuard)
            .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
            .compile();

        controller = module.get<BasculeController>(BasculeController);
        jeuneGateway = module.get(JeuneGateway);
        basculeCLEtoCLE = module.get(BasculeCLEtoCLE);
        basculeHTStoCLE = module.get(BasculeHTStoCLE);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("changeCohort", () => {
        const jeuneMock: JeuneModel = { id: "1", source: YOUNG_SOURCE.CLE } as JeuneModel;
        const userMock = {
            id: "1",
            email: "email",
        };

        const requestMock = { user: userMock } as CustomRequest;

        it("should call basculeCLEtoCLE.execute when both sources are CLE", async () => {
            jeuneGateway.findById.mockResolvedValue(jeuneMock);
            const clePayload: ChangerLaSessionDuJeunePayloadDto = {
                source: YOUNG_SOURCE.CLE,
                cohortId: "fakeCohortId",
                etablissementId: "fakeEtablissementId",
                classeId: "fakeClasseId",
            };

            await controller.changeCohort("1", clePayload, requestMock);

            expect(jeuneGateway.findById).toHaveBeenCalledWith("1");
            expect(basculeCLEtoCLE.execute).toHaveBeenCalledWith("1", clePayload, userMock);
        });

        it("should call basculeHTStoCLE.execute when jeune source is VOLONTAIRE and payload source is CLE", async () => {
            jeuneGateway.findById.mockResolvedValue({ ...jeuneMock, source: YOUNG_SOURCE.VOLONTAIRE });
            const clePayload: ChangerLaSessionDuJeunePayloadDto = {
                source: YOUNG_SOURCE.CLE,
                cohortId: "fakeCohortId",
                etablissementId: "fakeEtablissementId",
                classeId: "fakeClasseId",
            };

            await controller.changeCohort("1", clePayload, requestMock);

            expect(jeuneGateway.findById).toHaveBeenCalledWith("1");
            expect(basculeHTStoCLE.execute).toHaveBeenCalledWith("1", clePayload, userMock);
        });

        it("should return the jeune object if no conditions are met", async () => {
            jeuneGateway.findById.mockResolvedValue({ ...jeuneMock, source: YOUNG_SOURCE.VOLONTAIRE });
            const otherPayload = { source: "ANOTHER_SOURCE" } as any;

            await expect(controller.changeCohort("1", otherPayload, requestMock)).rejects.toThrow(
                "Unhandled source combination",
            );

            expect(jeuneGateway.findById).toHaveBeenCalledWith("1");
            expect(basculeCLEtoCLE.execute).not.toHaveBeenCalled();
            expect(basculeHTStoCLE.execute).not.toHaveBeenCalled();
        });
    });
});
