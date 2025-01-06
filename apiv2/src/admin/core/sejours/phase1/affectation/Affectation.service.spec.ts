import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { AffectationService } from "./Affectation.service";
import { SessionGateway } from "../session/Session.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { CentreGateway } from "../centre/Centre.gateway";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";

describe("AffectationService", () => {
    let affectationService: AffectationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AffectationService,
                Logger,
                {
                    provide: TaskGateway,
                    useValue: {},
                },
                {
                    provide: SessionGateway,
                    useValue: {},
                },
                {
                    provide: JeuneGateway,
                    useValue: {},
                },
                {
                    provide: LigneDeBusGateway,
                    useValue: {},
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: {},
                },
                {
                    provide: SejourGateway,
                    useValue: {},
                },
                {
                    provide: CentreGateway,
                    useValue: {},
                },
                {
                    provide: PlanDeTransportGateway,
                    useValue: {},
                },
            ],
        }).compile();

        affectationService = module.get<AffectationService>(AffectationService);
    });

    it("should correctly format the percentage", () => {
        expect(affectationService.formatPourcent(0.5)).toBe("50.00%");
        expect(affectationService.formatPourcent(0.1234)).toBe("12.34%");
        expect(affectationService.formatPourcent(0)).toBe("0.00%");
        expect(affectationService.formatPourcent(1)).toBe("100.00%");
        expect(affectationService.formatPourcent(null as any)).toBe("");
        expect(affectationService.formatPourcent(undefined as any)).toBe("");
        expect(affectationService.formatPourcent(NaN)).toBe("");
    });
});
