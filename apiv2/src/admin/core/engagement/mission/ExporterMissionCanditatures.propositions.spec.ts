/**
 * Export des candidatures d'une mission : une proposition de mission en attente d'acceptation n'est pas
 * une candidature pour une structure.
 */
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { APPLICATION_STATUS, ROLES } from "snu-lib";

import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { StructureGateway } from "@admin/core/engagement/structure/Structure.gateway";
import { SearchApplicationGateway } from "@analytics/core/SearchApplication.gateway";
import { SearchMissionGateway } from "@analytics/core/SearchMission.gateway";
import { SearchReferentGateway } from "@analytics/core/SearchReferent.gateway";
import { SearchStructureGateway } from "@analytics/core/SearchStructure.gateway";
import { SearchYoungGateway } from "@analytics/core/SearchYoung.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";

import { ExportMissionService } from "./ExportMission.service";
import { ExporterMissionCanditatures } from "./ExporterMissionCanditatures";

describe("ExporterMissionCanditatures - propositions en attente", () => {
    let exporter: ExporterMissionCanditatures;
    let searchApplication: jest.Mock;
    let populateCandidatures: jest.SpyInstance;

    const candidature = (id: string, status: string) => ({
        _id: id,
        missionId: "mission-1",
        youngId: `young-${id}`,
        status,
    });
    const hits = [
        candidature("a", APPLICATION_STATUS.WAITING_VALIDATION),
        candidature("b", APPLICATION_STATUS.REFUSED),
        candidature("c", APPLICATION_STATUS.WAITING_ACCEPTATION),
        candidature("d", APPLICATION_STATUS.CANCEL),
        candidature("e", APPLICATION_STATUS.VALIDATED),
    ];

    beforeEach(async () => {
        const vide = () => ({});
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExporterMissionCanditatures,
                ExportMissionService,
                { provide: ReferentGateway, useValue: { findById: jest.fn() } },
                { provide: StructureGateway, useValue: { findByIdOrNetworkId: jest.fn().mockResolvedValue([]) } },
                { provide: SearchMissionGateway, useValue: vide() },
                { provide: SearchReferentGateway, useValue: vide() },
                { provide: SearchStructureGateway, useValue: vide() },
                { provide: SearchApplicationGateway, useValue: { searchApplication: jest.fn() } },
                { provide: SearchYoungGateway, useValue: vide() },
                { provide: NotificationGateway, useValue: vide() },
                { provide: FileGateway, useValue: vide() },
                { provide: ClockGateway, useValue: vide() },
                { provide: CryptoGateway, useValue: vide() },
                { provide: ConfigService, useValue: { get: jest.fn() } },
                { provide: Logger, useValue: { log: jest.fn(), error: jest.fn() } },
            ],
        }).compile();

        exporter = module.get(ExporterMissionCanditatures);
        searchApplication = module.get(SearchApplicationGateway).searchApplication;
        searchApplication.mockResolvedValue({ hits, total: hits.length });
        populateCandidatures = jest
            .spyOn(exporter, "populateCandidatures")
            .mockImplementation(
                async (missions, candidatures) => missions.map((mission) => ({ ...mission, candidatures })) as any,
            );
    });

    const exporterPour = async (role: string) => {
        await exporter.generateRapport([{ _id: "mission-1" } as any], ["identity"], {}, { id: "r1", role } as any, {});
        return populateCandidatures.mock.calls[0][1].map((c) => c._id);
    };

    it.each([ROLES.RESPONSIBLE, ROLES.SUPERVISOR])(
        "%s : écarte les propositions en attente, garde les candidatures",
        async (role) => {
            expect(await exporterPour(role)).toEqual(["a", "b", "d", "e"]);
        },
    );

    it.each([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION])(
        "%s : garde toutes les candidatures",
        async (role) => {
            expect(await exporterPour(role)).toEqual(["a", "b", "c", "d", "e"]);
        },
    );
});
