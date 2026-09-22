import { INestApplication } from "@nestjs/common";
import mongoose, { Model } from "mongoose";

import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { REFERENT_MONGOOSE_ENTITY, ReferentDocument } from "@admin/infra/iam/provider/ReferentMongo.provider";
import { setupAdminTest } from "../setUpAdminTest";
import { createReferent } from "./ReferentHelper";
import { ClsService } from "nestjs-cls";
import { CLASSE_MONGOOSE_ENTITY, ClasseDocument } from "@admin/infra/sejours/cle/classe/provider/ClasseMongo.provider";
import { createEtablissement } from "../sejour/cle/EtablissementHelper";
import { ROLES } from "snu-lib";
import { FunctionalException } from "@shared/core/FunctionalException";
import { createClasse } from "../sejour/cle/classe/ClasseHelper";

describe("ReferentGateway", () => {
    let referentGateway: ReferentGateway;
    let app: INestApplication;
    let referentMongoose: Model<ReferentDocument>;
    let classeMongoose: Model<ClasseDocument>;
    let cls: ClsService;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        referentGateway = module.get<ReferentGateway>(ReferentGateway);
        referentMongoose = module.get<Model<ReferentDocument>>(REFERENT_MONGOOSE_ENTITY);
        classeMongoose = module.get<Model<ClasseDocument>>(CLASSE_MONGOOSE_ENTITY);
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
    describe("delete", () => {
        it("should delete a referent", async () => {
            const createdReferent = await createReferent({
                nom: "Referent Test",
            });
            jest.spyOn(cls, "get").mockImplementation(() => {});
            await referentGateway.delete(createdReferent.id);
            const referent = await referentMongoose.findById(createdReferent.id);
            expect(referent).toEqual(
                expect.objectContaining({
                    id: createdReferent.id,
                    deletedAt: expect.any(Date),
                    email: `deleted-${createdReferent.id}-${createdReferent.email}`,
                }),
            );
        });
    });

    describe("findByRoleAndEtablissement", () => {
        beforeEach(async () => {
            await referentMongoose.deleteMany({});
            await classeMongoose.deleteMany({});
        });
        it("should return an array of referents based on role and etablissement", async () => {
            const etablissement = await createEtablissement({ nom: "Etablissement Test" });
            const etablissement2 = await createEtablissement({ nom: "Etablissement Test 2" });
            const referent1 = await createReferent({
                nom: "Referent Test 1",
                email: "referent1@example.com",
                role: ROLES.REFERENT_CLASSE,
            });
            const referent2 = await createReferent({
                nom: "Referent Test 2",
                email: "referent2@example.com",
                role: ROLES.REFERENT_CLASSE,
            });
            const referentNotInEtablissement = await createReferent({
                nom: "Referent Test 2",
                email: "referent3@example.com",
                role: ROLES.REFERENT_CLASSE,
            });
            await createClasse({
                nom: "Classe Test",
                etablissementId: etablissement.id,
                referentClasseIds: [referent1.id],
            });
            await createClasse({
                nom: "Classe Test 2",
                etablissementId: etablissement.id,
                referentClasseIds: [referent2.id],
            });

            await createClasse({
                nom: "Classe Test 3",
                etablissementId: etablissement2.id,
                referentClasseIds: [referentNotInEtablissement.id],
            });

            const referents = await referentGateway.findByRoleAndEtablissement(ROLES.REFERENT_CLASSE, etablissement.id);
            expect(referents).toHaveLength(2);

            expect(referents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: referent1.id,
                        nom: referent1.nom,
                        email: referent1.email,
                    }),
                    expect.objectContaining({
                        id: referent2.id,
                        nom: referent2.nom,
                        email: referent2.email,
                    }),
                ]),
            );

            expect(referents).not.toContainEqual(
                expect.objectContaining({
                    id: referentNotInEtablissement.id,
                    nom: referentNotInEtablissement.nom,
                    email: referentNotInEtablissement.email,
                }),
            );
        });

        it("should return an array of referents based on search", async () => {
            const etablissement = await createEtablissement({ nom: "Etablissement Test" });
            const referent1 = await createReferent({
                nom: "Referent Test 1",
                email: "referent1@example.com",
                role: ROLES.REFERENT_CLASSE,
                prenom: "Jean",
            });

            const referent2 = await createReferent({
                nom: "Referent Test 2",
                email: "referent2@example.com",
                role: ROLES.REFERENT_CLASSE,
            });
            await createClasse({
                nom: "Classe Test",
                etablissementId: etablissement.id,
                referentClasseIds: [referent1.id, referent2.id],
            });
            const searchResults = await referentGateway.findByRoleAndEtablissement(
                ROLES.REFERENT_CLASSE,
                etablissement.id,
                "ent1",
            );

            expect(searchResults).toHaveLength(1);
            expect(searchResults).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: referent1.id,
                        nom: referent1.nom,
                        email: referent1.email,
                        prenom: referent1.prenom,
                    }),
                ]),
            );
            expect(searchResults).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: referent2.id,
                        nom: referent2.nom,
                        email: referent2.email,
                        prenom: referent2.prenom,
                    }),
                ]),
            );
        });

        // --- C25 ---

        it("should refuse to query without an etablissementId (C25)", async () => {
            await expect(
                referentGateway.findByRoleAndEtablissement(ROLES.REFERENT_CLASSE, "" as unknown as string),
            ).rejects.toThrow(FunctionalException);
        });

        it("should escape the search parameter instead of running it as a Mongo regex (C25)", async () => {
            const etablissement = await createEtablissement({ nom: "Etablissement Test" });
            const dg = await createReferent({
                email: "dg.snu@interieur.gouv.fr",
                role: ROLES.REFERENT_CLASSE,
                prenom: "Dg",
            });
            const agent = await createReferent({
                email: "agent@education.gouv.fr",
                role: ROLES.REFERENT_CLASSE,
                prenom: "Agent",
            });
            await createClasse({
                nom: "Classe Test",
                etablissementId: etablissement.id,
                referentClasseIds: [dg.id, agent.id],
            });

            // Une alternation ancrée : interprétée comme regex elle renverrait les deux référents.
            const parAlternation = await referentGateway.findByRoleAndEtablissement(
                ROLES.REFERENT_CLASSE,
                etablissement.id,
                "^(dg|agent)",
            );
            expect(parAlternation).toHaveLength(0);

            // Une recherche littérale continue de fonctionner.
            const litteral = await referentGateway.findByRoleAndEtablissement(
                ROLES.REFERENT_CLASSE,
                etablissement.id,
                "dg.snu",
            );
            expect(litteral).toHaveLength(1);
            expect(litteral[0].email).toEqual("dg.snu@interieur.gouv.fr");
        });

        it("should not return deleted referents (C25)", async () => {
            const etablissement = await createEtablissement({ nom: "Etablissement Test" });
            const parti = await createReferent({
                email: "parti@interieur.gouv.fr",
                role: ROLES.REFERENT_CLASSE,
                prenom: "Jean",
                nom: "Parti",
            });
            await createClasse({
                nom: "Classe Test",
                etablissementId: etablissement.id,
                referentClasseIds: [parti.id],
            });
            jest.spyOn(cls, "get").mockImplementation(() => {});
            await referentGateway.delete(parti.id);

            const referents = await referentGateway.findByRoleAndEtablissement(ROLES.REFERENT_CLASSE, etablissement.id);
            expect(referents).toHaveLength(0);
        });
    });
});
