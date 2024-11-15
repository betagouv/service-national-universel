import { Test, TestingModule } from "@nestjs/testing";
import { JeuneService } from "./Jeune.service";
import { JeuneGateway } from "./Jeune.gateway";

import { JeuneRepository } from "src/admin/infra/sejours/jeune/repository/mongo/JeuneMongo.repository";

describe("Jeune.service", () => {
    let service: JeuneService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JeuneService,
                {
                    provide: JeuneGateway,
                    useValue: JeuneRepository,
                },
            ],
        }).compile();

        service = module.get<JeuneService>(JeuneService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
