import { INestApplication } from "@nestjs/common";
import mongoose, { Model } from "mongoose";
import { STATUS_CLASSE } from "snu-lib";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { CLASSE_MONGOOSE_ENTITY, ClasseDocument } from "@admin/infra/sejours/cle/classe/provider/ClasseMongo.provider";
import { setupAdminTest } from "../../../setUpAdminTest";
import { createClasse } from "./ClasseHelper";

describe("ClasseGateway", () => {
    let classeGateway: ClasseGateway;
    let app: INestApplication;
    let classeMongoose: Model<ClasseDocument>;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        classeGateway = module.get<ClasseGateway>(ClasseGateway);
        classeMongoose = module.get<Model<ClasseDocument>>(CLASSE_MONGOOSE_ENTITY);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    it("should be defined", () => {
        expect(classeGateway).toBeDefined();
    });

    describe("update", () => {
        it("should update a classe add document into classe_patches", async () => {
            const createdClasse = await createClasse({
                nom: "Classe Test",
                statut: STATUS_CLASSE.CREATED,
            });

            const expectedClasse: ClasseModel = {
                ...createdClasse,
                nom: "Updated Test Class",
            };

            const result = await classeGateway.update({ ...createdClasse, nom: "Updated Test Class" });
            expect(result).toEqual(expectedClasse);

            const classeDocument = await classeMongoose.findById(createdClasse.id);
            //@ts-ignore
            const classePatches = await classeDocument.patches
                .find({
                    ref: new mongoose.Types.ObjectId(createdClasse.id),
                })
                .sort("-date");
            const classePatche = classePatches[0];

            expect(classePatche.modelName).toEqual("classe");
            expect(classePatche.ops).toHaveLength(1);
            expect(classePatche.ops).toEqual([
                { op: "replace", path: "/name", value: "Updated Test Class", originalValue: "Classe Test" },
            ]);
        });
    });
});
