import { Inject, Injectable } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";

import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";

import { SejourModel } from "../sejour/Sejour.model";
import { JeuneModel } from "../../jeune/Jeune.model";
import { ClasseModel } from "../../cle/classe/Classe.model";
import { YOUNG_STATUS_PHASE1 } from "snu-lib";
import { EtablissementModel } from "../../cle/etablissement/Etablissement.model";
import { ReferentModel } from "@admin/core/iam/Referent.model";

type JeuneRapport = {
    "_id du volontaire": string;
    Cohort: string;
    Statut: string;
    "Statut de phase 1": string;
    "_id du bus": string;
    "Nom du bus": string;
    "_id du centre": string;
    "Nom du centre": string;
    "Département du centre": string;
    "Région du centre": string;
    "_id classe": string;
    "Nom de la classe": string;
    "Nom de l'établissement": string;
    "Département de l'établissement": string;
    "Région de l'établissement": string;
    dev_sessionPhase1Id: string;
    dev_cohesionCenterId: string;
    dev_pointDeRassemblementId: string;
    dev_ligneId: string;
    dev_status: string;
    dev_statusPhase1: string;
};

type CentreRapport = {
    _id: string;
    "Nom du centre": string;
    "Département du centre": string;
    "Région du centre": string;
    "Places disponibles": number;
    "Places occupées": number;
    "Places restantes": number;
};

type LigneBusRapport = {
    _id: string;
    "Nom du bus": string;
    "_id du centre": string;
    "Nom du centre": string;
    "Département du centre": string;
    "Région du centre": string;
    "Point de rassemblement": string;
    "Département du point de rassemblement": string;
    "Région du point de rassemblement": string;
    "Places disponible": number;
    "Places occupées": number;
    "Places restantes": number;
};

type ErreurRapport = {
    "_id classe": string;
    "Nom de la classe": string;
    "Nom de l'établissement": string;
    "Département de l'établissement": string;
    "Région de l'établissement": string;
    "_id du centre": string;
    "_id du bus": string;
    Erreur: string;
    "Nombre de volontaires": number;
    "Capacité du bus ou de la session"?: number;
    "Lien de la classe": string;
    "Lien du centre": string;
    "Lien du bus"?: string;
};

export type RapportData = {
    summary: { [key: string]: string }[];
    jeunesNouvellementAffectedList: Array<JeuneRapport>;
    centreList: Array<CentreRapport>;
    ligneDeBusList: Array<LigneBusRapport>;
    erreurList: ErreurRapport[];
};

export const RAPPORT_SHEETS = {
    RESUME: "Résumé",
    VOLONTAIRES: "Volontaires",
    CENTRES: "Centres",
    BUS: "Bus",
    ERREURS: "Bugs",
};

@Injectable()
export class SimulationAffectationCLEService {
    constructor(@Inject(FileGateway) private readonly fileService: FileGateway) {}

    calculRapportAffectation(
        jeunesList: JeuneModel[],
        ligneDeBusList: {
            ligneDeBus: LigneDeBusModel;
            classeId: string;
            sejourId: string;
            pdr: PointDeRassemblementModel;
            placeOccupees: number;
            placeRestantes: number;
        }[],
        centreList: {
            sejour: SejourModel;
            placeOccupees: number;
            placeRestantes: number;
        }[],
        classeErreurList: {
            classe: ClasseModel;
            ligneBus?: LigneDeBusModel;
            sejour?: SejourModel;
            jeunesNombre?: number;
            message: string;
        }[],
        classeList: ClasseModel[],
        etablissementList: EtablissementModel[],
        referentsList: ReferentModel[],
    ): RapportData {
        const jeunesNouvellementAffectedList = jeunesList
            .filter((jeune) => jeune.statutPhase1 === YOUNG_STATUS_PHASE1.AFFECTED)
            .map((jeune) => {
                const ligneBus = ligneDeBusList.find(
                    (ligneBus) => ligneBus.ligneDeBus.id === jeune.ligneDeBusId,
                )!.ligneDeBus;
                const sejour = centreList.find((centre) => centre.sejour.id === jeune.sejourId)!.sejour;
                const classe = classeList.find((classe) => classe.id === jeune.classeId)!;
                const etablissement = etablissementList.find(
                    (etablissement) => etablissement.id === classe.etablissementId,
                );

                const referentClasse = referentsList.find((referent) => classe.referentClasseIds.includes(referent.id));

                return {
                    "_id du volontaire": jeune.id,
                    Nom: jeune.nom,
                    Prenom: jeune.prenom,
                    Email: jeune.email,
                    Cohort: jeune.sessionNom!,
                    Statut: jeune.statut,
                    "Statut de phase 1": "AFFECTED",
                    "_id du bus": ligneBus.id,
                    "Nom du bus": jeune.ligneDeBusId,
                    "_id du centre": jeune.centreId!,
                    "Nom du centre": sejour.centreNom!,
                    "Département du centre": sejour.departement!,
                    "Région du centre": sejour.region!,
                    "_id classe": jeune.classeId!,
                    "Nom de la classe": classe.nom!,
                    "Nom de l'établissement": etablissement?.nom,
                    "Département de l'établissement": etablissement?.departement,
                    "Région de l'établissement": etablissement?.region,
                    "Référent de classe Nom": referentClasse?.nomComplet,
                    "Référent de classe Email": referentClasse?.email,
                    dev_sessionPhase1Id: jeune.sejourId!,
                    dev_cohesionCenterId: classe.centreCohesionId!,
                    dev_pointDeRassemblementId: jeune.pointDeRassemblementId!,
                    dev_ligneId: jeune.ligneDeBusId!,
                    dev_status: jeune.statut,
                    dev_statusPhase1: "AFFECTED",
                } as JeuneRapport;
            });

        const centreListRapport = centreList.map((centre) => {
            const sejour = centre.sejour;
            return {
                _id: sejour.id,
                "Nom du centre": sejour.centreNom,
                "Département du centre": sejour.departement,
                "Région du centre": sejour.region,
                "Places disponibles": sejour.placesTotal || 0,
                "Places occupées": centre.placeOccupees,
                "Places restantes": centre.placeRestantes,
            } as CentreRapport;
        });

        const ligneBusRapport = ligneDeBusList.map((ligneBusResults) => {
            const ligneDeBus = ligneBusResults.ligneDeBus;
            const classe = classeList.find((classe) => classe.id === ligneBusResults.classeId)!;
            const sejour = centreList.find((centre) => centre.sejour.id === ligneBusResults.sejourId)!.sejour;
            return {
                _id: ligneDeBus.id,
                "Nom du bus": ligneDeBus.numeroLigne,
                "_id du centre": classe.centreCohesionId,
                "Nom du centre": sejour.centreNom,
                "Département du centre": sejour.departement,
                "Région du centre": sejour.region,
                "Point de rassemblement": ligneBusResults.pdr.nom,
                "Département du point de rassemblement": ligneBusResults.pdr.departement,
                "Région du point de rassemblement": ligneBusResults.pdr.region,
                "Places disponible": ligneDeBus.capaciteJeunes,
                "Places occupées": ligneBusResults.placeOccupees,
                "Places restantes": ligneBusResults.placeRestantes,
            } as LigneBusRapport;
        });

        const erreurListRapport = classeErreurList.map((erreur) => {
            const classe = erreur.classe;
            const etablissement = etablissementList.find(
                (etablissement) => etablissement.id === classe.etablissementId,
            );
            let placesRestantes;
            const ligneBus = erreur.ligneBus;
            if (ligneBus) {
                placesRestantes = ligneBus.capaciteJeunes - ligneBus.placesOccupeesJeunes;
            }
            const sejour = erreur.sejour;
            if (sejour) {
                placesRestantes = sejour.placesRestantes;
            }
            return {
                "_id classe": classe.id,
                "Nom de la classe": classe.nom,
                "Nom de l'établissement": etablissement?.nom,
                "Département de l'établissement": etablissement?.departement,
                "Région de l'établissement": etablissement?.region,
                "_id du centre": classe.centreCohesionId,
                "_id du bus": ligneBus?.id,
                "Nom du bus": ligneBus?.numeroLigne,
                Erreur: erreur.message,
                "Nombre de volontaires": erreur.jeunesNombre,
                "Capacité du bus ou de la session": placesRestantes,
                "Lien de la classe": `https://admin.snu.gouv.fr/classes/${classe.id}`,
                "Lien du centre": classe.centreCohesionId
                    ? `https://admin.snu.gouv.fr/centre/${classe.centreCohesionId}`
                    : "",
                "Lien du bus": ligneBus ? `https://admin.snu.gouv.fr/ligne-de-bus/${ligneBus.id}` : "",
            } as ErreurRapport;
        });

        const summary = [
            "Nombre de classes affectées : " + (classeList.length - classeErreurList.length),
            "Nombre de classes en erreur : " + classeErreurList.length,
            "Nombre de jeunes affectés : " + jeunesNouvellementAffectedList.length,
        ].map((ligne) => ({
            "": ligne,
        }));

        return {
            summary,
            jeunesNouvellementAffectedList,
            centreList: centreListRapport,
            ligneDeBusList: ligneBusRapport,
            erreurList: erreurListRapport,
        };
    }

    async generateRapportExcel(rapportData: RapportData): Promise<Buffer> {
        return this.fileService.generateExcel({
            [RAPPORT_SHEETS.RESUME]: rapportData.summary,
            [RAPPORT_SHEETS.VOLONTAIRES]: rapportData.jeunesNouvellementAffectedList,
            [RAPPORT_SHEETS.CENTRES]: rapportData.centreList,
            [RAPPORT_SHEETS.BUS]: rapportData.ligneDeBusList,
            [RAPPORT_SHEETS.ERREURS]: rapportData.erreurList,
        });
    }
}
