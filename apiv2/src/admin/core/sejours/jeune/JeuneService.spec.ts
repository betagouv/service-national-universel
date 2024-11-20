import { Test, TestingModule } from "@nestjs/testing";
import { JeuneService } from "./Jeune.service";
import { JeuneGateway } from "./Jeune.gateway";

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
});
