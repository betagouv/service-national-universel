// tests/admin/core/iam/Referent.service.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { EmailTemplate } from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { InvitationType, ROLES } from "snu-lib";
import { ClasseGateway } from "../../sejours/cle/classe/Classe.gateway";
import { ClasseModel } from "../../sejours/cle/classe/Classe.model";
import { InviterReferentClasse } from "../../sejours/cle/referent/useCase/InviteReferentClasse";
import { ReferentGateway } from "../Referent.gateway";
import { ReferentModel } from "../Referent.model";
import { ReferentService } from "./Referent.service";

describe("ReferentService", () => {
    let service: ReferentService;
    let referentGateway: ReferentGateway;
    let notificationGateway: NotificationGateway;
    let classeGateway: ClasseGateway;
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
                metadata: {},
                region: "",
                invitationToken: "",
                role: ROLES.REFERENT_CLASSE,
            };
            (referentGateway.create as jest.Mock).mockResolvedValue(newReferent);

            const createdReferent = await service.createNewReferentAndAddToClasse(
                {
                    email: newReferent.email,
                    prenom: newReferent.prenom,
                    nom: newReferent.nom,
                },
                mockClasse,
            );

            expect(referentGateway.create).toHaveBeenCalledWith({
                metadata: {},
                region: "",
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
});