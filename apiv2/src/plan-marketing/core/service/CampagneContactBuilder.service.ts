import { Inject, Injectable } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { YoungType } from "snu-lib";
import { ColumnCsvName, ColumnType } from "../ListeDiffusion.model";
import { CentreModel } from "@admin/core/sejours/phase1/centre/Centre.model";
import { PointDeRassemblementModel } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.model";
import { LigneDeBusModel } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.model";
import { SegmentDeLigneModel } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.model";
import { ReferentModel } from "@admin/core/iam/Referent.model";

@Injectable()
export class CampagneContactBuilderService {
    constructor(@Inject(ClockGateway) private readonly clockGateway: ClockGateway) {}

    buildYoungContactRow(
        young: YoungType,
        centres: CentreModel[],
        pointDeRassemblements: PointDeRassemblementModel[],
        lignes: LigneDeBusModel[],
        segmentDeLignes: SegmentDeLigneModel[],
    ): ColumnCsvName {
        const dateAller = lignes.find((ligne) => ligne.id === young.ligneId)?.dateDepart;
        const dateRetour = lignes.find((ligne) => ligne.id === young.ligneId)?.dateRetour;

        return {
            type: ColumnType.jeunes,
            PRENOM: young.firstName,
            NOM: young.lastName,
            EMAIL: young.email,
            COHORT: young.cohort,
            CENTRE: centres.find((centre) => centre?.id === young.cohesionCenterId)?.nom,
            VILLECENTRE: centres.find((centre) => centre?.id === young.cohesionCenterId)?.ville,
            PRENOMVOLONTAIRE: young.firstName,
            NOMVOLONTAIRE: young.lastName,
            PDR_ALLER: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.nom,
            PDR_ALLER_ADRESSE: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.adresse,
            PDR_ALLER_VILLE: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.ville,
            PDR_RETOUR: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.nom,
            PDR_RETOUR_VILLE: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.ville,
            PDR_RETOUR_ADRESSE: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.adresse,
            DATE_ALLER: this.clockGateway.isValidDate(dateAller) ? this.clockGateway.formatShort(dateAller) : "",
            HEURE_ALLER: segmentDeLignes.find((segment) => segment?.ligneDeBusId === young.ligneId)?.heureDepart,
            DATE_RETOUR: this.clockGateway.isValidDate(dateRetour) ? this.clockGateway.formatShort(dateRetour) : "",
            HEURE_RETOUR: segmentDeLignes.find((segment) => segment?.ligneDeBusId === young.ligneId)?.heureRetour,
            PRENOM_RL1: "",
            NOM_RL1: "",
            PRENOM_RL2: "",
            NOM_RL2: "",
        };
    }

    buildParentContactRow(baseRow: ColumnCsvName, young: YoungType, isParent1: boolean): ColumnCsvName {
        return {
            ...baseRow,
            type: ColumnType.representants,
            PRENOM_RL1: isParent1 ? young.parent1FirstName : "",
            NOM_RL1: isParent1 ? young.parent1LastName : "",
            PRENOM_RL2: !isParent1 ? young.parent2FirstName : "",
            NOM_RL2: !isParent1 ? young.parent2LastName : "",
            EMAIL: isParent1 ? young.parent1Email : young.parent2Email,
        };
    }

    buildReferentContactRow(baseRow: ColumnCsvName, referent: ReferentModel, type: ColumnType): ColumnCsvName {
        return {
            ...baseRow,
            type,
            PRENOM: referent.prenom,
            NOM: referent.nom,
            EMAIL: referent.email,
        };
    }

    buildChefEtablissementContactRow(baseRow: ColumnCsvName, chefEtablissement: ReferentModel): ColumnCsvName {
        return {
            ...baseRow,
            type: ColumnType["chefs-etablissement"],
            PRENOM: chefEtablissement.prenom,
            NOM: chefEtablissement.nom,
            EMAIL: chefEtablissement.email,
        };
    }

    buildChefCentreContactRow(baseRow: ColumnCsvName, chefDeCentre: ReferentModel): ColumnCsvName {
        return {
            ...baseRow,
            type: ColumnType["chefs-centres"],
            PRENOM: chefDeCentre.prenom,
            NOM: chefDeCentre.nom,
            EMAIL: chefDeCentre.email,
        };
    }

    buildCoordinateurCleContactRow(baseRow: ColumnCsvName, coordinateurCle: ReferentModel): ColumnCsvName {
        return {
            ...baseRow,
            type: ColumnType.administrateurs,
            PRENOM: coordinateurCle.prenom,
            NOM: coordinateurCle.nom,
            EMAIL: coordinateurCle.email,
        };
    }
}
