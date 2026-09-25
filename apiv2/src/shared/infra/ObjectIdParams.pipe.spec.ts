import { BadRequestException } from "@nestjs/common";
import { ObjectIdParamsPipe } from "./ObjectIdParams.pipe";

describe("ObjectIdParamsPipe", () => {
    const pipe = new ObjectIdParamsPipe();
    const param = (data: string) => ({ type: "param" as const, data });

    it.each(["id", "sessionId", "taskId", "centreId"])("rejette en 400 un %s qui n'est pas un ObjectId", (nom) => {
        expect(() => pipe.transform("abc", param(nom))).toThrow(BadRequestException);
    });

    it("rejette une chaîne de 12 caractères, que mongoose accepterait comme ObjectId", () => {
        expect(() => pipe.transform("aaaaaaaaaaaa", param("id"))).toThrow(BadRequestException);
    });

    it("laisse passer un ObjectId valide", () => {
        expect(pipe.transform("6600000000000000000000aa", param("sessionId"))).toBe("6600000000000000000000aa");
    });

    it("ignore les paramètres qui ne sont pas des identifiants, les corps et les requêtes", () => {
        expect(pipe.transform("HTS", param("type"))).toBe("HTS");
        expect(pipe.transform("abc", { type: "query", data: "id" })).toBe("abc");
        expect(pipe.transform({ id: "abc" }, { type: "body" })).toEqual({ id: "abc" });
        expect(pipe.transform({ id: "abc" }, { type: "param" })).toEqual({ id: "abc" });
    });
});
