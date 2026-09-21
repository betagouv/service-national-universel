import { Test, TestingModule } from "@nestjs/testing";
import { EmailTemplate } from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { InvitationType, ROLES } from "snu-lib";
import { ClasseGateway } from "../../sejours/cle/classe/Classe.gateway";
import { ClasseModel } from "../../sejours/cle/classe/Classe.model";
import { InviterReferentClasse } from "../../sejours/cle/referent/useCase/InviteReferentClasse";
import { ReferentGateway } from "../Referent.gateway";
import { ReferentModel, ReferentModelLight } from "../Referent.model";
import { ReferentService } from "./Referent.service";
import { EtablissementGateway } from "../../sejours/cle/etablissement/Etablissement.gateway";
import { FunctionalException } from "@shared/core/FunctionalException";
import { ForbiddenException } from "@nestjs/common";

describe("ReferentService", () => {
    let service: ReferentService;
    let referentGateway: ReferentGateway;
    let notificationGateway: NotificationGateway;
    let classeGateway: ClasseGateway;
    let etablissementGateway: EtablissementGateway;
    let inviterReferentClasse: InviterReferentClasse;

    const mockReferent: ReferentModel = {
        id: "1",
        email: "test@example.com",
        prenom: "John",
        nom: "Doe",
        metadata: {},
        region: "",
        invitationToken: "",
        role: ROLES.REFERENT_CLASSE,
    };

    const mockClasse: ClasseModel = {
        id: "1",
        referentClasseIds: [],
        region: "region1",
    } as unknown as ClasseModel;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReferentService,
                {
                    provide: ReferentGateway,
                    useValue: {
                        delete: jest.fn(),
                        create: jest.fn(),
                        findByRole: jest.fn(),
                        findByEmail: jest.fn(),
                        findByRoleAndEtablissement: jest.fn(),
                    },
                },
                {
                    provide: NotificationGateway,
                    useValue: {
                        sendEmail: jest.fn(),
                    },
                },
                {
                    provide: ClasseGateway,
                    useValue: {
                        update: jest.fn(),
                    },
                },
                {
                    provide: EtablissementGateway,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: InviterReferentClasse,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ReferentService>(ReferentService);
        referentGateway = module.get<ReferentGateway>(ReferentGateway);
        notificationGateway = module.get<NotificationGateway>(NotificationGateway);
        classeGateway = module.get<ClasseGateway>(ClasseGateway);
        etablissementGateway = module.get<EtablissementGateway>(EtablissementGateway);
        inviterReferentClasse = module.get<InviterReferentClasse>(InviterReferentClasse);
    });

    describe("deleteReferentAndSendEmail", () => {
        it("should delete the referent and send an email", async () => {
            await service.deleteReferentAndSendEmail(mockReferent);

            expect(referentGateway.delete).toHaveBeenCalledWith(mockReferent.id);
            expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
                {
                    to: [{ email: mockReferent.email, name: `${mockReferent.prenom} ${mockReferent.nom}` }],
                },
                EmailTemplate.SUPPRIMER_REFERENT_CLASSE,
            );
        });
    });

    describe("createNewReferentAndAddToClasse", () => {
        it("should create a new referent, add to classe, and send an invitation", async () => {
            const newReferent: ReferentModel = {
                id: "2",
                email: "new@example.com",
                prenom: "New",
                nom: "Referent",
                role: ROLES.REFERENT_CLASSE,
            } as ReferentModel;
            (referentGateway.create as jest.Mock).mockResolvedValue(newReferent);

            const createdReferent = await service.createNewReferentAndAssignToClasse(
                {
                    email: newReferent.email,
                    prenom: newReferent.prenom,
                    nom: newReferent.nom,
                },
                mockClasse,
            );

            expect(referentGateway.create).toHaveBeenCalledWith({
                metadata: {},
                region: "region1",
                invitationToken: "",
                role: ROLES.REFERENT_CLASSE,
                email: newReferent.email,
                prenom: newReferent.prenom,
                nom: newReferent.nom,
            });
            expect(mockClasse.referentClasseIds).toEqual([newReferent.id]);
            expect(classeGateway.update).toHaveBeenCalledWith(mockClasse);
            expect(inviterReferentClasse.execute).toHaveBeenCalledWith(
                newReferent.id,
                mockClasse.id,
                InvitationType.INSCRIPTION,
            );
            expect(createdReferent).toEqual(newReferent);
        });
    });
    describe("findByRoleAndEtablissement", () => {
        const mockRole = ROLES.REFERENT_CLASSE;
        const mockSearch = "John";
        const mockReferents: ReferentModelLight[] = [
            { id: "1", email: "john@example.com", prenom: "John", nom: "Doe" },
            { id: "2", email: "john2@example.com", prenom: "John", nom: "Smith" },
        ];
        const etablissement = {
            id: "etab-1",
            departement: "Gironde",
            region: "Nouvelle-Aquitaine",
            referentEtablissementIds: ["chef-etab"],
            coordinateurIds: ["coordo"],
        };

        beforeEach(() => {
            (referentGateway.findByRoleAndEtablissement as jest.Mock).mockResolvedValue(mockReferents);
            (etablissementGateway.findById as jest.Mock).mockResolvedValue(etablissement);
        });

        it("should return the referents of the etablissement for its chef d'établissement", async () => {
            const result = await service.findByRoleAndEtablissement(
                { id: "chef-etab", role: ROLES.ADMINISTRATEUR_CLE },
                mockRole,
                etablissement.id,
                mockSearch,
            );

            expect(referentGateway.findByRoleAndEtablissement).toHaveBeenCalledWith(
                mockRole,
                etablissement.id,
                mockSearch,
            );
            expect(result).toEqual(mockReferents);
        });

        it("should reject an admin_cle of another etablissement (C25)", async () => {
            await expect(
                service.findByRoleAndEtablissement(
                    { id: "chef-d-un-autre-etab", role: ROLES.ADMINISTRATEUR_CLE },
                    mockRole,
                    etablissement.id,
                ),
            ).rejects.toThrow(ForbiddenException);
            expect(referentGateway.findByRoleAndEtablissement).not.toHaveBeenCalled();
        });

        it("should reject a referent departemental outside of its departement (C25)", async () => {
            await expect(
                service.findByRoleAndEtablissement(
                    { id: "ref-dep", role: ROLES.REFERENT_DEPARTMENT, departement: ["Paris"] },
                    mockRole,
                    etablissement.id,
                ),
            ).rejects.toThrow(ForbiddenException);
        });

        it("should accept a referent departemental of the same departement", async () => {
            await service.findByRoleAndEtablissement(
                { id: "ref-dep", role: ROLES.REFERENT_DEPARTMENT, departement: ["Gironde"] },
                mockRole,
                etablissement.id,
            );
            expect(referentGateway.findByRoleAndEtablissement).toHaveBeenCalled();
        });

        it("should reject a referent regional outside of its region (C25)", async () => {
            await expect(
                service.findByRoleAndEtablissement(
                    { id: "ref-reg", role: ROLES.REFERENT_REGION, region: "Bretagne" },
                    mockRole,
                    etablissement.id,
                ),
            ).rejects.toThrow(ForbiddenException);
        });

        it("should require an etablissementId (C25)", async () => {
            await expect(
                service.findByRoleAndEtablissement({ id: "admin", role: ROLES.ADMIN }, mockRole, ""),
            ).rejects.toThrow(FunctionalException);
            expect(etablissementGateway.findById).not.toHaveBeenCalled();
            expect(referentGateway.findByRoleAndEtablissement).not.toHaveBeenCalled();
        });
    });
    describe("findByEmail", () => {
        it("should return a referent when email exists", async () => {
            const email = "test@example.com";
            (referentGateway.findByEmail as jest.Mock).mockResolvedValue(mockReferent);

            const result = await service.findByEmail(email);

            expect(referentGateway.findByEmail).toHaveBeenCalledWith(email);
            expect(result).toEqual(mockReferent);
        });

        it("should throw an error when email does not exist", async () => {
            const email = "nonexistent@example.com";
            (referentGateway.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(service.findByEmail(email)).rejects.toThrow(FunctionalException);
        });
    });

    describe("isReferentClasseInEtablissement", () => {
        it("should return true if the referent is in the etablissement", async () => {
            const referentId = "1";
            const etablissementId = "1";
            const mockReferents: ReferentModelLight[] = [
                { id: "1", email: "john@example.com", prenom: "John", nom: "Doe" },
                { id: "2", email: "john2@example.com", prenom: "John", nom: "Smith" },
            ];
            (referentGateway.findByRoleAndEtablissement as jest.Mock).mockResolvedValue(mockReferents);

            const result = await service.isReferentClasseInEtablissement(referentId, etablissementId);

            expect(referentGateway.findByRoleAndEtablissement).toHaveBeenCalledWith(
                ROLES.REFERENT_CLASSE,
                etablissementId,
            );
            expect(result).toBe(true);
        });

        it("should return false if the referent is not in the etablissement", async () => {
            const referentId = "3";
            const etablissementId = "1";
            const mockReferents: ReferentModelLight[] = [
                { id: "1", email: "john@example.com", prenom: "John", nom: "Doe" },
                { id: "2", email: "john2@example.com", prenom: "John", nom: "Smith" },
            ];
            (referentGateway.findByRoleAndEtablissement as jest.Mock).mockResolvedValue(mockReferents);

            const result = await service.isReferentClasseInEtablissement(referentId, etablissementId);

            expect(referentGateway.findByRoleAndEtablissement).toHaveBeenCalledWith(
                ROLES.REFERENT_CLASSE,
                etablissementId,
            );
            expect(result).toBe(false);
        });
    });
});
