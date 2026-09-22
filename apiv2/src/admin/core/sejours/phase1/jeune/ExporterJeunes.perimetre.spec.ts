/**
 * Périmètre des exports de jeunes (non-régression C23).
 *
 * Trois trous corrigés ici :
 *  - un responsable/superviseur dont la structure n'a aucune candidature exportait tous les jeunes
 *    (contrainte `musts` vide silencieusement ignorée par le builder Elasticsearch) ;
 *  - la contrainte était posée sur `_id`, qui n'est pas une requête Elasticsearch valide ;
 *  - un référent départemental sortait de son périmètre via `filters.schoolDepartment`.
 */
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { ForbiddenException } from "@nestjs/common";
import { ROLES } from "snu-lib";

import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { StructureGateway } from "@admin/core/engagement/structure/Structure.gateway";
import { CandidatureGateway } from "@admin/core/engagement/candidature/Candidature.gateway";
import { SearchYoungGateway } from "@analytics/core/SearchYoung.gateway";
import { SearchSchoolGateway } from "@analytics/core/SearchSchool.gateway";
import { SearchCentreGateway } from "@analytics/core/SearchCentre.gateway";
import { SearchSejourGateway } from "@analytics/core/SearchSejour.gateway";
import { SearchLigneDeBusGateway } from "@analytics/core/SearchLigneDeBus.gateway";
import { SearchPointDeRassemblementGateway } from "@analytics/core/SearchPointDeRassemblement.gateway";
import { SearchSegmentDeLigneGateway } from "@analytics/core/SearchSegmentDeLigne.gateway";
import { SearchClasseGateway } from "@analytics/core/SearchClasse.gateway";
import { SearchEtablissementGateway } from "@analytics/core/SearchEtablissement.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ElasticsearchQueryBuilder } from "@analytics/infra/ElasticQuery.builder";

import { SejourGateway } from "../sejour/Sejour.gateway";
import { SessionGateway } from "../session/Session.gateway";
import { ExporterJeunes } from "./ExporterJeunes";
import { ExporterJeuneService } from "./ExporterJeune.service";
import { FunctionalException } from "@shared/core/FunctionalException";

const STOP = new Error("STOP_AVANT_ELASTICSEARCH");

describe("ExporterJeunes - périmètre", () => {
    let exporterJeunes: ExporterJeunes;
    let searchYoungGateway: { searchYoung: jest.Mock };
    let referentGateway: { findById: jest.Mock };
    let candidatureGateway: { findByStructureId: jest.Mock; findByStructureIds: jest.Mock };

    beforeEach(async () => {
        const mock = () => ({});
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExporterJeunes,
                ExporterJeuneService,
                { provide: ReferentGateway, useValue: { findById: jest.fn() } },
                { provide: StructureGateway, useValue: { findByIdOrNetworkId: jest.fn().mockResolvedValue([]) } },
                { provide: SejourGateway, useValue: mock() },
                { provide: SessionGateway, useValue: mock() },
                {
                    provide: CandidatureGateway,
                    useValue: { findByStructureId: jest.fn(), findByStructureIds: jest.fn() },
                },
                { provide: SearchYoungGateway, useValue: { searchYoung: jest.fn().mockRejectedValue(STOP) } },
                { provide: SearchSchoolGateway, useValue: mock() },
                { provide: SearchCentreGateway, useValue: mock() },
                { provide: SearchSejourGateway, useValue: mock() },
                { provide: SearchLigneDeBusGateway, useValue: mock() },
                { provide: SearchPointDeRassemblementGateway, useValue: mock() },
                { provide: SearchSegmentDeLigneGateway, useValue: mock() },
                { provide: SearchClasseGateway, useValue: mock() },
                { provide: SearchEtablissementGateway, useValue: mock() },
                { provide: FileGateway, useValue: mock() },
                { provide: ClockGateway, useValue: { now: () => new Date(), addMonths: () => new Date() } },
                { provide: CryptoGateway, useValue: mock() },
                { provide: NotificationGateway, useValue: { sendEmail: jest.fn() } },
                { provide: ConfigService, useValue: { get: jest.fn(), getOrThrow: jest.fn() } },
            ],
        }).compile();

        exporterJeunes = module.get(ExporterJeunes);
        searchYoungGateway = module.get(SearchYoungGateway);
        referentGateway = module.get(ReferentGateway);
        candidatureGateway = module.get(CandidatureGateway);
    });

    const exporter = (auteur: object, filters: object = {}) =>
        exporterJeunes.execute({
            name: "volontaire",
            format: "volontaire",
            filters,
            fields: ["identity", "contact", "situation", "representative1"],
            auteur: { prenom: "P", nom: "N", ...auteur },
        } as any);

    it("refuse l'export d'un responsable dont la structure n'a aucune candidature", async () => {
        referentGateway.findById.mockResolvedValue({ id: "ref-1", structureId: "structure-neuve" });
        candidatureGateway.findByStructureId.mockResolvedValue([]); // structure nouvelle / inactive

        await expect(exporter({ id: "ref-1", role: ROLES.RESPONSIBLE })).rejects.toThrow(FunctionalException);
        expect(searchYoungGateway.searchYoung).not.toHaveBeenCalled();
    });

    it("refuse l'export d'un superviseur dont le réseau n'a aucune candidature", async () => {
        referentGateway.findById.mockResolvedValue({ id: "ref-2", structureId: "structure-tete-de-reseau" });
        candidatureGateway.findByStructureIds.mockResolvedValue([]);

        await expect(exporter({ id: "ref-2", role: ROLES.SUPERVISOR })).rejects.toThrow(FunctionalException);
        expect(searchYoungGateway.searchYoung).not.toHaveBeenCalled();
    });

    it("contraint l'export d'un responsable aux candidats de sa structure, via une requête ES `ids` valide", async () => {
        referentGateway.findById.mockResolvedValue({ id: "ref-1", structureId: "structure-active" });
        candidatureGateway.findByStructureId.mockResolvedValue([{ jeuneId: "jeune-1" }, { jeuneId: "jeune-2" }]);

        await expect(exporter({ id: "ref-1", role: ROLES.RESPONSIBLE })).rejects.toThrow(STOP);

        const params = searchYoungGateway.searchYoung.mock.calls[0][0];
        expect(params.musts).toEqual({ ids: ["jeune-1", "jeune-2"] });

        const query = new ElasticsearchQueryBuilder("young").setMusts(params.musts).build();
        expect(query.body.query.bool.must).toEqual([{ ids: { values: ["jeune-1", "jeune-2"] } }]);
    });

    it("ramène schoolDepartment au périmètre du référent départemental", async () => {
        referentGateway.findById.mockResolvedValue({ id: "ref-dep", departement: ["Gironde"] });

        await expect(
            exporter(
                { id: "ref-dep", role: ROLES.REFERENT_DEPARTMENT },
                { schoolDepartment: ["Gironde", "Paris", "Nord", "Rhône"] },
            ),
        ).rejects.toThrow(STOP);

        const params = searchYoungGateway.searchYoung.mock.calls[0][0];
        expect(params.filters.schoolDepartment).toEqual(["Gironde"]);
    });

    it("refuse un schoolDepartment entièrement hors périmètre", async () => {
        referentGateway.findById.mockResolvedValue({ id: "ref-dep", departement: ["Gironde"] });

        await expect(
            exporter({ id: "ref-dep", role: ROLES.REFERENT_DEPARTMENT }, { schoolDepartment: ["Paris"] }),
        ).rejects.toThrow(ForbiddenException);
        expect(searchYoungGateway.searchYoung).not.toHaveBeenCalled();
    });

    it("impose le département de résidence quand aucun filtre scolarisé n'est demandé", async () => {
        referentGateway.findById.mockResolvedValue({ id: "ref-dep", departement: ["Gironde"] });

        await expect(exporter({ id: "ref-dep", role: ROLES.REFERENT_DEPARTMENT })).rejects.toThrow(STOP);

        const params = searchYoungGateway.searchYoung.mock.calls[0][0];
        expect(params.filters.department).toEqual(["Gironde"]);
    });

    it("ignore schoolRegion (hors liste blanche) et impose la région du référent régional", async () => {
        referentGateway.findById.mockResolvedValue({ id: "ref-reg", region: "Nouvelle-Aquitaine" });

        await expect(
            exporter(
                { id: "ref-reg", role: ROLES.REFERENT_REGION },
                { schoolRegion: ["Nouvelle-Aquitaine", "Île-de-France"] },
            ),
        ).rejects.toThrow(STOP);

        const params = searchYoungGateway.searchYoung.mock.calls[0][0];
        // `schoolRegion` n'est pas dans getAllowedFilters : il est retiré avant tout traitement.
        expect(params.filters.schoolRegion).toBeUndefined();
        expect(params.filters.region).toEqual(["Nouvelle-Aquitaine"]);
    });

    it("impose la région de résidence quand aucun filtre scolarisé n'est demandé", async () => {
        referentGateway.findById.mockResolvedValue({ id: "ref-reg", region: "Nouvelle-Aquitaine" });

        await expect(exporter({ id: "ref-reg", role: ROLES.REFERENT_REGION })).rejects.toThrow(STOP);

        const params = searchYoungGateway.searchYoung.mock.calls[0][0];
        expect(params.filters.region).toEqual(["Nouvelle-Aquitaine"]);
    });
});

describe("isExportScolariseAllowed", () => {
    const service = new ExporterJeuneService();

    it.each([
        [
            "référent départemental dans son département",
            { role: ROLES.REFERENT_DEPARTMENT, departement: ["Gironde"] },
            ["Gironde"],
            undefined,
            true,
        ],
        [
            "référent départemental hors de son département",
            { role: ROLES.REFERENT_DEPARTMENT, departement: ["Gironde"] },
            ["Paris"],
            undefined,
            false,
        ],
        [
            "référent départemental mêlant un département légitime et d'autres",
            { role: ROLES.REFERENT_DEPARTMENT, departement: ["Gironde"] },
            ["Gironde", "Paris"],
            undefined,
            false,
        ],
        [
            "référent régional dans sa région",
            { role: ROLES.REFERENT_REGION, region: "Bretagne" },
            undefined,
            "Bretagne",
            true,
        ],
        [
            "référent régional hors de sa région",
            { role: ROLES.REFERENT_REGION, region: "Bretagne" },
            undefined,
            "Île-de-France",
            false,
        ],
        [
            "référent régional demandant un département",
            { role: ROLES.REFERENT_REGION, region: "Bretagne" },
            ["Gironde"],
            undefined,
            false,
        ],
        [
            "responsable de structure demandant une région",
            { role: ROLES.RESPONSIBLE, region: "Bretagne" },
            undefined,
            "Bretagne",
            false,
        ],
        [
            "superviseur demandant un département",
            { role: ROLES.SUPERVISOR, departement: ["Gironde"] },
            ["Gironde"],
            undefined,
            false,
        ],
        ["admin", { role: ROLES.ADMIN }, ["Gironde"], undefined, true],
        ["aucun périmètre", { role: ROLES.ADMIN }, undefined, undefined, false],
        ["les deux périmètres à la fois", { role: ROLES.ADMIN }, ["Gironde"], "Bretagne", false],
    ])("%s -> %j", (_libelle, user, departement, region, attendu) => {
        expect(service.isExportScolariseAllowed(user as any, departement as any, region as any)).toBe(attendu);
    });
});
