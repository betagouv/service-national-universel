import { Inject, Injectable, Logger } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";

import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";

import { SejourModel } from "../sejour/Sejour.model";
import { JeuneModel } from "../../jeune/Jeune.model";
import { ClasseModel } from "../../cle/classe/Classe.model";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { EtablissementModel } from "../../cle/etablissement/Etablissement.model";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { ClasseGateway } from "../../cle/classe/Classe.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { EtablissementGateway } from "../../cle/etablissement/Etablissement.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";

type JeuneRapport = {
    "id du volontaire": string;
    Cohort: string;
    Statut: string;
    "Statut de phase 1": string;
    "id du bus": string;
    "Nom du bus": string;
    "id du centre": string;
    "Nom du centre": string;
    "Département du centre": string;
    "Région du centre": string;
    "id classe": string;
    "Nom de la classe": string;
    "Nom de l'établissement": string;
    "Département de l'établissement": string;
    "Région de l'établissement": string;
    sejourId: string;
    classeCenterId: string;
    pointDeRassemblementId: string;
    jeuneLigneId: string;
};

type CentreRapport = {
    id: string;
    "Nom du centre": string;
    "Département du centre": string;
    "Région du centre": string;
    "Places disponibles": number;
    "Places occupées": number;
    "Places restantes": number;
};

type LigneBusRapport = {
    id: string;
    "Nom du bus": string;
    "id du centre": string;
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
    "id classe": string;
    "Nom de la classe": string;
    "Nom de l'établissement": string;
    "Département de l'établissement": string;
    "Région de l'établissement": string;
    "id du centre": string;
    "id du bus": string;
    Erreur: string;
    "Nombre de volontaires": number;
    "Capacité du bus ou de la session"?: number;
    "Lien de la classe": string;
    "Lien du centre": string;
    "Lien du bus"?: string;
};

export type SimulationResultats = {
    jeunesList: JeuneModel[];
    jeunesDejaAffectedList: JeuneModel[];
    sejourList: {
        sejour: SejourModel;
        placeOccupees: number;
        placeRestantes: number;
    }[];
    ligneDeBusList?: {
        ligneDeBus: LigneDeBusModel;
        classeId: string;
        sejourId: string;
        pdr: PointDeRassemblementModel;
        placeOccupees: number;
        placeRestantes: number;
    }[];
    classeErreurList: ClasseErreur[];
};

export type ClasseErreur = {
    classe: ClasseModel;
    ligneBus?: LigneDeBusModel;
    sejour?: SejourModel;
    jeunesNombre?: number;
    message: string;
    placesRestantes?: number;
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
    ERREURS: "Erreurs",
};

@Injectable()
export class SimulationAffectationCLEService {
    constructor(
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(EtablissementGateway) private readonly etablissementGateway: EtablissementGateway,
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        @Inject(FileGateway) private readonly fileService: FileGateway,
        private readonly logger: Logger,
    ) {}

    async loadAffectationData(sessionId: string, departements: string[]) {
        const classeList = await this.classeGateway.findBySessionIdAndDepartmentNotWithdrawn(sessionId, departements);
        if (classeList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucune classes !");
        }

        const etablissementIds = [...new Set(classeList.map((classe) => classe.etablissementId))];
        const etablissementList = await this.etablissementGateway.findByIds(etablissementIds);

        const referentIds = [...new Set(classeList.flatMap((classe) => classe.referentClasseIds))];
        const referentsList = await this.referentGateway.findByIds(referentIds);

        return { classeList, etablissementList, referentsList };
    }

    async loadClasseData(sessionId: string, classe: ClasseModel, etranger: boolean) {
        const jeunesClasseList = await this.jeuneGateway.findBySessionIdClasseIdAndStatus(
            sessionId,
            classe.id,
            YOUNG_STATUS.VALIDATED,
        );

        let jeunesList = jeunesClasseList.filter((jeune) => jeune.statutPhase1 !== YOUNG_STATUS_PHASE1.AFFECTED);
        if (!etranger) {
            jeunesList = jeunesList.filter((jeune) => jeune.paysScolarite?.toUpperCase() === "FRANCE");
        }

        const jeunesDejaAffectedList = jeunesClasseList.filter(
            (jeune) => jeune.statutPhase1 === YOUNG_STATUS_PHASE1.AFFECTED,
        );
        if (jeunesDejaAffectedList.length > 0) {
            this.logger.log(`Classes ${classe.id}: jeunes déjà affecté ${jeunesDejaAffectedList.length}`);
        }

        const sejour = await this.sejourGateway.findById(classe.sejourId!);

        return { jeunesList, jeunesDejaAffectedList, sejour };
    }

    checkPlacesRestantesLigneBus(
        resultats: SimulationResultats,
        jeunesList: JeuneModel[],
        classe: ClasseModel,
        sejour: SejourModel,
        ligneBus: LigneDeBusModel,
        pointDeRassemblement: PointDeRassemblementModel,
    ) {
        const resultatLigneBus = resultats.ligneDeBusList?.find((r) => r.ligneDeBus.id === ligneBus.id);
        let placesRestantes =
            resultatLigneBus?.placeRestantes || ligneBus.capaciteJeunes - ligneBus.placesOccupeesJeunes || 0;
        if (placesRestantes < jeunesList.length) {
            resultats.classeErreurList.push({
                message: "La capacité du bus est trop faible",
                classe,
                ligneBus,
                jeunesNombre: jeunesList.length,
                placesRestantes,
            });
            return false;
        }
        if (!resultatLigneBus) {
            resultats.ligneDeBusList?.push({
                ligneDeBus: ligneBus,
                classeId: classe.id,
                sejourId: sejour.id,
                pdr: pointDeRassemblement,
                placeOccupees: ligneBus.placesOccupeesJeunes + jeunesList.length,
                placeRestantes: ligneBus.capaciteJeunes - ligneBus.placesOccupeesJeunes - jeunesList.length,
            });
        } else {
            resultatLigneBus.placeOccupees += jeunesList.length;
            resultatLigneBus.placeRestantes -= jeunesList.length;
        }
        return true;
    }

    checkPlacesRestantesCentre(
        resultats: SimulationResultats,
        jeunesList: JeuneModel[],
        classe: ClasseModel,
        sejour: SejourModel,
    ) {
        const resultatCentre = resultats.sejourList.find((r) => r.sejour.id === sejour.id);
        const placesRestantes = resultatCentre?.placeRestantes || sejour.placesRestantes || 0;
        if (placesRestantes < jeunesList.length) {
            resultats.classeErreurList.push({
                message: "La capacité de la session est trop faible",
                classe,
                ligneBus: undefined,
                sejour,
                jeunesNombre: jeunesList.length,
                placesRestantes,
            });
            return false;
        }
        if (!resultatCentre) {
            resultats.sejourList.push({
                sejour: sejour,
                placeOccupees: (sejour.placesTotal || 0) - (sejour.placesRestantes || 0) + jeunesList.length,
                placeRestantes: (sejour.placesRestantes || 0) - jeunesList.length,
            });
        } else {
            resultatCentre.placeOccupees += jeunesList.length;
            resultatCentre.placeRestantes -= jeunesList.length;
        }
        return true;
    }

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
        sejourList: {
            sejour: SejourModel;
            placeOccupees: number;
            placeRestantes: number;
        }[],
        classeErreurList: ClasseErreur[],
        classeList: ClasseModel[],
        etablissementList: EtablissementModel[],
        referentsList: ReferentModel[],
    ): RapportData {
        const jeunesNouvellementAffectedList = jeunesList
            .filter((jeune) => jeune.statutPhase1 === YOUNG_STATUS_PHASE1.AFFECTED)
            .map((jeune) => {
                // ligneDeBus uniquement pour les metropole
                const ligneBus = ligneDeBusList.find((ligneBus) => ligneBus.ligneDeBus.id === jeune.ligneDeBusId)
                    ?.ligneDeBus;
                const sejour = sejourList.find((centre) => centre.sejour.id === jeune.sejourId)?.sejour;
                const classe = classeList.find((classe) => classe.id === jeune.classeId)!;
                const etablissement = etablissementList.find(
                    (etablissement) => etablissement.id === classe.etablissementId,
                );

                const referentClasse = referentsList.find((referent) => classe.referentClasseIds.includes(referent.id));

                return {
                    "id du volontaire": jeune.id,
                    Nom: jeune.nom,
                    Prenom: jeune.prenom,
                    Email: jeune.email,
                    Cohort: jeune.sessionNom!,
                    Statut: jeune.statut,
                    "Statut de phase 1": jeune.statutPhase1,
                    ...(ligneBus
                        ? {
                              "id du bus": ligneBus?.id,
                              "Nom du bus": ligneBus?.numeroLigne,
                          }
                        : {}),
                    "id du centre": jeune.centreId!,
                    // "matricule du centre": centre?.,
                    "Nom du centre": sejour?.centreNom!,
                    "Département du centre": sejour?.departement!,
                    "Région du centre": sejour?.region!,
                    "id classe": jeune.classeId!,
                    "Nom de la classe": classe.nom!,
                    "Nom de l'établissement": etablissement?.nom,
                    "Département de l'établissement": etablissement?.departement,
                    "Région de l'établissement": etablissement?.region,
                    "Référent de classe Nom": referentClasse?.nomComplet,
                    "Référent de classe Email": referentClasse?.email,
                    sejourId: jeune.sejourId!,
                    classeCenterId: classe.centreCohesionId!,
                    ...(ligneBus
                        ? {
                              pointDeRassemblementId: jeune.pointDeRassemblementId!,
                              jeuneLigneId: jeune.ligneDeBusId!,
                          }
                        : {}),
                } as JeuneRapport;
            });

        const centreListRapport = sejourList.map((info) => {
            const sejour = info.sejour;
            return {
                id: sejour.centreId,
                "Nom du centre": sejour.centreNom,
                "Département du centre": sejour.departement,
                "Région du centre": sejour.region,
                "Places disponibles": sejour.placesTotal || 0,
                "Places occupées": info.placeOccupees,
                "Places restantes": info.placeRestantes,
            } as CentreRapport;
        });

        const ligneBusRapport = ligneDeBusList.map((ligneBusResults) => {
            const ligneDeBus = ligneBusResults.ligneDeBus;
            const classe = classeList.find((classe) => classe.id === ligneBusResults.classeId)!;
            const sejour = sejourList.find((centre) => centre.sejour.id === ligneBusResults.sejourId)!.sejour;
            return {
                id: ligneDeBus.id,
                "Nom du bus": ligneDeBus.numeroLigne,
                "id du centre": classe.centreCohesionId,
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
            const ligneBus = erreur.ligneBus;
            const sejour = erreur.sejour;
            return {
                "id classe": classe.id,
                "Nom de la classe": classe.nom,
                "Nom de l'établissement": etablissement?.nom,
                "Département de l'établissement": etablissement?.departement,
                "Région de l'établissement": etablissement?.region,
                "id du centre": classe.centreCohesionId,
                "Nom du centre": sejour?.centreNom,
                "id du bus": ligneBus?.id,
                "Nom du bus": ligneBus?.numeroLigne,
                Erreur: erreur.message,
                "Nombre de volontaires": erreur.jeunesNombre,
                "Capacité du bus ou de la session": erreur.placesRestantes,
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

    async generateRapportExcel(rapportData: RapportData, type: "CLE" | "CLE_DROMCOM"): Promise<Buffer> {
        return this.fileService.generateExcel({
            [RAPPORT_SHEETS.RESUME]: rapportData.summary,
            [RAPPORT_SHEETS.VOLONTAIRES]: rapportData.jeunesNouvellementAffectedList,
            [RAPPORT_SHEETS.CENTRES]: rapportData.centreList,
            ...(type === "CLE"
                ? {
                      [RAPPORT_SHEETS.BUS]: rapportData.ligneDeBusList,
                  }
                : {}),
            [RAPPORT_SHEETS.ERREURS]: rapportData.erreurList,
        });
    }
}
