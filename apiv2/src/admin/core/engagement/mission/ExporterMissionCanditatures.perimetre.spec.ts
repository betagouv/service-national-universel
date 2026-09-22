/**
 * Périmètre de l'export des candidatures MIG (H73).
 *
 * `ExportMissionService.searchMissions` ne rejouait un périmètre que pour RESPONSIBLE et
 * SUPERVISOR : un référent départemental ou régional envoyant `filters: {}` obtenait
 * l'ensemble des candidatures du territoire national, avec l'identité, les coordonnées et
 * l'adresse des jeunes et de leurs deux représentants légaux.
 *
 * Le cloisonnement est celui des policies CANDIDATURE_DEPARTMENT_* / CANDIDATURE_REGION_*,
 * déjà appliqué côté v1 par `buildApplicationContext` : le département de résidence du jeune.
 */
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { region2department, ROLES } from "snu-lib";

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

const STOP = new Error("STOP_APRES_RECHERCHE_CANDIDATURES");

describe("ExporterMissionCanditatures - périmètre", () => {
    let exporter: ExporterMissionCanditatures;
    let searchApplicationGateway: { searchApplication: jest.Mock };
    let referentGateway: { findById: jest.Mock };

    beforeEach(async () => {
        const vide = () => ({});
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExporterMissionCanditatures,
                ExportMissionService,
                { provide: ReferentGateway, useValue: { findById: jest.fn() } },
                { provide: StructureGateway, useValue: { findByIdOrNetworkId: jest.fn().mockResolvedValue([]) } },
                {
                    provide: SearchMissionGateway,
                    useValue: {
                        searchMission: jest.fn().mockResolvedValue({ hits: [{ _id: "mission-1" }], total: 1 }),
                    },
                },
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
        searchApplicationGateway = module.get(SearchApplicationGateway);
        referentGateway = module.get(ReferentGateway);
        // On interrompt juste après la recherche de candidatures : seuls ses filtres nous intéressent.
        searchApplicationGateway.searchApplication.mockRejectedValue(STOP);
    });

    const exporterPour = async (auteur: Record<string, unknown>, filters: Record<string, any> = {}) => {
        await expect(
            exporter.execute({
                filters,
                fields: ["identity", "contact", "representative1", "representative2"],
                auteur,
            } as any),
        ).rejects.toBe(STOP);
        return searchApplicationGateway.searchApplication.mock.calls[0][0].filters;
    };

    it("cloisonne les candidatures d'un référent départemental sur ses départements", async () => {
        referentGateway.findById.mockResolvedValue({ id: "r1", departement: ["Finistère", "Morbihan"] });

        const filtres = await exporterPour({ id: "r1", role: ROLES.REFERENT_DEPARTMENT });

        expect(filtres.youngDepartment).toEqual(["Finistère", "Morbihan"]);
    });

    it("cloisonne les candidatures d'un référent régional sur les départements de sa région", async () => {
        referentGateway.findById.mockResolvedValue({ id: "r2", region: "Bretagne" });

        const filtres = await exporterPour({ id: "r2", role: ROLES.REFERENT_REGION });

        expect(filtres.youngDepartment).toEqual(region2department["Bretagne"]);
    });

    it("ignore un youngDepartment hors périmètre fourni par l'appelant", async () => {
        referentGateway.findById.mockResolvedValue({ id: "r1", departement: ["Finistère"] });

        const filtres = await exporterPour(
            { id: "r1", role: ROLES.REFERENT_DEPARTMENT },
            { youngDepartment: ["Gironde"] },
        );

        expect(filtres.youngDepartment).toEqual(["Finistère"]);
    });

    it("refuse l'export d'un référent départemental sans département", async () => {
        referentGateway.findById.mockResolvedValue({ id: "r1", departement: [] });

        await expect(
            exporter.execute({ filters: {}, fields: ["identity"], auteur: { id: "r1", role: ROLES.REFERENT_DEPARTMENT } } as any),
        ).rejects.not.toBe(STOP);
        expect(searchApplicationGateway.searchApplication).not.toHaveBeenCalled();
    });

    it("laisse l'export d'un administrateur national sans filtre géographique", async () => {
        referentGateway.findById.mockResolvedValue({ id: "admin" });

        const filtres = await exporterPour({ id: "admin", role: ROLES.ADMIN });

        expect(filtres.youngDepartment).toBeUndefined();
    });

    it("conserve le cloisonnement par structure d'un responsable", async () => {
        referentGateway.findById.mockResolvedValue({ id: "r3", structureId: "structure-1" });

        const filtres = await exporterPour({ id: "r3", role: ROLES.RESPONSIBLE });

        expect(filtres.youngDepartment).toBeUndefined();
    });
});
