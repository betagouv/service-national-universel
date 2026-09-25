/**
 * Filtres des exports missions / candidatures (L39) : seules les clés de la liste des
 * missions de l'admin atteignent la requête ES, et le périmètre imposé par rôle n'est pas
 * contournable par une clé du payload.
 */
import { Test } from "@nestjs/testing";
import { ROLES } from "snu-lib";

import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { StructureGateway } from "@admin/core/engagement/structure/Structure.gateway";
import { SearchMissionGateway } from "@analytics/core/SearchMission.gateway";
import { SearchReferentGateway } from "@analytics/core/SearchReferent.gateway";
import { SearchStructureGateway } from "@analytics/core/SearchStructure.gateway";

import { ExportMissionService } from "./ExportMission.service";

describe("ExportMissionService - filtres d'export", () => {
    let service: ExportMissionService;
    let searchMission: jest.Mock;
    let findReferent: jest.Mock;

    beforeEach(async () => {
        searchMission = jest.fn().mockResolvedValue({ hits: [], total: 0 });
        findReferent = jest.fn().mockResolvedValue({ id: "ref-1", structureId: "structure-1" });
        const module = await Test.createTestingModule({
            providers: [
                ExportMissionService,
                { provide: ReferentGateway, useValue: { findById: findReferent } },
                { provide: StructureGateway, useValue: { findByIdOrNetworkId: jest.fn().mockResolvedValue([]) } },
                { provide: SearchMissionGateway, useValue: { searchMission } },
                { provide: SearchReferentGateway, useValue: {} },
                { provide: SearchStructureGateway, useValue: {} },
            ],
        }).compile();
        service = module.get(ExportMissionService);
    });

    it("écarte les clés inconnues et les valeurs non textuelles", () => {
        expect(
            service.filtrerFiltresExport({
                status: ["VALIDATED"],
                region: "Bretagne",
                "tutor.email": ["x@y.fr"],
                department: [{ $ne: "x" }],
                mainDomain: { script: "..." },
            }),
        ).toEqual({ status: ["VALIDATED"], region: "Bretagne" });
    });

    it("ne transmet à ES que les filtres autorisés", async () => {
        await service.searchMissions({
            filters: { status: ["VALIDATED"], youngDepartment: ["75"], _id: "x" },
            auteur: { id: "ref-1", role: ROLES.ADMIN },
        });

        const { filters } = searchMission.mock.calls[0][0];
        expect(filters).toEqual({ status: ["VALIDATED"], fromDate: "", toDate: "" });
    });

    it("impose la structure d'un responsable quelle que soit la clé envoyée", async () => {
        await service.searchMissions({
            filters: { structureId: ["autre-structure"], status: ["VALIDATED"] },
            auteur: { id: "ref-1", role: ROLES.RESPONSIBLE },
        });

        const { filters } = searchMission.mock.calls[0][0];
        expect(filters.structureId).toBe("structure-1");
    });
});
