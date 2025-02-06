import { Test, TestingModule } from "@nestjs/testing";
import { JeuneGuardService } from "./JeuneGuard.service";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";

describe("JeuneGuard.service", () => {
    let service: JeuneGuardService;
    let jeuneGateway: JeuneGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JeuneGuardService,
                {
                    provide: JeuneGateway,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<JeuneGuardService>(JeuneGuardService);
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("findJeune", () => {
        it("should return the jeune from the request if it exists", async () => {
            const request = {
                jeune: { id: "testId" },
            };
            const result = await service.findJeune(request);
            expect(result).toEqual(request.jeune);
        });

        it("should call jeuneGateway.findById if the jeune does not exist in the request", async () => {
            const request = {
                params: { id: "testId" },
            };
            const jeune = { id: "testId" };
            jest.spyOn(jeuneGateway, "findById").mockResolvedValue(jeune as any);
            const result = await service.findJeune(request);
            expect(jeuneGateway.findById).toHaveBeenCalledWith(request.params.id);
            expect(result).toEqual(jeune);
        });

        it("should throw an error if the jeune is not found", async () => {
            const request = {
                params: { id: "testId" },
            };
            jest.spyOn(jeuneGateway, "findById").mockRejectedValue(new Error("Jeune not found"));
            await expect(service.findJeune(request)).rejects.toThrow("Jeune not found");
        });

        it("should not call jeuneGateway.findById the second time if the jeune exists in the request", async () => {
            const request = {
                params: { id: "testId" },
            } as any;
            const jeune = { id: "testId" };
            jest.spyOn(jeuneGateway, "findById").mockResolvedValue(jeune as any);
            request.jeune = await service.findJeune(request);
            await service.findJeune(request);
            expect(jeuneGateway.findById).toHaveBeenCalledTimes(1);
        });
    });
});
