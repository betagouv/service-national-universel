import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CampagneComplete } from "@plan-marketing/core/Campagne.model";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";
import { ProgrammationService } from "@plan-marketing/core/service/Programmation.service";
import { PreparerEnvoiCampagne } from "@plan-marketing/core/useCase/PreparerEnvoiCampagne";
import { EnvoyerCampagneProgrammee } from "@plan-marketing/core/useCase/cron/EnvoyerCampagneProgrammee";
import { CAMPAGNE_MONGOOSE_ENTITY, CampagneDocument } from "@plan-marketing/infra/CampagneMongo.provider";
import { ClockGateway } from "@shared/core/Clock.gateway";
import mongoose, { Model } from "mongoose";
import { CampagneJeuneType, DestinataireListeDiffusion, TypeEvenement } from "snu-lib";
import { createSession } from "../admin/sejour/phase1/helper/SessionHelper";
import { setupAdminTest } from "../admin/setUpAdminTest";
import { createCampagne } from "./CampagneHelper";
import { setUpPlanMarketingTest } from "./setUpPlanMarketingTest";

describe("EnvoyerCampagneProgrammee", () => {
    let envoyerCampagneProgrammee: EnvoyerCampagneProgrammee;
    let preparerEnvoiCampagneMock: jest.Mocked<PreparerEnvoiCampagne>;
    let campagneService: CampagneService;
    let programmationService: ProgrammationService;
    let clockGateway: jest.Mocked<ClockGateway>;
    let app: INestApplication;
    let campagneMongoose: Model<CampagneDocument>;
    let realClockGateway: ClockGateway;

    const fixedDate = new Date("2023-01-15T12:00:00Z");
    const yesterdayDate = new Date("2023-01-14T12:00:00Z");

    beforeAll(async () => {
        const appSetup = await setUpPlanMarketingTest();
        app = appSetup.app;

        // Required to use SessionHelper
        await setupAdminTest();

        campagneService = appSetup.testModule.get<CampagneService>(CampagneService);
        campagneMongoose = appSetup.testModule.get<Model<CampagneDocument>>(CAMPAGNE_MONGOOSE_ENTITY);
        realClockGateway = appSetup.testModule.get<ClockGateway>(ClockGateway);
        programmationService = appSetup.testModule.get<ProgrammationService>(ProgrammationService);

        // On mock PreparerEnvoiCampagne qui requiert Elasticsearch
        preparerEnvoiCampagneMock = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<PreparerEnvoiCampagne>;

        clockGateway = {
            now: jest.fn().mockReturnValue(fixedDate),
            addDays: jest.fn().mockImplementation((date, days) => {
                return realClockGateway.addDays(date, days);
            }),
        } as unknown as jest.Mocked<ClockGateway>;

        const testModule = await Test.createTestingModule({
            providers: [
                EnvoyerCampagneProgrammee,
                {
                    provide: PreparerEnvoiCampagne,
                    useValue: preparerEnvoiCampagneMock,
                },
                {
                    provide: CampagneService,
                    useValue: campagneService,
                },
                {
                    provide: ClockGateway,
                    useValue: clockGateway,
                },
                {
                    provide: ProgrammationService,
                    useValue: programmationService,
                },
            ],
        }).compile();

        envoyerCampagneProgrammee = testModule.get<EnvoyerCampagneProgrammee>(EnvoyerCampagneProgrammee);
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await campagneMongoose.deleteMany({});
    });

    it("should call preparerEnvoiCampagne for each campaign with programmation dates in range", async () => {
        const session = await createSession({
            dateStart: fixedDate,
            dateEnd: fixedDate,
            inscriptionStartDate: fixedDate,
            inscriptionEndDate: fixedDate,
            inscriptionModificationEndDate: fixedDate,
            instructionEndDate: fixedDate,
            validationDate: fixedDate,
        });
        const campagne1 = (await createCampagne({
            nom: "Test Campagne 1",
            objet: "Test Subject 1",
            templateId: 123,
            destinataires: [DestinataireListeDiffusion.JEUNES],
            type: CampagneJeuneType.CLE,
            generic: false,
            cohortId: session.id,
            programmations: [
                {
                    joursDecalage: 0,
                    type: TypeEvenement.AUCUN,
                    envoiDate: fixedDate,
                },
            ],
        })) as CampagneComplete;

        const campagne2 = (await createCampagne({
            nom: "Test Campagne 2",
            objet: "Test Subject 2",
            templateId: 456,
            destinataires: [DestinataireListeDiffusion.JEUNES],
            type: CampagneJeuneType.CLE,
            generic: false,
            cohortId: session.id,
            programmations: [
                {
                    joursDecalage: 0,
                    type: TypeEvenement.AUCUN,
                    envoiDate: yesterdayDate,
                },
            ],
        })) as CampagneComplete;

        jest.spyOn(campagneService, "findCampagnesWithProgrammationBetweenDates");
        jest.spyOn(campagneService, "updateProgrammationSentDate");

        await envoyerCampagneProgrammee.execute();

        expect(clockGateway.now).toHaveBeenCalled();

        expect(clockGateway.addDays).toHaveBeenCalledWith(fixedDate, -1);

        expect(campagneService.findCampagnesWithProgrammationBetweenDates).toHaveBeenCalledWith(
            expect.any(Date),
            fixedDate,
        );

        expect(preparerEnvoiCampagneMock.execute).toHaveBeenCalledTimes(2);

        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledTimes(2);
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledWith(
            campagne1.id,
            campagne1.programmations?.[0].id,
            fixedDate,
        );
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledWith(
            campagne2.id,
            campagne2.programmations?.[0].id,
            fixedDate,
        );

        const callArgs = preparerEnvoiCampagneMock.execute.mock.calls.map((call) => call[0]);
        expect(callArgs).toContain(campagne1.id);
        expect(callArgs).toContain(campagne2.id);

        const sentCampagne = (await campagneService.findById(campagne1.id)) as CampagneComplete;
        expect(sentCampagne?.programmations?.[0].sentAt).toEqual(fixedDate);
    });

    it("should not call preparerEnvoiCampagne when no campaigns are found", async () => {
        // Delete all campaigns to ensure none are found
        await campagneMongoose.deleteMany({});

        await envoyerCampagneProgrammee.execute();

        expect(preparerEnvoiCampagneMock.execute).not.toHaveBeenCalled();
        expect(campagneService.updateProgrammationSentDate).not.toHaveBeenCalled();
    });

    it("should call preparerEnvoiCampagne for campaigns with programmation in yesterday's date", async () => {
        const session = await createSession({
            dateStart: fixedDate,
            dateEnd: fixedDate,
            inscriptionStartDate: fixedDate,
            inscriptionEndDate: fixedDate,
            inscriptionModificationEndDate: fixedDate,
            instructionEndDate: fixedDate,
            validationDate: fixedDate,
        });

        const campagne = (await createCampagne({
            nom: "Test Campagne Yesterday",
            objet: "Test Subject 3",
            templateId: 789,
            destinataires: [DestinataireListeDiffusion.CHEFS_CENTRES],
            type: CampagneJeuneType.VOLONTAIRE,
            generic: false,
            cohortId: session.id,
            programmations: [
                {
                    joursDecalage: 0,
                    type: TypeEvenement.AUCUN,
                    envoiDate: yesterdayDate,
                },
            ],
        })) as CampagneComplete;

        jest.spyOn(campagneService, "updateProgrammationSentDate");

        await envoyerCampagneProgrammee.execute();

        expect(preparerEnvoiCampagneMock.execute).toHaveBeenCalledTimes(1);
        expect(preparerEnvoiCampagneMock.execute).toHaveBeenCalledWith(campagne.id);
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledWith(
            campagne.id,
            campagne.programmations?.[0].id,
            fixedDate,
        );
    });

    it("should skip programmations that should not be sent", async () => {
        const yesterdayDate = new Date("2023-01-12T12:00:00Z");
        const session = await createSession({
            dateStart: fixedDate,
            dateEnd: fixedDate,
            inscriptionStartDate: fixedDate,
            inscriptionEndDate: fixedDate,
            inscriptionModificationEndDate: fixedDate,
            instructionEndDate: fixedDate,
            validationDate: fixedDate,
        });

        const campagne = await createCampagne({
            nom: "Test Campagne Skip",
            objet: "Test Subject 4",
            templateId: 789,
            destinataires: [DestinataireListeDiffusion.CHEFS_CENTRES],
            type: CampagneJeuneType.VOLONTAIRE,
            generic: false,
            cohortId: session.id,
            programmations: [
                {
                    joursDecalage: 0,
                    type: TypeEvenement.AUCUN,
                    envoiDate: yesterdayDate,
                    sentAt: new Date(),
                },
            ],
        });

        await envoyerCampagneProgrammee.execute();

        expect(preparerEnvoiCampagneMock.execute).not.toHaveBeenCalled();
    });

    it("should process multiple programmations from the same campaign in the same run", async () => {
        const session = await createSession({
            dateStart: fixedDate,
            dateEnd: fixedDate,
            inscriptionStartDate: fixedDate,
            inscriptionEndDate: fixedDate,
            inscriptionModificationEndDate: fixedDate,
            instructionEndDate: fixedDate,
            validationDate: fixedDate,
        });

        const campagne = (await createCampagne({
            nom: "Test Multiple Programmations",
            objet: "Test Multiple Programmations",
            templateId: 999,
            destinataires: [DestinataireListeDiffusion.JEUNES],
            type: CampagneJeuneType.CLE,
            generic: false,
            cohortId: session.id,
            programmations: [
                {
                    joursDecalage: 0,
                    type: TypeEvenement.AUCUN,
                    envoiDate: fixedDate,
                },
                {
                    joursDecalage: 1,
                    type: TypeEvenement.AUCUN,
                    envoiDate: yesterdayDate,
                },
            ],
        })) as CampagneComplete;

        jest.spyOn(campagneService, "updateProgrammationSentDate");

        await envoyerCampagneProgrammee.execute();

        expect(preparerEnvoiCampagneMock.execute).toHaveBeenCalledTimes(2);
        expect(preparerEnvoiCampagneMock.execute).toHaveBeenCalledWith(campagne.id);

        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledTimes(2);
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledWith(
            campagne.id,
            campagne.programmations?.[0].id,
            fixedDate,
        );
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledWith(
            campagne.id,
            campagne.programmations?.[1].id,
            fixedDate,
        );

        const sentCampagne = (await campagneService.findById(campagne.id)) as CampagneComplete;
        expect(sentCampagne?.programmations?.[0].sentAt).toEqual(fixedDate);
        expect(sentCampagne?.programmations?.[1].sentAt).toEqual(fixedDate);
    });

    it("should not send a campagne when a programmation was already sent", async () => {
        const session = await createSession({
            dateStart: fixedDate,
            dateEnd: fixedDate,
            inscriptionStartDate: fixedDate,
            inscriptionEndDate: fixedDate,
            inscriptionModificationEndDate: fixedDate,
            instructionEndDate: fixedDate,
            validationDate: fixedDate,
        });

        const sentAtDate = new Date("2023-01-10T12:00:00Z");
        const campagne = (await createCampagne({
            nom: "Test Already Sent Campagne",
            objet: "Test Already Sent Subject",
            templateId: 555,
            destinataires: [DestinataireListeDiffusion.JEUNES],
            type: CampagneJeuneType.VOLONTAIRE,
            generic: false,
            cohortId: session.id,
            programmations: [
                {
                    joursDecalage: 0,
                    type: TypeEvenement.AUCUN,
                    envoiDate: fixedDate,
                    sentAt: sentAtDate,
                },
            ],
        })) as CampagneComplete;

        jest.spyOn(campagneService, "updateProgrammationSentDate");

        await envoyerCampagneProgrammee.execute();

        expect(preparerEnvoiCampagneMock.execute).not.toHaveBeenCalledWith(campagne.id);

        expect(campagneService.updateProgrammationSentDate).not.toHaveBeenCalledWith(
            campagne.id,
            campagne.programmations?.[0].id,
            expect.any(Date),
        );
    });

    it("should send one time a campagne when there are two eligible programmations : one already sent and the other not sent", async () => {
        const session = await createSession({
            dateStart: fixedDate,
            dateEnd: fixedDate,
            inscriptionStartDate: fixedDate,
            inscriptionEndDate: fixedDate,
            inscriptionModificationEndDate: fixedDate,
            instructionEndDate: fixedDate,
            validationDate: fixedDate,
        });

        const sentAtDate = new Date("2023-01-10T12:00:00Z");
        const campagne = (await createCampagne({
            nom: "Test Mixed Programmations",
            objet: "Test Mixed Programmations Subject",
            templateId: 777,
            destinataires: [DestinataireListeDiffusion.JEUNES],
            type: CampagneJeuneType.VOLONTAIRE,
            generic: false,
            cohortId: session.id,
            programmations: [
                {
                    joursDecalage: 0,
                    type: TypeEvenement.AUCUN,
                    envoiDate: fixedDate,
                    sentAt: sentAtDate,
                },
                {
                    joursDecalage: 1,
                    type: TypeEvenement.AUCUN,
                    envoiDate: yesterdayDate,
                },
            ],
        })) as CampagneComplete;

        jest.spyOn(campagneService, "updateProgrammationSentDate");

        await envoyerCampagneProgrammee.execute();

        // Verify preparerEnvoiCampagne is called once for this campaign
        expect(preparerEnvoiCampagneMock.execute).toHaveBeenCalledTimes(1);
        expect(preparerEnvoiCampagneMock.execute).toHaveBeenCalledWith(campagne.id);

        // Verify updateProgrammationSentDate is only called for the unsent programmation
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledTimes(1);
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledWith(
            campagne.id,
            campagne.programmations?.[1].id,
            fixedDate,
        );
        expect(campagneService.updateProgrammationSentDate).not.toHaveBeenCalledWith(
            campagne.id,
            campagne.programmations?.[0].id,
            expect.any(Date),
        );
    });
});
