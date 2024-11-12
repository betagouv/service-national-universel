import { Test, TestingModule } from "@nestjs/testing";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { FUNCTIONAL_ERRORS, InvitationType } from "snu-lib";
import { ReferentGateway } from "src/admin/core/iam/Referent.gateway";
import { ClasseGateway } from "../../classe/Classe.gateway";
import { EtablissementGateway } from "../../etablissement/Etablissement.gateway";
import { InviterReferentClasse } from "./InviteReferentClasse";
import { ReferentModel } from "src/admin/core/iam/Referent.model";
import { EtablissementModel } from "../../etablissement/Etablissement.model";
import { ClasseModel } from "../../classe/Classe.model";

describe("InviterReferentClasse", () => {
    let service: InviterReferentClasse;
    let classeGateway: ClasseGateway;
    let etablissementGateway: EtablissementGateway;
    let notificationGateway: NotificationGateway;
    let referentGateway: ReferentGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InviterReferentClasse,
                {
                    provide: ClasseGateway,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: EtablissementGateway,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: NotificationGateway,
                    useValue: {
                        sendEmail: jest.fn(),
                    },
                },
                {
                    provide: ReferentGateway,
                    useValue: {
                        findById: jest.fn(),
                        generateInvitationTokenById: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<InviterReferentClasse>(InviterReferentClasse);
        classeGateway = module.get<ClasseGateway>(ClasseGateway);
        etablissementGateway = module.get<EtablissementGateway>(EtablissementGateway);
        notificationGateway = module.get<NotificationGateway>(NotificationGateway);
        referentGateway = module.get<ReferentGateway>(ReferentGateway);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should throw an error if referent is not found", async () => {
        jest.spyOn(referentGateway, "generateInvitationTokenById").mockRejectedValue(
            new Error(FunctionalExceptionCode.NOT_FOUND),
        );

        await expect(service.execute("invalid-id", "classe-id", InvitationType.INSCRIPTION)).rejects.toThrow(
            FunctionalExceptionCode.NOT_FOUND,
        );
    });

    it("should call notificationGateway.sendEmail template INSCRIPTION", async () => {
        const referentId = "referent-id";
        const classeId = "classe-id";
        const invitationType = InvitationType.INSCRIPTION;
        const mockedReferent = {
            id: referentId,
            email: "referent@example.com",
            nom: "Doe",
            prenom: "John",
        } as ReferentModel;

        jest.spyOn(referentGateway, "findById").mockResolvedValue(mockedReferent);
        jest.spyOn(classeGateway, "findById").mockResolvedValue({
            id: classeId,
            nom: "Classe 1",
            anneeScolaire: "2022-2023",
        } as ClasseModel);
        jest.spyOn(etablissementGateway, "findById").mockResolvedValue({
            id: "etablissement-id",
            nom: "Etablissement 1",
            referentEtablissementIds: [referentId],
        } as EtablissementModel);
        jest.spyOn(notificationGateway, "sendEmail").mockResolvedValue(undefined);
        jest.spyOn(referentGateway, "generateInvitationTokenById").mockResolvedValue(mockedReferent);

        await service.execute(referentId, classeId, invitationType);

        expect(notificationGateway.sendEmail).toHaveBeenCalledTimes(1);
    });
});
