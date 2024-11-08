import { INestApplication } from "@nestjs/common";
import mongoose, { Model } from "mongoose";

import { ReferentGateway } from "src/admin/core/iam/Referent.gateway";
import { ReferentModel } from "src/admin/core/iam/Referent.model";
import { REFERENT_MONGOOSE_ENTITY, ReferentDocument } from "src/admin/infra/iam/provider/ReferentMongo.provider";
import { setupAdminTest } from "../setUpAdminTest";
import { createReferent } from "./ReferentHelper";
import { ClsService } from "nestjs-cls";
import { id } from "date-fns/locale";

describe("ReferentGateway", () => {
    let referentGateway: ReferentGateway;
    let app: INestApplication;
    let referentMongoose: Model<ReferentDocument>;
    let cls: ClsService;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        referentGateway = module.get<ReferentGateway>(ReferentGateway);
        referentMongoose = module.get<Model<ReferentDocument>>(REFERENT_MONGOOSE_ENTITY);
        cls = module.get(ClsService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    describe("update", () => {
        it("should update a referent", async () => {
            const createdReferent = await createReferent({
                nom: "Referent Test",
            });

            const expectedReferent: ReferentModel = {
                ...createdReferent,
                nom: "Updated Referent Test",
            };
            jest.spyOn(cls, "get").mockImplementation(() => {});

            const result = await referentGateway.update({ ...createdReferent, nom: "Updated Referent Test" });
            expect(result).toEqual({
                ...expectedReferent,
                updatedAt: expect.any(Date),
                nomComplet: expect.any(String),
            });
        });
        it("should update a referent and add document into referent_patches", async () => {
            const createdReferent = await createReferent({
                nom: "Referent Test",
            });

            const expectedReferent: ReferentModel = {
                ...createdReferent,
                nom: "Updated Referent Test",
            };

            jest.spyOn(cls, "get").mockImplementation(() => ({
                id: "id",
                firstName: "prenom",
                lastName: "nom",
            }));

            const result = await referentGateway.update({ ...createdReferent, nom: "Updated Referent Test" });
            expect(result).toEqual({
                ...expectedReferent,
                updatedAt: expect.any(Date),
                nomComplet: expect.any(String),
            });

            const referentDocument = await referentMongoose.findById(createdReferent.id);
            //@ts-ignore
            const referentPatches = await referentDocument.patches
                .find({
                    ref: new mongoose.Types.ObjectId(createdReferent.id),
                })
                .sort("-date");
            const referentPatche = referentPatches[0];
            expect(referentPatche.modelName).toEqual("referent");
            expect(referentPatche.ops).toHaveLength(1);
            expect(referentPatche.ops).toEqual([
                { op: "replace", path: "/lastName", value: "Updated Referent Test", originalValue: "Referent Test" },
            ]);
            expect(referentPatche.user).toEqual({ id: "id", firstName: "prenom", lastName: "nom" });
        });
    });
});
