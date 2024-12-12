import { Test, TestingModule } from "@nestjs/testing";
import { ModifierReferentClasse } from "./ModifierReferentClasse";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ReferentService } from "@admin/core/iam/service/Referent.service";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { EmailTemplate } from "@notification/core/Notification";
import { InvitationType, ROLES } from "snu-lib";
import { InviterReferentClasse } from "../../../referent/useCase/InviteReferentClasse";
import { ClasseGateway } from "../../Classe.gateway";
import { ClasseModel } from "../../Classe.model";
import { ConfigService } from "aws-sdk";
import { ConfigModule } from "@nestjs/config";
import configuration from "@config/testConfiguration";
import { FunctionalExceptionCode } from "@shared/core/FunctionalException";

describe("ModifierReferentClasse", () => {
    let service: ModifierReferentClasse;
    let referentGateway: ReferentGateway;
    let classeGateway: ClasseGateway;
    let notificationGateway: NotificationGateway;
    let inviterReferentClasse: InviterReferentClasse;
    let referentService: ReferentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [configuration],
                }),
            ],
            providers: [
                ModifierReferentClasse,
                {
                    provide: ReferentGateway,
                    useValue: {
                        findById: jest.fn(),
                        findByEmail: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: ClasseGateway,
                    useValue: {
                        findById: jest.fn(),
                        findByReferentId: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: NotificationGateway,
                    useValue: {
                        sendEmail: jest.fn(),
                    },
                },
                {
                    provide: InviterReferentClasse,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: ReferentService,
                    useValue: {
                        deleteReferentAndSendEmail: jest.fn(),
                        createNewReferentAndAssignToClasse: jest.fn(),
                        isReferentClasseInEtablissement: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ModifierReferentClasse>(ModifierReferentClasse);
        referentGateway = module.get<ReferentGateway>(ReferentGateway);
        classeGateway = module.get<ClasseGateway>(ClasseGateway);
        notificationGateway = module.get<NotificationGateway>(NotificationGateway);
        inviterReferentClasse = module.get<InviterReferentClasse>(InviterReferentClasse);
        referentService = module.get<ReferentService>(ReferentService);

        jest.spyOn(referentService, "isReferentClasseInEtablissement").mockResolvedValue(true);
    });

    describe("execute", () => {
        it("should throw an error if the new Referent is not referent_classe", async () => {
            const classeId = "classeId";
            const modifierReferentClasseModel = {
                email: "newReferentEmail@mail.com",
                nom: "newNom",
                prenom: "newPrenom",
            } as ReferentModel;
            const classe: ClasseModel = {
                id: classeId,
                referentClasseIds: ["currentReferentId"],
                uniqueKeyAndId: "classeKey",
                nom: "classeNom",
            } as ClasseModel;
            const currentReferent: ReferentModel = {
                id: "currentReferentId",
                email: "currentReferentEmail@mail.com",
                nom: "currentNom",
                prenom: "currentPrenom",
            } as ReferentModel;

            const newReferent: ReferentModel = {
                id: "newReferentId",
                email: "newReferentEmail@mail.com",
                nom: "newNom",
                prenom: "newPrenom",
                role: ROLES.ADMIN,
            } as unknown as ReferentModel;

            jest.spyOn(classeGateway, "findById").mockResolvedValue(classe);
            jest.spyOn(referentGateway, "findById").mockResolvedValue(currentReferent);
            jest.spyOn(referentGateway, "findByEmail").mockResolvedValue(newReferent);

            await expect(service.execute(classeId, modifierReferentClasseModel)).rejects.toThrow(
                FunctionalExceptionCode.ROLE_NOT_REFERENT_CLASSE,
            );
        });

        it("should throw an error if the new Referent is not in the etablissement of classe", async () => {
            const classeId = "classeId";
            const modifierReferentClasseModel = {
                email: "newReferentEmail@mail.com",
                nom: "newNom",
                prenom: "newPrenom",
            } as ReferentModel;
            const classe: ClasseModel = {
                id: classeId,
                referentClasseIds: ["currentReferentId"],
                uniqueKeyAndId: "classeKey",
                nom: "classeNom",
            } as ClasseModel;
            const currentReferent: ReferentModel = {
                id: "currentReferentId",
                email: "currentReferentEmail@mail.com",
                nom: "currentNom",
                prenom: "currentPrenom",
            } as ReferentModel;

            const newReferent: ReferentModel = {
                id: "newReferentId",
                email: "newReferentEmail@mail.com",
                nom: "newNom",
                prenom: "newPrenom",
                role: ROLES.REFERENT_CLASSE,
            } as unknown as ReferentModel;

            jest.spyOn(classeGateway, "findById").mockResolvedValue(classe);
            jest.spyOn(referentGateway, "findById").mockResolvedValue(currentReferent);
            jest.spyOn(referentGateway, "findByEmail").mockResolvedValue(newReferent);
            jest.spyOn(referentService, "isReferentClasseInEtablissement").mockResolvedValue(false);

            await expect(service.execute(classeId, modifierReferentClasseModel)).rejects.toThrow(
                FunctionalExceptionCode.REFERENT_CLASSE_NOT_IN_ETABLISSEMENT,
            );
        });

        it("should update the current referent if the email is the same", async () => {
            const classeId = "classeId";
            const modifierReferentClasseModel = {
                email: "sameCurrentReferentEmail@mail.com",
                nom: "newNom",
                prenom: "newPrenom",
            } as ReferentModel;
            const classe: ClasseModel = {
                id: classeId,
                referentClasseIds: ["currentReferentId"],
                uniqueKeyAndId: "classeKey",
                nom: "classeNom",
            } as ClasseModel;
            const currentReferent: ReferentModel = {
                id: "currentReferentId",
                email: "sameCurrentReferentEmail@mail.com",
                nom: "currentNom",
                prenom: "currentPrenom",
            } as ReferentModel;

            jest.spyOn(classeGateway, "findById").mockResolvedValue(classe);
            jest.spyOn(referentGateway, "findById").mockResolvedValue(currentReferent);
            jest.spyOn(referentGateway, "update").mockResolvedValue(modifierReferentClasseModel);

            const result = await service.execute(classeId, modifierReferentClasseModel);

            expect(result).toEqual(modifierReferentClasseModel);
            expect(referentGateway.update).toHaveBeenCalledWith({
                ...currentReferent,
                nom: modifierReferentClasseModel.nom,
                prenom: modifierReferentClasseModel.prenom,
            });
        });

        it("should handle previous referent and new referent with existing account", async () => {
            const classeId = "classeId";
            const modifierReferentClasseModel = {
                email: "newReferentEmail",
                nom: "newNom",
                prenom: "newPrenom",
            };
            const classe: ClasseModel = {
                id: classeId,
                referentClasseIds: ["currentReferentId"],
                uniqueKeyAndId: "classeKey",
                nom: "classeNom",
            } as ClasseModel;
            const currentReferent: ReferentModel = {
                id: "currentReferentId",
                email: "currentReferentEmail",
                nom: "currentNom",
                prenom: "currentPrenom",
                role: ROLES.REFERENT_CLASSE,
            } as ReferentModel;
            const newReferentOfClasse: ReferentModel = {
                id: "newReferentId",
                email: "newReferentEmail",
                nom: "newNom",
                prenom: "newPrenom",
                role: ROLES.REFERENT_CLASSE,
            } as ReferentModel;

            jest.spyOn(classeGateway, "findById").mockResolvedValue(classe);
            jest.spyOn(referentGateway, "findById").mockResolvedValue(currentReferent);
            jest.spyOn(referentGateway, "findByEmail").mockResolvedValue(newReferentOfClasse);
            jest.spyOn(classeGateway, "findByReferentId").mockResolvedValue([classe]);
            jest.spyOn(referentGateway, "update").mockResolvedValue(newReferentOfClasse);
            jest.spyOn(notificationGateway, "sendEmail").mockResolvedValue();
            jest.spyOn(inviterReferentClasse, "execute").mockResolvedValue();
            jest.spyOn(classeGateway, "update").mockResolvedValue(classe);

            const result = await service.execute(classeId, modifierReferentClasseModel);

            expect(result).toEqual(newReferentOfClasse);
            expect(referentGateway.update).toHaveBeenCalledWith(newReferentOfClasse);
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                expect.anything(),
                EmailTemplate.SUPPRIMER_CLASSE_ENGAGEE,
            );
            expect(inviterReferentClasse.execute).toHaveBeenCalledWith(
                newReferentOfClasse.id,
                classe.id,
                InvitationType.INSCRIPTION,
            );
            expect(classeGateway.update).toHaveBeenCalledWith(classe);
        });

        it("should delete the current referent if they have no other classes", async () => {
            const classe: ClasseModel = {
                id: "classeId",
                referentClasseIds: ["currentReferentId"],
                uniqueKeyAndId: "classeKey",
                nom: "classeNom",
            } as ClasseModel;
            const currentReferent: ReferentModel = {
                id: "currentReferentId",
                email: "currentReferentEmail",
                nom: "currentNom",
                prenom: "currentPrenom",
                role: ROLES.REFERENT_CLASSE,
            } as ReferentModel;

            jest.spyOn(classeGateway, "findByReferentId").mockResolvedValue([]);
            jest.spyOn(referentService, "deleteReferentAndSendEmail").mockResolvedValue();

            await service["handlePreviousReferent"](currentReferent, classe);

            expect(classeGateway.findByReferentId).toHaveBeenCalledWith(currentReferent.id);
            expect(referentService.deleteReferentAndSendEmail).toHaveBeenCalledWith(currentReferent);
        });

        it("should send a new class engagement email if the new referent has more than one class", async () => {
            const newReferentOfClasse: ReferentModel = {
                id: "newReferentId",
                email: "newReferentEmail",
                nom: "newNom",
                prenom: "newPrenom",
            } as ReferentModel;
            const classe: ClasseModel = {
                id: "classeId",
                referentClasseIds: ["newReferentId"],
                uniqueKeyAndId: "classeKey",
                nom: "classeNom",
            } as ClasseModel;

            jest.spyOn(classeGateway, "findByReferentId").mockResolvedValue([classe, classe]);
            jest.spyOn(notificationGateway, "sendEmail").mockResolvedValue();

            await service["handleExistingReferentAfterAssignement"](newReferentOfClasse, classe);

            expect(classeGateway.findByReferentId).toHaveBeenCalledWith(newReferentOfClasse.id);
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                expect.anything(),
                EmailTemplate.NOUVELLE_CLASSE_ENGAGEE,
            );
        });

        it("should handle previous referent and new referent with new account", async () => {
            const classeId = "classeId";
            const modifierReferentClasseModel = {
                email: "newReferentEmail",
                nom: "newNom",
                prenom: "newPrenom",
            };
            const classe: ClasseModel = {
                id: classeId,
                referentClasseIds: ["currentReferentId"],
                uniqueKeyAndId: "classeKey",
                nom: "classeNom",
            } as ClasseModel;
            const currentReferent: ReferentModel = {
                id: "currentReferentId",
                email: "currentReferentEmail",
                nom: "currentNom",
                prenom: "currentPrenom",
            } as ReferentModel;

            jest.spyOn(classeGateway, "findById").mockResolvedValue(classe);
            jest.spyOn(referentGateway, "findById").mockResolvedValue(currentReferent);
            jest.spyOn(referentGateway, "findByEmail").mockRejectedValue(new Error());
            jest.spyOn(classeGateway, "findByReferentId").mockResolvedValue([classe]);
            jest.spyOn(referentService, "createNewReferentAndAssignToClasse").mockResolvedValue(currentReferent);

            const result = await service.execute(classeId, modifierReferentClasseModel);

            expect(result).toEqual(currentReferent);
            expect(referentService.createNewReferentAndAssignToClasse).toHaveBeenCalledWith(
                modifierReferentClasseModel,
                classe,
            );
        });
    });
});
