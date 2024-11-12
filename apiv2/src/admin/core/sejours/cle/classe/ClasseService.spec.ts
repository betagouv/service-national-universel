import { Test, TestingModule } from "@nestjs/testing";
import { ClasseService } from "./Classe.service";
import { ClasseGateway } from "./Classe.gateway";
import { ClasseRepository } from "src/admin/infra/sejours/cle/classe/repository/mongo/ClasseMongo.repository";

describe("Classe.service", () => {
    let service: ClasseService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClasseService,
                {
                    provide: ClasseGateway,
                    useValue: ClasseRepository,
                },
            ],
        }).compile();

        service = module.get<ClasseService>(ClasseService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
