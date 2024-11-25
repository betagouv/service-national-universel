import { Test, TestingModule } from "@nestjs/testing";
import { ClasseGuardService } from "./ClasseGuard.service";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";

describe("ClasseGuard.service", () => {
    let service: ClasseGuardService;
    let classeGateway: ClasseGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClasseGuardService,
                {
                    provide: ClasseGateway,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ClasseGuardService>(ClasseGuardService);
        classeGateway = module.get<ClasseGateway>(ClasseGateway);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("findClasse", () => {
        it("should return the classe from the request if it exists", async () => {
            const request = {
                classe: { id: "testId" },
            };
            const result = await service.findClasse(request);
            expect(result).toEqual(request.classe);
        });

        it("should call classeGateway.findById if the classe does not exist in the request", async () => {
            const request = {
                params: { id: "testId" },
            };
            const classe = { id: "testId" };
            jest.spyOn(classeGateway, "findById").mockResolvedValue(classe as any);
            const result = await service.findClasse(request);
            expect(classeGateway.findById).toHaveBeenCalledWith(request.params.id);
            expect(result).toEqual(classe);
        });

        it("should throw an error if the classe is not found", async () => {
            const request = {
                params: { id: "testId" },
            };
            jest.spyOn(classeGateway, "findById").mockRejectedValue(new Error("Classe not found"));
            await expect(service.findClasse(request)).rejects.toThrow("Classe not found");
        });

        it("should not call classeGateway.findById the second time if the classe exists in the request", async () => {
            const request = {
                params: { id: "testId" },
            } as any;
            const classe = { id: "testId" };
            jest.spyOn(classeGateway, "findById").mockResolvedValue(classe as any);
            request.classe = await service.findClasse(request);
            await service.findClasse(request);
            expect(classeGateway.findById).toHaveBeenCalledTimes(1);
        });
    });
});
