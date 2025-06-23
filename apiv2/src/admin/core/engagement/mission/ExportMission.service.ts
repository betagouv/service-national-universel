import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { SearchReferentGateway } from "@analytics/core/SearchReferent.gateway";
import { SearchStructureGateway } from "@analytics/core/SearchStructure.gateway";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { MissionType, ReferentType, ROLES, StructureType } from "snu-lib";
import { StructureGateway } from "../structure/Structure.gateway";
import { SearchMissionGateway } from "@analytics/core/SearchMission.gateway";

@Injectable()
export class ExportMissionService {
    private readonly logger: Logger = new Logger(ExportMissionService.name);

    constructor(
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(StructureGateway) private readonly structureGateway: StructureGateway,
        @Inject(SearchMissionGateway) private readonly searchMissionGateway: SearchMissionGateway,
        @Inject(SearchReferentGateway) private readonly searchReferentGateway: SearchReferentGateway,
        @Inject(SearchStructureGateway) private readonly searchStructureGateway: SearchStructureGateway,
    ) {}

    async searchMissions({
        filters,
        searchTerm,
        auteur,
    }: {
        filters: Record<string, string | string[]>;
        searchTerm?: string;
        fields?: string[];
        auteur: any;
    }) {
        if (!auteur.id) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "aureur.id is required");
        }
        const referent = await this.referentGateway.findById(auteur.id);
        if (!referent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, `Referent not found: ${auteur.id}`);
        }

        if (auteur.role === ROLES.RESPONSIBLE) {
            if (!referent.structureId) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_ENOUGH_DATA,
                    "Referent structureId is required",
                );
            }
            filters.structureId = referent.structureId;
        }
        if (auteur.role === ROLES.SUPERVISOR) {
            if (!referent.structureId) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_ENOUGH_DATA,
                    "Referent structureId is required",
                );
            }
            const structures = await this.structureGateway.findByIdOrNetworkId(referent.structureId);
            filters.structureId = structures.map((structure) => structure.id);
        }

        this.logger.log(`${JSON.stringify({ filters, searchTerm }, null, 2)}`);

        const missions = await this.searchMissionGateway.searchMission({
            filters: {
                ...filters,
                fromDate: "",
                toDate: "",
            },
            ranges:
                filters.fromDate?.length || filters.toDate?.length
                    ? {
                          startAt: { from: filters.fromDate?.length ? new Date(filters.fromDate[0]) : undefined },
                          endAt: { to: filters.toDate?.length ? new Date(filters.toDate[0]) : undefined },
                      }
                    : undefined,
            searchTerm: searchTerm
                ? { value: searchTerm, fields: ["name", "structureName", "city", "zip"] }
                : undefined,
            full: true,
            sortField: "createdAt",
            sortOrder: "desc",
        });

        return { missions, referent };
    }

    async retrieveTutors(missions: MissionType[]) {
        // prepare tutors for search
        const tutorsById: Record<string, Partial<ReferentType>> = missions.reduce(
            (acc, mission) => {
                if (mission.tutorId) {
                    acc[mission.tutorId] = { _id: mission.tutorId };
                }
                return acc;
            },
            {} as Record<string, Partial<ReferentType>>,
        );
        const nbTutors = Object.keys(tutorsById).length;
        this.logger.log(`tutors count: ${nbTutors}`);

        // search tutors data
        const tutors = await this.searchReferentGateway.searchReferent({
            musts: { ids: Object.keys(tutorsById) },
            full: true,
        });
        this.logger.log(`tutors search count: ${tutors.hits.length}`);
        if (tutors.hits.length === 0) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `nbTutors: ${nbTutors} !== searchCount: ${tutors.hits.length}`,
            );
        }
        tutors.hits.forEach((tutor) => {
            tutorsById[tutor._id] = tutor;
        });

        return tutorsById;
    }

    async retrieveStructures(missions: MissionType[]) {
        // prepare structures for search
        const structuresById: Record<string, Partial<StructureType>> = missions.reduce(
            (acc, mission) => {
                if (mission.structureId) {
                    acc[mission.structureId] = { _id: mission.structureId };
                }
                return acc;
            },
            {} as Record<string, Partial<StructureType>>,
        );
        const nbStructures = Object.keys(structuresById).length;
        this.logger.log(`structures count: ${nbStructures}`);

        // search structures data
        const structures = await this.searchStructureGateway.searchStructure({
            musts: { ids: Object.keys(structuresById) },
            full: true,
        });
        this.logger.log(`structures search count: ${structures.hits.length}`);
        if (structures.hits.length === 0) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `nbStructures: ${nbStructures} !== searchCount: ${structures.hits.length}`,
            );
        }
        structures.hits.forEach((structure) => {
            structuresById[structure._id] = structure;
        });

        return structuresById;
    }
}
