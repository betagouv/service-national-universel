import "reflect-metadata";
import { IsNotEmpty, IsString } from "class-validator";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { ObjectIdParamsPipe, pipesGlobaux } from "@shared/infra/ObjectIdParams.pipe";
import { SearchYoungDto } from "@analytics/infra/api/dto/SearchYoung.validation";

class DtoDeTest {
    @IsString()
    @IsNotEmpty()
    nom: string;
}

describe("pipesGlobaux (GOO-90)", () => {
    it("contient un ObjectIdParamsPipe et un ValidationPipe", () => {
        const pipes = pipesGlobaux();
        expect(pipes).toHaveLength(2);
        expect(pipes[0]).toBeInstanceOf(ObjectIdParamsPipe);
        expect(pipes[1]).toBeInstanceOf(ValidationPipe);
    });

    it("le ValidationPipe rejette un champ non déclaré (liste blanche, GOO-90/PC1)", async () => {
        const [, validationPipe] = pipesGlobaux();
        await expect(
            validationPipe.transform({ nom: "x", role: "admin" }, { type: "body", metatype: DtoDeTest }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("le ValidationPipe accepte un corps ne contenant que des champs déclarés", async () => {
        const [, validationPipe] = pipesGlobaux();
        const resultat = await validationPipe.transform({ nom: "x" }, { type: "body", metatype: DtoDeTest });
        expect(resultat).toEqual({ nom: "x" });
    });

    it("SearchYoungDto.filters (@IsObject() sans @ValidateNested()) reste accepté avec la liste blanche", async () => {
        const [, validationPipe] = pipesGlobaux();
        const resultat = await validationPipe.transform(
            { filters: { status: ["VALIDATED"] } },
            { type: "body", metatype: SearchYoungDto },
        );
        expect((resultat as SearchYoungDto).filters).toEqual({ status: ["VALIDATED"] });
    });
});
