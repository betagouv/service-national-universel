/**
 * Périmètre territorial de l'export missions (PH21, PM39).
 *
 * `searchMissions` ne rescopait que RESPONSIBLE et SUPERVISOR : un référent départemental ou
 * régional obtenait l'export de toutes les missions du pays (contacts des tuteurs compris),
 * alors que la liste et l'export v1 sont bornés à son territoire depuis GOO-45. Un superviseur
 * dont le structureId ne désigne plus aucune structure/réseau obtenait le même résultat
 * (filters.structureId = [] est ignoré silencieusement par le builder Elasticsearch).
 */
import { Test, TestingModule } from "@nestjs/testing";
import { ROLES } from "snu-lib";

import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { StructureGateway } from "@admin/core/engagement/structure/Structure.gateway";
import { SearchMissionGateway } from "@analytics/core/SearchMission.gateway";
import { SearchReferentGateway } from "@analytics/core/SearchReferent.gateway";
import { SearchStructureGateway } from "@analytics/core/SearchStructure.gateway";
import { FunctionalException } from "@shared/core/FunctionalException";

import { ExportMissionService } from "./ExportMission.service";

describe("ExportMissionService - périmètre territorial", () => {
    let service: ExportMissionService;
    let searchMission: jest.Mock;
    let findReferent: jest.Mock;
    let findByIdOrNetworkId: jest.Mock;

    beforeEach(async () => {
        searchMission = jest.fn().mockResolvedValue({ hits: [], total: 0 });
        findReferent = jest.fn();
        findByIdOrNetworkId = jest.fn().mockResolvedValue([]);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExportMissionService,
                { provide: ReferentGateway, useValue: { findById: findReferent } },
                { provide: StructureGateway, useValue: { findByIdOrNetworkId } },
                { provide: SearchMissionGateway, useValue: { searchMission } },
                { provide: SearchReferentGateway, useValue: {} },
                { provide: SearchStructureGateway, useValue: {} },
            ],
        }).compile();
        service = module.get(ExportMissionService);
    });

    it("borne l'export d'un référent départemental à son département, en écrasant la valeur cliente", async () => {
        findReferent.mockResolvedValue({ id: "ref-1", departement: ["Gironde"] });

        await service.searchMissions({
            filters: { department: ["Paris"], status: ["VALIDATED"] },
            auteur: { id: "ref-1", role: ROLES.REFERENT_DEPARTMENT },
        });

        const { filters } = searchMission.mock.calls[0][0];
        expect(filters.department).toEqual(["Gironde"]);
    });

    it("refuse l'export d'un référent départemental sans département", async () => {
        findReferent.mockResolvedValue({ id: "ref-1", departement: [] });

        await expect(
            service.searchMissions({
                filters: {},
                auteur: { id: "ref-1", role: ROLES.REFERENT_DEPARTMENT },
            }),
        ).rejects.toThrow(FunctionalException);
        expect(searchMission).not.toHaveBeenCalled();
    });

    it("borne l'export d'un référent régional à sa région, en écrasant la valeur cliente", async () => {
        findReferent.mockResolvedValue({ id: "ref-2", region: "Bretagne" });

        await service.searchMissions({
            filters: { region: ["Île-de-France"] },
            auteur: { id: "ref-2", role: ROLES.REFERENT_REGION },
        });

        const { filters } = searchMission.mock.calls[0][0];
        expect(filters.region).toEqual(["Bretagne"]);
    });

    it("refuse l'export d'un référent régional sans région", async () => {
        findReferent.mockResolvedValue({ id: "ref-2", region: "" });

        await expect(
            service.searchMissions({
                filters: {},
                auteur: { id: "ref-2", role: ROLES.REFERENT_REGION },
            }),
        ).rejects.toThrow(FunctionalException);
        expect(searchMission).not.toHaveBeenCalled();
    });

    it("refuse l'export d'un superviseur dont le structureId ne désigne plus aucune structure", async () => {
        findReferent.mockResolvedValue({ id: "ref-3", structureId: "structure-disparue" });
        findByIdOrNetworkId.mockResolvedValue([]);

        await expect(
            service.searchMissions({
                filters: {},
                auteur: { id: "ref-3", role: ROLES.SUPERVISOR },
            }),
        ).rejects.toThrow(FunctionalException);
        expect(searchMission).not.toHaveBeenCalled();
    });

    it("borne l'export d'un superviseur aux structures de son réseau", async () => {
        findReferent.mockResolvedValue({ id: "ref-4", structureId: "structure-tete-de-reseau" });
        findByIdOrNetworkId.mockResolvedValue([{ id: "structure-a" }, { id: "structure-b" }]);

        await service.searchMissions({
            filters: {},
            auteur: { id: "ref-4", role: ROLES.SUPERVISOR },
        });

        const { filters } = searchMission.mock.calls[0][0];
        expect(filters.structureId).toEqual(["structure-a", "structure-b"]);
    });
});
