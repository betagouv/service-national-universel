import { Test, TestingModule } from "@nestjs/testing";
import { EmailTemplate } from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { InvitationType, STATUS_CLASSE } from "snu-lib";
import { ReferentGateway } from "src/admin/core/iam/Referent.gateway";
import { ReferentModel } from "src/admin/core/iam/Referent.model";
import { EtablissementGateway } from "../../etablissement/Etablissement.gateway";
import { EtablissementModel } from "../../etablissement/Etablissement.model";
import { GetReferentDepToBeNotified } from "../../referent/useCase/GetReferentDepToBeNotified";
import { InviterReferentClasse } from "../../referent/useCase/InviteReferentClasse";
import { ClasseGateway } from "../Classe.gateway";
import { VerifierClasse } from "./VerifierClasse";

describe("VerifierClasse", () => {
    let verifierClasse: VerifierClasse;
    let classeGateway: ClasseGateway;
    let etablissementGateway: EtablissementGateway;
    let referentGateway: ReferentGateway;
    let notificationGateway: NotificationGateway;
    let getReferentDepToBeNotified: GetReferentDepToBeNotified;
    let inviterReferentClasse: InviterReferentClasse;

    const mockClasse = {
        id: "1",
        statut: "CREATED",
        etablissementId: "1",
        email: "test@test.com",
    };

    const mockEtablissement = {
        id: "1",
        referentEtablissementIds: ["1", "2"],
        coordinateurIds: ["1"],
    };

    const mockReferent = {
        id: "1",
        metadata: { invitationType: InvitationType.INSCRIPTION },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VerifierClasse,
                {
                    provide: ClasseGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockClasse),
                        update: jest.fn().mockResolvedValue({ ...mockClasse, statut: STATUS_CLASSE.VERIFIED }),
                    },
                },
                {
                    provide: EtablissementGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockEtablissement),
                    },
                },
                {
                    provide: NotificationGateway,
                    useValue: {
                        sendEmail: jest.fn().mockImplementation(() => Promise.resolve()),
                    },
                },
                {
                    provide: ReferentGateway,
                    useValue: {
                        findByIds: jest.fn().mockResolvedValue([mockReferent]),
                    },
                },
                {
                    provide: GetReferentDepToBeNotified,
                    useValue: { execute: jest.fn().mockResolvedValue([]) },
                },
                {
                    provide: InviterReferentClasse,
                    useValue: { execute: jest.fn() },
                },
            ],
        }).compile();

        verifierClasse = module.get<VerifierClasse>(VerifierClasse);
        classeGateway = module.get<ClasseGateway>(ClasseGateway);
        etablissementGateway = module.get<EtablissementGateway>(EtablissementGateway);
        referentGateway = module.get<ReferentGateway>(ReferentGateway);
        notificationGateway = module.get<NotificationGateway>(NotificationGateway);
        getReferentDepToBeNotified = module.get<GetReferentDepToBeNotified>(GetReferentDepToBeNotified);
        inviterReferentClasse = module.get<InviterReferentClasse>(InviterReferentClasse);
    });

    it("should verifier classe and update statut", async () => {
        const result = await verifierClasse.execute(mockClasse.id);

        expect(result.statut).toEqual(STATUS_CLASSE.VERIFIED);
        expect(classeGateway.update).toHaveBeenCalledWith({ ...mockClasse, statut: STATUS_CLASSE.VERIFIED });
        expect(notificationGateway.sendEmail).toHaveBeenCalledTimes(1);
        expect(inviterReferentClasse.execute).toHaveBeenCalledWith(
            mockReferent.id,
            mockClasse.id,
            mockReferent.metadata.invitationType,
        );
    });

    it("should send an email to 3 adminCle", async () => {
        const mockEtablissement = {
            id: "1",
            referentEtablissementIds: ["1", "2", "3"],
            coordinateurIds: ["1", "3"],
        };
        const mockReferents = [
            { id: "1", email: "referent1@example.com", metadata: { invitationType: InvitationType.INSCRIPTION } },
            { id: "2", email: "referent2@example.com", metadata: { invitationType: InvitationType.INSCRIPTION } },
            { id: "3", email: "referent3@example.com", metadata: { invitationType: InvitationType.INSCRIPTION } },
        ];
        jest.spyOn(etablissementGateway, "findById").mockResolvedValue(mockEtablissement as EtablissementModel);
        jest.spyOn(referentGateway, "findByIds").mockResolvedValue(mockReferents as ReferentModel[]);
        await verifierClasse.execute(mockClasse.id);
        expect(notificationGateway.sendEmail).toHaveBeenCalledWith(
            {
                classeCode: undefined,
                classeNom: undefined,
                classeUrl: "config.ADMIN_URL/classes/1",
                to: [
                    { email: "referent1@example.com", name: "undefined undefined" },
                    { email: "referent2@example.com", name: "undefined undefined" },
                    { email: "referent3@example.com", name: "undefined undefined" },
                ],
            },
            EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE,
        );
    });

    it("should send an email to 1 adminCle and 1 refDep", async () => {
        const mockEtablissement = {
            id: "1",
            referentEtablissementIds: ["1", "2"],
            coordinateurIds: ["1"],
        };
        const mockAdminCle = [{ id: "1", email: "referent1@example.com" }];
        const mockRefDep = [{ id: "3", email: "referent3@example.com" }];
        const mockRefClasse = [
            { id: "4", email: "referent4@example.com", metadata: { invitationType: InvitationType.INSCRIPTION } },
        ];
        jest.spyOn(etablissementGateway, "findById").mockResolvedValue(mockEtablissement as EtablissementModel);
        jest.spyOn(referentGateway, "findByIds").mockResolvedValueOnce(mockAdminCle as ReferentModel[]);
        jest.spyOn(referentGateway, "findByIds").mockResolvedValue(mockRefClasse as ReferentModel[]);
        jest.spyOn(getReferentDepToBeNotified, "execute").mockResolvedValue(mockRefDep as ReferentModel[]);
        await verifierClasse.execute(mockClasse.id);
        expect(notificationGateway.sendEmail).toHaveBeenNthCalledWith(
            1,
            {
                classeCode: undefined,
                classeNom: undefined,
                classeUrl: "config.ADMIN_URL/classes/1",
                to: [{ email: "referent1@example.com", name: "undefined undefined" }],
            },
            EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE,
        );
        expect(notificationGateway.sendEmail).toHaveBeenNthCalledWith(
            2,
            {
                classeCode: undefined,
                classeNom: undefined,
                classeUrl: "config.ADMIN_URL/classes/1",
                to: [{ email: "referent3@example.com", name: "undefined undefined" }],
            },
            EmailTemplate.VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG,
        );
        expect(notificationGateway.sendEmail).toHaveBeenCalledTimes(2);

        expect(inviterReferentClasse.execute).toHaveBeenCalledWith("4", mockClasse.id, InvitationType.INSCRIPTION);
    });

    it("should throw FunctionalException if statut is not CREATED", async () => {
        const classe = { ...mockClasse, statut: "NOT_CREATED" } as any;
        jest.spyOn(classeGateway, "findById").mockResolvedValue(classe);

        await expect(verifierClasse.execute(classe.id)).rejects.toThrow(FunctionalException);
    });

    it("should throw NotFoundException if établissement is not found", async () => {
        jest.spyOn(etablissementGateway, "findById").mockRejectedValue(new Error(FunctionalExceptionCode.NOT_FOUND));

        await expect(verifierClasse.execute(mockClasse.id)).rejects.toThrow(
            new Error(FunctionalExceptionCode.NOT_FOUND),
        );
    });
});
