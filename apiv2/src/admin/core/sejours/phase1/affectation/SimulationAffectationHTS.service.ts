import { Inject, Injectable, Logger } from "@nestjs/common";

import { formatDepartement, getDepartmentByNumber, getDistance, YOUNG_STATUS_PHASE1 } from "snu-lib";

import { FileGateway } from "@shared/core/File.gateway";

import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { TaskGateway } from "@task/core/Task.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ReferentielImportTaskModel } from "@admin/core/referentiel/routes/ReferentielImportTask.model";
import { RouteXlsx } from "@admin/core/referentiel/routes/ReferentielRoutesModel";

import { SejourModel } from "../sejour/Sejour.model";
import { JeuneModel } from "../../jeune/Jeune.model";
import { CentreModel } from "../centre/Centre.model";
import { AffectationService } from "./Affectation.service";
import { SimulationAffectationHTSTaskModel } from "./SimulationAffectationHTSTask.model";

type JeuneRapport = Pick<
    JeuneModel,
    | "id"
    | "statutPhase1"
    | "genre"
    | "qpv"
    | "psh"
    | "sessionNom"
    | "regionScolarite"
    | "departementScolarite"
    | "pointDeRassemblementId"
    | "ligneDeBusId"
    | "centreId"
    | "statut"
    | "prenom"
    | "nom"
    | "handicapMemeDepartement"
> & {
    pointDeRassemblementMatricule?: string;
    ligneDeBusNumeroLigne?: string;
    centreMatricule?: string;
    regionResidence?: string;
    departementResidence?: string;
    HZR?: string;
    etranger?: string;
};

export interface ChangementDepartement {
    origine: string;
    destination: { pdrId: string; departement: string; centreId: string; ligneIdList: string[] }[];
}

export type RapportData = {
    summary: { [key: string]: string }[];
    jeunesNouvellementAffectedList: Array<
        JeuneRapport & {
            "Point de rassemblement calculé"?: string;
            sejourId: string;
        }
    >;
    jeunesDejaAffectedList: JeuneRapport[];
    jeuneAttenteAffectationList: JeuneRapport[];
    jeuneAttenteAffectationCount: number;
    sejourList: Array<
        SejourModel & {
            departement: CentreModel["departement"];
            region: CentreModel["region"];
            ville: CentreModel["ville"];
            codePostal: CentreModel["codePostal"];
            nomCentre: CentreModel["nom"];
        }
    >;
    ligneDeBusList: Array<
        Partial<LigneDeBusModel> & {
            pointDeRassemblementIds: string;
            pointDeRassemblementDepartements: string;
            centreNom: string;
            tauxRemplissageCentre: string;
            tauxRemplissageLigne: string;
        }
    >;
    pdrList: Array<
        Omit<PointDeRassemblementModel, "sessionIds" | "code" | "sessionNoms" | "complementAddress"> & {
            localisation: string;
        }
    >;
    centreList: Array<
        Partial<CentreModel> & {
            tauxRemplissage: string;
            tauxGarcon: string;
            tauxFille: string;
            tauxQVP: string;
            tauxPSH: string;
            [key: string]: string;
        }
    >;
    jeuneIntraDepartementList: Partial<JeuneModel>[];
};

const COL_SEJOUR_ID_ = "sejour_id_";
const COL_SEJOUR_PLACES_OCCUPEES = "sejour_places-occupées_";
const COL_SEJOUR_PLACES_RESTANTES = "sejour_places-restantes_";
const COL_BUS_NUMERO_LIGNE = "bus_numero-ligne_";
const COL_BUS_PLACES_OCCUPEES = "bus_places-occupées_";
const COL_BUS_PLACES_RESTANTES = "bus_places-restantes_";

export type Analytics = {
    selectedCost: number;
    iterationCostList: number[];
    tauxRepartitionCentreList: RatioRepartition[];
    centreIdList: string[];
    tauxRemplissageCentreList: number[];
    tauxOccupationLignesParCentreList: number[][];
    jeunesNouvellementAffected: number;
    jeuneAttenteAffectation: number;
    jeunesDejaAffected: number;
};

export interface DistributionJeunesParDepartement {
    departementList: Array<string | undefined>;
    jeuneIdListParDepartement: string[][];
    ligneIdListParDepartement: string[][];
    centreIdListParLigne: string[][];
    placesDisponiblesParLigne: number[][];
}

export interface RatioRepartition {
    male: number;
    qvp: number;
    psh: number;
}

export type JeuneAffectationModel = JeuneModel & {
    pointDeRassemblementAffectedId?: string;
    pointDeRassemblementIds: string[];
};

export const RAPPORT_SHEETS = {
    RESUME: "Résumé",
    AFFECTES: "Affectes",
    AFFECTES_EN_AMONT: "Affectes en amont",
    NON_AFFECTES: "Non affectés",
    SEJOURS: "Sejours",
    LIGNES_DE_BUS: "Lignes de bus",
    PDR: "PDR",
    CENTRES: "Centres",
    INTRA_DEPARTEMENT: "Intradep et HZR à affecter",
};

@Injectable()
export class SimulationAffectationHTSService {
    constructor(
        private readonly affectationService: AffectationService,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly logger: Logger,
    ) {}

    async getChangementsDepartements(
        sdrImportId: string,
        centreList: CentreModel[],
        pdrList: PointDeRassemblementModel[],
        ligneDeBusList: LigneDeBusModel[],
    ) {
        const importTask: ReferentielImportTaskModel = await this.taskGateway.findById(sdrImportId);
        if (!importTask.metadata?.parameters?.fileKey) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Fichier associé à l'import des routes introuvable",
            );
        }
        const importedFile = await this.fileGateway.downloadFile(importTask.metadata.parameters.fileKey);
        const parsedFile = await this.fileGateway.parseXLS<RouteXlsx>(importedFile.Body);

        const changementDepartementPdrs = parsedFile.reduce(
            (acc, line, index) => {
                const commentaire = line["Commentaire interne sur l'enregistrement"];
                const pdrMatricule = line["Code point de rassemblement initial"];
                const codeRoute = line["Code court de Route"];
                const centreMatricule = line["Désignation du centre"];
                // ex: DEPARTEMENT 93
                const numDepartement = commentaire?.match(/DEPARTEMENT ([0-9]{2})/)?.[1];
                if (numDepartement) {
                    // matriculePdr && centreMatricule &&
                    const departementNom = getDepartmentByNumber(numDepartement);
                    if (!departementNom) {
                        throw new FunctionalException(
                            FunctionalExceptionCode.NOT_FOUND,
                            `Departement "${numDepartement}" introuvable`,
                        );
                    }
                    if (!codeRoute) {
                        throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, `Code route ${index}`);
                    }
                    if (!pdrMatricule) {
                        throw new FunctionalException(
                            FunctionalExceptionCode.NOT_FOUND,
                            `Point de rassemblement manquant ligne ${index}`,
                        );
                    }
                    if (!centreMatricule) {
                        throw new FunctionalException(
                            FunctionalExceptionCode.NOT_FOUND,
                            `Centre manquant ligne ${index}`,
                        );
                    }
                    if (!acc[departementNom]) {
                        acc[departementNom] = [];
                    }
                    acc[departementNom].push({ pdrMatricule, centreMatricule, codeRoute });
                }
                return acc;
            },
            {} as Record<string, { pdrMatricule: string; centreMatricule: string; codeRoute: string }[]>,
        );

        let errors: string[] = [];
        const changementsDepartement: Array<ChangementDepartement> = [];
        for (const departement of Object.keys(changementDepartementPdrs)) {
            const routesList = changementDepartementPdrs[departement].map((route) => {
                const ligne = ligneDeBusList.find((ligne) => ligne.codeCourtDeRoute === route.codeRoute);
                if (!ligne) {
                    this.logger.error(`Aucune ligne de bus trouvée pour le code route ${route.codeRoute}`);
                    return {
                        error: `Aucune ligne de bus pour le code route ${route.codeRoute}`,
                    };
                }
                const centre = centreList.find((centre) => centre.matricule === route.centreMatricule);
                if (!centre) {
                    this.logger.error(`Centre introuvable pour le matricule ${route.centreMatricule}`);
                    return { error: `Centre introuvable pour le matricule ${route.centreMatricule}` };
                }
                const pdr = pdrList.find((pdr) => pdr.matricule === route.pdrMatricule);
                if (!pdr) {
                    this.logger.error(`Point de rassemblement introuvable pour le matricule ${route.pdrMatricule}`);
                    return { error: `Point de rassemblement introuvable pour le matricule ${route.pdrMatricule}` };
                }
                if (ligne.centreId !== centre.id || !ligne.pointDeRassemblementIds.includes(pdr.id)) {
                    this.logger.error(
                        `Ligne de bus ${ligne.id} incohérente: ${ligne.centreId}!=${centre.id} || ${
                            pdr.id
                        }!=${ligne.pointDeRassemblementIds.join(",")}`,
                    );
                    return {
                        error: `Ligne de bus incohérente pour le code ${route.codeRoute}, pdr ${pdr.matricule} et le centre ${centre.matricule}: ${ligne.id}`,
                    };
                }
                return {
                    pdrId: pdr.id,
                    departement: pdr.departement,
                    centreId: centre.id,
                    ligneIdList: [ligne.id],
                };
            });
            const errorsDepartement = routesList.reduce((acc: string[], currRoute) => {
                if (currRoute.error) {
                    acc.push(currRoute.error);
                }
                return acc;
            }, []);
            if (errorsDepartement.length > 0) {
                errors = [...errors, `[${departement}] ${errorsDepartement.join(", ")}`];
            }

            this.logger.log(
                `Changement de département pour ${departement}, destination: ${JSON.stringify(routesList)}`,
            );
            changementsDepartement.push({
                origine: departement,
                destination: routesList.filter((currRoute) => !currRoute.error) as any,
            });
        }

        return { changementsDepartement, changementsDepartementErreurs: errors };
    }

    computeRatioRepartition(jeunesList: JeuneModel[]): RatioRepartition {
        if (jeunesList.length === 0) {
            return { male: 0.5, qvp: 0.3, psh: 0.1 };
        }

        const count = jeunesList.reduce(
            (acc, jeune) => {
                if (jeune.genre === "male") {
                    acc.male++;
                }
                if (jeune.qpv?.toLowerCase() === "oui" || jeune.qpv === "true") {
                    acc.qvp++;
                }
                if (jeune.psh?.toLowerCase() === "oui" || jeune.psh === "true") {
                    acc.psh++;
                }
                return acc;
            },
            {
                male: 0,
                qvp: 0,
                psh: 0,
            },
        );

        return {
            male: count.male / jeunesList.length,
            qvp: count.qvp / jeunesList.length,
            psh: count.psh / jeunesList.length,
        };
    }

    // ici, on calcule les taux de repartition par centre
    calculTauxRepartitionParCentre(sejourList: SejourModel[], jeunesList: JeuneModel[]): RatioRepartition[] {
        const centresIds = sejourList.map((item) => item.centreId);
        const jeunesAffected = jeunesList.filter((jeune) => jeune.statutPhase1 === YOUNG_STATUS_PHASE1.AFFECTED);

        let taux: RatioRepartition[] = [];
        for (const centreId of centresIds) {
            const jeunesAffectedToCenter = jeunesAffected.filter((jeune) => jeune.centreId === centreId);
            const tauxCentre = this.computeRatioRepartition(jeunesAffectedToCenter);
            taux.push(tauxCentre);
        }
        // TODO: retourner un objet avec les ids des centres et les taux de repartition
        return taux;
    }

    // on calcule les taux de remplissage de chaque centre et les taux de remplissage des lignes de chaque centre
    calculTauxRemplissageParCentre({
        sejourList,
        ligneList = [],
    }: {
        sejourList: SejourModel[];
        ligneList?: LigneDeBusModel[];
    }) {
        const centreIdList = [...new Set(sejourList.map((sejour) => sejour.centreId || ""))];

        const tauxRemplissageCentres = sejourList.map((sejour) => {
            if (!sejour.placesTotal) {
                this.logger.warn(
                    `Taille centre invalid (${sejour.placesTotal}) -> remplissage fixe à 100% (${sejour.id})`,
                );
                return 1;
            }
            return 1.0 - (sejour.placesRestantes || 0) / sejour.placesTotal;
        });

        const tauxOccupationLignesParCentreList = centreIdList.map((centreId) => {
            const lignesCentreList = ligneList.filter((ligne) => ligne.centreId === centreId);
            return lignesCentreList.map((ligne) => ligne.placesOccupeesJeunes / ligne.capaciteJeunes);
        });
        return { tauxRemplissageCentres, centreIdList, tauxOccupationLignesParCentreList };
    }

    // ici on effectue l'affectation aleatoire
    affectationAleatoireDesJeunes(
        distributionJeunesDepartement: DistributionJeunesParDepartement,
        jeuneList: JeuneModel[],
        sejourList: SejourModel[],
        ligneDeBusList: LigneDeBusModel[],
        pdrList: PointDeRassemblementModel[],
    ): {
        randomJeuneList: JeuneAffectationModel[];
        randomSejourList: SejourModel[];
        randomLigneDeBusList: LigneDeBusModel[];
    } {
        // on initialise la sortie de la methode
        const randomJeuneList: JeuneAffectationModel[] = JSON.parse(JSON.stringify(jeuneList)); // clone
        const randomSejourList: SejourModel[] = JSON.parse(JSON.stringify(sejourList)); // clone
        const randomLigneDeBusList: LigneDeBusModel[] = JSON.parse(JSON.stringify(ligneDeBusList)); // clone

        const pointDeRassemblementParLigneDeBusIdMap = ligneDeBusList.reduce((acc, ligneDeBus) => {
            acc[ligneDeBus.id] = ligneDeBus.pointDeRassemblementIds;
            return acc;
        }, {});

        // donne des indexes aleatoire pour les jeunes de chaque departement
        const randomPosition = this.getPositionJeuneAleatoireParDepartement(
            distributionJeunesDepartement.jeuneIdListParDepartement,
        );

        // on randomise l ordre de lecture des departements -> pour ne pas privilegier toujours le meme
        const randomDepartementIndex = this.randomizeArray(distributionJeunesDepartement.departementList, true);

        // on boucle sur les departements
        for (let departementIndex of randomDepartementIndex) {
            const departement = distributionJeunesDepartement.departementList[departementIndex]; // nom du département
            const distributionLigneDeBusIdDepartement =
                distributionJeunesDepartement.ligneIdListParDepartement[departementIndex];
            const centreIdListParLigne = distributionJeunesDepartement.centreIdListParLigne[departementIndex];
            const placesDisponiblesParLigne = distributionJeunesDepartement.placesDisponiblesParLigne[departementIndex];
            const jeuneIdDispoDepartementList =
                distributionJeunesDepartement.jeuneIdListParDepartement[departementIndex]; // liste des jeunes dispo dans le departement courant

            const randomPositionDepartement = randomPosition[departementIndex]; // position aleatoire pour le departement courant

            const sommePlacesDisponiblesParLigne = placesDisponiblesParLigne.reduce((a, b) => a + b, 0);

            if (!departement || sommePlacesDisponiblesParLigne <= 0) continue;

            // le nombre de jeunes pouvant etre affecter est soit le nombre de jeunes dans le departement courant soit le nombre de places
            // le facteur limitant est le plus petit nombre parmis les 2
            const nbPlacesAAffecter = Math.min(sommePlacesDisponiblesParLigne, jeuneIdDispoDepartementList.length);

            // on recupere les nbPlacesAAffecter premiers indexes (aleatoires) des jeunes du departement courant
            const jeunePositionDepartementSelected = randomPositionDepartement.slice(0, nbPlacesAAffecter);

            // on affecte de maniere aleatoire un nombre de jeunes sur chaque ligne
            const nbPlacesOccuppeesSurLignesApresAffectation = this.getNombreSurLigneApresAffectation(
                placesDisponiblesParLigne,
                nbPlacesAAffecter,
            );

            // on verifie si il y a toujours les places disponibles dans les centres:
            const nbAffectectationARealiserParLigne = this.verificationCentres(
                nbPlacesOccuppeesSurLignesApresAffectation,
                placesDisponiblesParLigne,
                distributionLigneDeBusIdDepartement,
                randomLigneDeBusList,
                randomSejourList,
            );

            const randomLigneDeBusIdList = randomLigneDeBusList.map((ligne) => ligne.id);
            const randomCentreIdList = randomSejourList.map((sejour) => sejour.centreId);

            // on affecte chaque jeune a un center et une ligne de bus (+ choix pdr)
            for (
                let ligneAAffecterIndex = 0;
                ligneAAffecterIndex < nbAffectectationARealiserParLigne.length;
                ligneAAffecterIndex++
            ) {
                const indexLigneDeBus = randomLigneDeBusIdList.indexOf(
                    distributionLigneDeBusIdDepartement[ligneAAffecterIndex],
                );
                const indexCentre = randomCentreIdList.indexOf(centreIdListParLigne[ligneAAffecterIndex]);

                const nbJeunesAAffecterMin = nbAffectectationARealiserParLigne
                    .slice(0, ligneAAffecterIndex)
                    .reduce((a, b) => a + b, 0);

                let nbJeunesAAffecterMax = nbAffectectationARealiserParLigne
                    .slice(0, ligneAAffecterIndex + 1)
                    .reduce((a, b) => a + b, 0);

                // securite: Plus de jeunes que de places dans le Centre
                while (
                    nbJeunesAAffecterMax - nbJeunesAAffecterMin >
                    (randomSejourList[indexCentre].placesRestantes || 0)
                ) {
                    nbJeunesAAffecterMax -= 1;
                }

                const randomIndices = jeunePositionDepartementSelected
                    .slice(nbJeunesAAffecterMin, nbJeunesAAffecterMax)
                    .map(Number);
                const jeunesDepartementSelectedIdList = randomIndices.map(
                    (index) => jeuneIdDispoDepartementList[index],
                );

                const randomJeuneIdList = randomJeuneList.map((jeune) => jeune.id);
                const randomJeuneSelectedIndices = jeunesDepartementSelectedIdList.map((id) =>
                    randomJeuneIdList.indexOf(id),
                );

                randomJeuneSelectedIndices.forEach((index) => {
                    const ligneDeBusId = distributionLigneDeBusIdDepartement[ligneAAffecterIndex];
                    const pointDeRassemblementIds = pointDeRassemblementParLigneDeBusIdMap[ligneDeBusId];
                    randomJeuneList[index].statutPhase1 = YOUNG_STATUS_PHASE1.AFFECTED;
                    randomJeuneList[index].ligneDeBusId = ligneDeBusId;
                    randomJeuneList[index].pointDeRassemblementIds = pointDeRassemblementIds;
                    randomJeuneList[index].centreId = centreIdListParLigne[ligneAAffecterIndex];
                    randomJeuneList[index].pointDeRassemblementAffectedId = this.affecterPdrJeune(
                        randomJeuneList[index],
                        pdrList,
                    );
                });

                // actualisation des places pour le département
                randomLigneDeBusList[indexLigneDeBus].placesOccupeesJeunes += jeunesDepartementSelectedIdList.length;
                randomSejourList[indexCentre].placesRestantes =
                    (randomSejourList[indexCentre].placesRestantes || 0) - jeunesDepartementSelectedIdList.length;

                // actualisation des places pour les autres départements (ex: 93 qui part dans le 75)
                const placeRestantesUpdated =
                    randomLigneDeBusList[indexLigneDeBus].capaciteJeunes -
                    randomLigneDeBusList[indexLigneDeBus].placesOccupeesJeunes;
                for (let iDep = 0; iDep < distributionJeunesDepartement.departementList.length; iDep++) {
                    if (departement !== distributionJeunesDepartement.departementList[iDep]) {
                        const lignesOtherDep = distributionJeunesDepartement.ligneIdListParDepartement[iDep];
                        const placesDisponiblesOtherDep = distributionJeunesDepartement.placesDisponiblesParLigne[iDep];
                        for (let iLigne = 0; iLigne < lignesOtherDep.length; iLigne++) {
                            if (randomLigneDeBusList[indexLigneDeBus].id === lignesOtherDep[iLigne]) {
                                placesDisponiblesOtherDep[iLigne] = placeRestantesUpdated;
                            }
                        }
                    }
                }
            }
        }

        const sejourNegatif = randomSejourList.find((sejour) => sejour.placesRestantes && sejour.placesRestantes < 0);
        if (sejourNegatif) {
            this.logger.warn(
                `Sejour negative placesLeft: ${sejourNegatif.id}, centre: ${sejourNegatif.centreId}, ${sejourNegatif.departement} (placesRestantes: ${sejourNegatif.placesRestantes})`,
            );
        }
        return { randomJeuneList, randomSejourList, randomLigneDeBusList };
    }

    affecterPdrJeune(
        jeune: Pick<
            JeuneAffectationModel,
            | "id"
            | "pointDeRassemblementIds"
            | "localisation"
            | "handicapMemeDepartement"
            | "deplacementPhase1Autonomous"
            | "transportInfoGivenByLocal"
        >,
        pdrList: PointDeRassemblementModel[],
    ) {
        const pdrIds = jeune.pointDeRassemblementIds || [];
        if (
            pdrIds.length === 0 ||
            jeune.handicapMemeDepartement === "true" ||
            jeune.deplacementPhase1Autonomous === "true" ||
            jeune.transportInfoGivenByLocal === "true"
        ) {
            this.logger.log(`${jeune.id} Pas de PDR à affecter (${pdrIds.length})`);
            return undefined;
        }

        // on récupère le PDR le plus proche du jeune
        let selectedPdrID = pdrIds.reduce(
            (acc, pdrId) => {
                const pdr = pdrList.find((p) => p.id === pdrId);
                if (!jeune.localisation || !pdr?.localisation) {
                    return acc;
                }
                try {
                    const distance = getDistance(jeune.localisation, pdr.localisation);
                    if (distance < acc.distance) {
                        return { distance, pdrId };
                    }
                } catch (e) {
                    this.logger.warn(
                        `Invalid location for pdr ${pdrId} (${JSON.stringify(pdr.localisation)}) and young ${
                            jeune.id
                        } (${JSON.stringify(jeune.localisation)})`,
                    );
                    return acc;
                }
                return acc;
            },
            { distance: Infinity, pdrId: undefined } as { distance: number; pdrId: string | undefined },
        ).pdrId;

        // si l'on n'a pas trouve de pdr (pas de localisation), on en prend un au hasard
        if (!selectedPdrID) {
            this.logger.warn(`${jeune.id} utilisation d'un PDR aléatoire`);
            const randomPdrIndex = Math.floor(Math.random() * pdrIds.length);
            selectedPdrID = pdrIds[randomPdrIndex];
        }

        return selectedPdrID;
    }

    // methode qui permet de changer l ordre des jeunes de facon aleatoire : numpy.random.shuffle utilise la methode numerique de Fisher-Yates
    // vitesse O(n)
    getPositionJeuneAleatoireParDepartement(distributionJeuneIdDepartementList: string[][]): number[][] {
        // on boucle sur les jeunes de chaque departement
        return distributionJeuneIdDepartementList.map((distributionJeuneIdList) => {
            // pour les jeunes du departement courant, on recupere leur nombre, on les indexe
            return this.randomizeArray(distributionJeuneIdList, true);
        });
    }

    // Pour chaque departement, on va stocker les jeunes (id) du departement courant, les pdr qui sont dans le departement courant
    // les lignes correspondantes et les centres desservis.
    calculDistributionAffectations({
        jeunesList,
        pdrList = [],
        ligneDeBusList = [],
        changementsDepartement = [],
    }: {
        jeunesList: JeuneModel[];
        pdrList?: PointDeRassemblementModel[];
        ligneDeBusList?: LigneDeBusModel[];
        changementsDepartement?: ChangementDepartement[];
    }): DistributionJeunesParDepartement {
        // on recupere les departements, comme on veut boucler sur les departements, on enleve les doublons
        const departementList = [
            ...new Set([...jeunesList.map((jeune) => jeune.departement!), ...pdrList.map((pdr) => pdr.departement)]),
        ];

        const distributionJeunesDepartement: DistributionJeunesParDepartement = {
            departementList,
            jeuneIdListParDepartement: [],
            ligneIdListParDepartement: [],
            centreIdListParLigne: [],
            placesDisponiblesParLigne: [],
        };

        // on boucle sur les departements
        for (const departement of departementList) {
            // on recupere les jeunes du departement courant
            const jeunesListDepartement = jeunesList.filter((jeune) => jeune.departement === departement);

            // idem pour les points de rassemblement, on prend les id des pdr selectionnes
            const pdrIdsListDepartement = pdrList.filter((pdr) => pdr.departement === departement).map((pdr) => pdr.id);

            const ligneIdList: string[] = [];
            const centreIdList: string[] = [];
            const placesligneList: number[] = [];

            // Changement de dępartement (ex: les jeunes du 93 partent avec des lignes de bus du 75)
            const changementDepartementDestinationList =
                changementsDepartement.find((changement) => changement.origine === departement)?.destination || [];
            for (const destination of changementDepartementDestinationList) {
                for (const ligneId of destination.ligneIdList) {
                    const ligneDeBus = ligneDeBusList.find((ligne) => ligne.id === ligneId)!;
                    const nbPlacesligne = ligneDeBus.capaciteJeunes - ligneDeBus.placesOccupeesJeunes;
                    ligneIdList.push(ligneId);
                    centreIdList.push(destination.centreId);
                    placesligneList.push(nbPlacesligne);
                }
            }

            // On exclut les lignes de bus dédiées lors du changement de departement (les lignes du 75 qui prennent des jeunes du 93 ne peuvent pas prendre des jeunes du 75)
            const changementAExclureLigneIdList = changementsDepartement.reduce((acc, changement) => {
                changement.destination.forEach((dest) => {
                    if (dest.departement === departement) {
                        // cas particulier, un changement indiquant 75 vers 75.
                        for (const ligneId of dest.ligneIdList) {
                            if (!ligneIdList.includes(ligneId)) {
                                acc = [...new Set([...acc, ligneId])];
                            }
                        }
                    }
                });
                return acc;
            }, [] as string[]);

            // on parcourt les points de rassemblement de chaque departement
            for (let pdrId of pdrIdsListDepartement) {
                // on parcourt les lignes de bus
                for (const ligneDeBus of ligneDeBusList) {
                    // pour la ligne courante on recupere :
                    //    les id du pdr (il peut y en avoir plusieurs)
                    //    le nombre de places restantes
                    //    l id du centre desservi par la ligne
                    if (
                        !changementAExclureLigneIdList.includes(ligneDeBus.id) &&
                        // on regarde si le pdr courant est dans la ligne
                        ligneDeBus.pointDeRassemblementIds.includes(pdrId)
                    ) {
                        const nbPlacesligne = ligneDeBus.capaciteJeunes - ligneDeBus.placesOccupeesJeunes;

                        // une ligne peut avoir plusieurs points de rassemblement dans un meme departement
                        // on ajoute l information une seule fois
                        if (!ligneIdList.includes(ligneDeBus.id)) {
                            ligneIdList.push(ligneDeBus.id);
                            centreIdList.push(ligneDeBus.centreId);
                            placesligneList.push(nbPlacesligne);
                        }
                    }
                }
            }

            // par pdr et ligne de bus
            distributionJeunesDepartement.ligneIdListParDepartement.push(ligneIdList);
            distributionJeunesDepartement.centreIdListParLigne.push(centreIdList);
            distributionJeunesDepartement.placesDisponiblesParLigne.push(placesligneList);

            // par departement
            distributionJeunesDepartement.jeuneIdListParDepartement.push(
                jeunesListDepartement.map((jeune) => jeune.id),
            );
        }

        return distributionJeunesDepartement;
    }

    // On affecte un nombre aleatoire de jeunes sur les lignes a sa disposition
    // => Modification des places disponibles pour correspondre exactement au nombre a affecter
    getNombreSurLigneApresAffectation(placesDisponiblesParLigne: number[], nbPlacesAAffecter: number): number[] {
        const placesLignesRestantes: number[] = JSON.parse(JSON.stringify(placesDisponiblesParLigne)); // on clone le tableau

        const sommePlaceRestantes = placesLignesRestantes.reduce((a, b) => a + b, 0);
        // on verifie que le nombre de places est plus grand que celui des jeunes dispos (normalement deja verifie)
        if (sommePlaceRestantes > nbPlacesAAffecter) {
            let diff = sommePlaceRestantes - nbPlacesAAffecter;
            while (diff > 0) {
                // tant que l on peut ajouter un jeune
                const randomIndexLigne = Math.floor(Math.random() * placesLignesRestantes.length); // on selectionne aleatoirement une ligne
                if (placesLignesRestantes[randomIndexLigne] > 0) {
                    // si il y a encore des places disponibles sur la ligne
                    placesLignesRestantes[randomIndexLigne] -= 1; // on enleve une place sur la ligne
                    diff -= 1; // on enleve un jeune a affecter
                }
            }
        } else if (nbPlacesAAffecter > sommePlaceRestantes) {
            this.logger.warn("Il y a plus de jeunes que de places disponibles sur les lignes");
        }
        return placesLignesRestantes;
    }

    // Correction pour affectation des surnumeraires
    verificationCentres(
        nbPlacesOccuppeesSurLignesApresAffectation: number[],
        placesDisponiblesParLigne: number[],
        distributionLigneDeBusIdDepartement: string[],
        randomLigneDeBusList: LigneDeBusModel[],
        randomSejourList: SejourModel[],
    ): number[] {
        // Copie des tableaux d'entrée pour éviter de modifier les données originales
        const nbJeunesAAffecter: number[] = JSON.parse(JSON.stringify(nbPlacesOccuppeesSurLignesApresAffectation));
        const placesLignes = JSON.parse(JSON.stringify(placesDisponiblesParLigne));

        // Filtrage des lignes de bus et des séjours qui correspondent aux IDs de ligne de bus spécifiés
        const ligneDeBusList = randomLigneDeBusList
            .filter((ligne) => distributionLigneDeBusIdDepartement.includes(ligne.id))
            .sort(
                // doit être dans le même ordre que distributionLigneDeBusIdDepartement
                (a, b) =>
                    distributionLigneDeBusIdDepartement.indexOf(a.id) -
                    distributionLigneDeBusIdDepartement.indexOf(b.id),
            );

        const centreList = ligneDeBusList.map((ligne) =>
            randomSejourList.find((sejour) => sejour.centreId === ligne.centreId),
        );
        if (centreList.includes(undefined) || ligneDeBusList.length === 0) {
            throw new Error("Erreur lors de la récupération des centres associés aux lignes de bus");
        }

        // Récupération du nombre de places restantes pour chaque centre
        const placesCentres: number[] = centreList.map((centre) => centre?.placesRestantes || 0);

        // Mélange aléatoire de la liste des IDs de ligne de bus
        const randomLecture: string[] = this.randomizeArray(distributionLigneDeBusIdDepartement, true);

        // Parcours de chaque ligne de bus et correction des affectations en fonction des places disponibles dans les centres
        for (let ligneIndex = 0; ligneIndex < distributionLigneDeBusIdDepartement.length; ligneIndex++) {
            const randomIndex = randomLecture[ligneIndex];
            const nbPlacesCentre = placesCentres[randomIndex];
            const nbPlacesLigne = placesDisponiblesParLigne[randomIndex];
            const nbPlaceDispo = Math.min(nbPlacesCentre || 0, nbPlacesLigne || 0);
            let nbJeuneNonAffectableLigne = nbJeunesAAffecter[randomIndex] - nbPlaceDispo;

            // Ajustement du nombre de places à affecter sur la ligne
            nbJeunesAAffecter[randomIndex] = nbPlaceDispo;
            // Mise à jour du nombre de places restantes dans le centre et sur la ligne
            placesCentres[randomIndex] -= nbJeunesAAffecter[randomIndex];
            placesLignes[randomIndex] -= nbJeunesAAffecter[randomIndex];

            // Si il y a plus de jeunes à affecter que de places disponibles dans le centre/bus
            if (nbJeuneNonAffectableLigne > 0) {
                // Parcours des autres lignes de bus pour tenter de réaffecter les places manquantes
                for (
                    let autreLigneDepIndex = 0;
                    autreLigneDepIndex < distributionLigneDeBusIdDepartement.length;
                    autreLigneDepIndex++
                ) {
                    // Si la ligne de bus n'est pas la même et qu'il reste des places à réaffecter
                    if (autreLigneDepIndex !== ligneIndex && nbJeuneNonAffectableLigne > 0) {
                        const randomIndexAutreLigneDep = randomLecture[autreLigneDepIndex];
                        const nbPlacesCentreAutreLigneDep = placesCentres[randomIndexAutreLigneDep];
                        const nbPlacesAutreLigneDep = placesLignes[randomIndexAutreLigneDep];
                        const nbPlaceDispoAutreLigneDep = Math.min(nbPlacesCentreAutreLigneDep, nbPlacesAutreLigneDep);

                        // Si il y a des places disponibles dans le centre et sur la ligne
                        if (nbPlaceDispoAutreLigneDep > 0) {
                            const nbJeunesAffectesAutreLigneDep = Math.min(
                                nbJeuneNonAffectableLigne,
                                nbPlaceDispoAutreLigneDep,
                            );
                            // Ajustement du nombre de places à affecter sur la ligne et mise à jour du nombre de places restantes dans le centre et sur la ligne
                            nbJeunesAAffecter[randomIndexAutreLigneDep] += nbJeunesAffectesAutreLigneDep;
                            placesCentres[randomIndexAutreLigneDep] -= nbJeunesAffectesAutreLigneDep;
                            placesLignes[randomIndexAutreLigneDep] -= nbJeunesAffectesAutreLigneDep;
                            nbJeuneNonAffectableLigne -= nbJeunesAffectesAutreLigneDep;
                        }
                    }
                }
            }
        }

        // Retourne le tableau des nombres de jeunes à affecter sur chaque ligne de bus
        return nbJeunesAAffecter;
    }

    // Calcul de la fonction de cout pour une affectation donnee
    calculCoutSimulation(
        tauxRepartitionCentres: RatioRepartition[],
        tauxRemplissageCentres: number[],
        ratioRepartition: RatioRepartition, // genre, qpv, psh
    ) {
        // get the average of the array elements. The average is taken over the flattened array by default, otherwise over the specified axis. float64 intermediate and return values are used for integer inputs.
        const moyenTauxRepartitionCentres =
            tauxRepartitionCentres
                .map(({ male, qvp, psh }) => [male, qvp, psh])
                .flat()
                .reduce((acc, val) => acc + val, 0) / tauxRepartitionCentres.length;
        // get the standard deviation of tauxRepartitionCentres, a measure of the spread of a distribution, of the array elements. The standard deviation is computed for the flattened array by default, otherwise over the specified axis.
        const deviationTauxRepartitionCentres = Math.sqrt(
            tauxRepartitionCentres
                .map(({ male, qvp, psh }) => [male, qvp, psh])
                .flat()
                .reduce((acc, val) => acc + Math.pow(val - moyenTauxRepartitionCentres, 2), 0) /
                tauxRepartitionCentres.length,
        );

        const tr = [ratioRepartition.male, ratioRepartition.qvp, ratioRepartition.psh].map((taux) =>
            Math.abs(moyenTauxRepartitionCentres - taux),
        );

        // get the average of the array elements. The average is taken over the flattened array by default, otherwise over the specified axis. float64 intermediate and return values are used for integer inputs.
        const mn_remp =
            tauxRemplissageCentres.flat().reduce((acc, val) => acc + val, 0) / tauxRemplissageCentres.length;
        const tremp = Math.abs(mn_remp - 1.0);
        // get the standard deviation of tauxRepartitionCentres, a measure of the spread of a distribution, of the array elements. The standard deviation is computed for the flattened array by default, otherwise over the specified axis.
        const std_remp = Math.sqrt(
            tauxRemplissageCentres.flat().reduce((acc, val) => acc + Math.pow(val - mn_remp, 2), 0) /
                tauxRemplissageCentres.length,
        );

        // pour le moment, le critere principal est d envoyer l ensemble des jeunes. Le seul poids non nul est porte sur ce critere
        const valeurs: number[] = [
            tremp,
            std_remp,
            tr[0],
            tr[1],
            deviationTauxRepartitionCentres[0] || 0,
            deviationTauxRepartitionCentres[1] || 0,
        ]; // centre, std centre, genre, qpv, stdgenre, stdqpv
        const poids = [1.0, 0.0, 0.0, 0.0, 0.0, 0.0];

        // Dot product of two arrays
        const cost = valeurs.reduce((acc, val, index) => acc + val * poids[index], 0);
        return cost < 0 ? 0 : cost;
    }

    // here we verify that the number of remaining seats is non-negative......
    isPlacesRestantesCoherentes(ligneDeBusList: LigneDeBusModel[], sejourList: SejourModel[]): boolean {
        const ligneNotSafe = ligneDeBusList.find((ligne) => ligne.capaciteJeunes - ligne.placesOccupeesJeunes < 0);
        if (ligneNotSafe) {
            this.logger.warn(
                `lines placesLibres not safe ! (${ligneNotSafe.id}: ${
                    ligneNotSafe.capaciteJeunes - ligneNotSafe.placesOccupeesJeunes
                })`,
            );
            return false;
        }
        const sejourNotSafe = sejourList.find(
            (sejour) => sejour.placesRestantes !== undefined && sejour.placesRestantes < 0,
        );
        if (sejourNotSafe) {
            this.logger.warn(`centre placesLeft not safe ! (${sejourNotSafe.id}: ${sejourNotSafe.placesRestantes})`);
            return false;
        }
        return true;
    }

    getInfoNonAffectes(
        jeuneAttenteAffectationList: JeuneRapport[],
        ligneDeBusList: LigneDeBusModel[],
        centreList: CentreModel[],
        sejourList: SejourModel[],
        regionsConcerneeList: string[],
        distributionJeunesDepartement: DistributionJeunesParDepartement,
        type: "HTS" | "HTS_DROMCOM" = "HTS",
    ): {
        jeunes: {
            "Ligne Theorique": string;
            "Centre Theorique": string;
            "Lignes Places Restantes": string;
            "Centres Places Restantes": string;
            "Hors Zone (région)": string;
            Résumé: string;
        }[];
        stats: string[];
    } {
        let probHorsZone = 0;
        let departmentHortZone: string[] = [];

        let pasDeligne = 0;
        let lignesNames: string[] = [];
        let pasDecentre = 0;
        let centresNames: string[] = [];

        let limite = 0;

        const jeunes = jeuneAttenteAffectationList.map(({ departementResidence, regionResidence }) => {
            let resumeJeune: string = "";
            const busIdList: string[] = [];
            const centreNameList: string[] = [];
            const placesLigneList: number[] = [];
            const placesCentreList: number[] = [];

            let isHorsZone = false;
            let isSansLigne = false;
            let isSansCentre = false;
            let isProblemePlaceCentre = false;
            let isProblemePlaceBus = false;

            const departementIndex = distributionJeunesDepartement.departementList.indexOf(departementResidence);
            const ligneDeBusIdList = distributionJeunesDepartement.ligneIdListParDepartement[departementIndex];
            const centreIdListParLigne = distributionJeunesDepartement.centreIdListParLigne[departementIndex];

            const lignesThorique = ligneDeBusList.filter((ligne) => ligneDeBusIdList?.includes(ligne.id));
            const centresTheorique = centreList.filter((centre) => centreIdListParLigne?.includes(centre.id));

            for (const currentLigne of lignesThorique) {
                // on récupère les infos du bus si on ne les a pas déjà
                if (!busIdList.includes(currentLigne.numeroLigne)) {
                    const nbPlaceDispoLigne = currentLigne.capaciteJeunes - currentLigne.placesOccupeesJeunes;
                    busIdList.push(currentLigne.numeroLigne);
                    placesLigneList.push(nbPlaceDispoLigne);
                    resumeJeune += `Ligne : ${currentLigne.numeroLigne} (${currentLigne?.placesOccupeesJeunes}/${currentLigne?.capaciteJeunes})`;
                }

                // on récupère les centres associés à la ligne de bus
                const centre = centresTheorique.find((centre) => centre.id === currentLigne.centreId);
                // on récupère les infos du centre
                if (centre) {
                    const sejour = sejourList.find((sejour) => sejour.centreId === centre.id);
                    const placesPrises = (sejour?.placesTotal || 0) - (sejour?.placesRestantes || 0);
                    centreNameList.push(centre.nom || "");
                    placesCentreList.push(Number(sejour?.placesRestantes));
                    resumeJeune += ` - Centre : ${centre.nom} (${placesPrises}/${sejour?.placesTotal}).`;
                }

                resumeJeune += "\n";
            }

            if (busIdList.length === 0 && centreNameList.length === 0) {
                probHorsZone += 1;
                if (!departmentHortZone.includes(departementResidence!)) {
                    departmentHortZone.push(departementResidence!);
                }
                isHorsZone = true;
            } else if (busIdList.length === 0 && centreNameList.length !== 0) {
                isSansLigne = true;
                pasDeligne += 1;
                centreNameList.forEach((centreNom) => {
                    centresNames.push(centreNom);
                });
            } else if (busIdList.length !== 0 && centreNameList.length === 0) {
                isSansCentre = true;
                pasDecentre += 1;
                busIdList.forEach((numeroLigne) => {
                    lignesNames.push(numeroLigne);
                });
            } else {
                isProblemePlaceCentre = placesCentreList.some((places) => places === 0);
                isProblemePlaceBus = placesLigneList.some((places) => places === 0);
                limite += 1;
            }

            return {
                "Ligne Theorique": busIdList.join(";"), // lignes avec des pdr dans le departement du jeune
                "Centre Theorique": centreNameList.join(";"), // centre associés au lignes théorique
                "Lignes Places Restantes": placesLigneList.join(";"), // places restantes dans les lignes theoriques
                "Centres Places Restantes": placesCentreList.join(";"), // places restantes dans les centres theoriques
                "Hors Zone (région)": regionsConcerneeList.includes(regionResidence || "") ? "non" : "oui", // la region du jeune n'a pas de pdr
                "Probablement hors zones (département)": isHorsZone ? "oui" : "non", // aucune ligne ni centre théorique trouvé
                "Pas de ligne disponible": isSansLigne ? "oui" : "non", // à un centre théorique mais pas de ligne
                "Pas de centre disponible": isSansCentre ? "oui" : "non", // à une ligne théorique mais pas de centre
                "Problème de places ligne": isProblemePlaceBus ? "oui" : "non", // à une ligne et un centre théorique mais n'a pas été affecté
                "Problème de places centre": isProblemePlaceCentre ? "oui" : "non", // à une ligne et un centre théorique mais n'a pas été affecté
                Résumé: resumeJeune,
            };
        });

        return {
            jeunes,
            stats:
                type === "HTS"
                    ? [
                          "          dont jeunes probablement hors zones : " + probHorsZone,
                          "             -> Liste des départements hors zones : " +
                              departmentHortZone.map(formatDepartement).join(", "),
                          "          dont jeunes pas de ligne disponible pour centre(s) " +
                              centresNames.join(", ") +
                              " : " +
                              pasDeligne,
                          "          dont jeunes pas de centre disponible pour ligne(s) " +
                              lignesNames.join(", ") +
                              " : " +
                              pasDecentre,
                          "          dont jeunes non affectés pour problèmes de places : " + limite,
                      ]
                    : [],
        };
    }

    calculRapportAffectation({
        jeunesList,
        sejourList,
        ligneDeBusList = [],
        centreList,
        pdrList = [],
        jeunesAvantAffectationList,
        jeuneIntraDepartementList = [],
        distributionJeunesDepartement,
        changementsDepartement = [],
        changementsDepartementErreurs = [],
        analytics,
        type,
    }: {
        jeunesList: JeuneAffectationModel[];
        sejourList: SejourModel[];
        ligneDeBusList?: LigneDeBusModel[];
        centreList: CentreModel[];
        pdrList?: PointDeRassemblementModel[];
        jeunesAvantAffectationList: JeuneModel[];
        jeuneIntraDepartementList?: JeuneAffectationModel[];
        distributionJeunesDepartement: DistributionJeunesParDepartement;
        changementsDepartement?: ChangementDepartement[];
        changementsDepartementErreurs?: string[];
        analytics: Partial<Analytics>;
        type: "HTS" | "HTS_DROMCOM";
    }): RapportData {
        const jeunesAffectedList = jeunesList.filter((jeune) => jeune.statutPhase1 === YOUNG_STATUS_PHASE1.AFFECTED);
        const regionsConcerneeList = [...new Set(pdrList.map((pdr) => pdr.region))];
        const { sejourIdList, sejourCentreIdList } = sejourList.reduce(
            (acc, sejour) => {
                acc.sejourIdList.push(sejour.id);
                acc.sejourCentreIdList.push(sejour.centreId || "");
                return acc;
            },
            { sejourIdList: [], sejourCentreIdList: [] } as {
                sejourIdList: string[];
                sejourCentreIdList: string[];
            },
        );

        const pdrIdJeuneAffectedList: string[] = [];
        const jeuneSejourIdList: string[] = [];

        for (const jeune of jeunesAffectedList) {
            pdrIdJeuneAffectedList.push(jeune.pointDeRassemblementAffectedId || "");

            sejourCentreIdList.forEach((centreId, index) => {
                if (jeune.centreId === centreId) {
                    jeuneSejourIdList.push(sejourIdList[index]);
                }
            });
        }

        const jeunesAffectedListRapport = jeunesAffectedList.map((jeune) =>
            this.mapJeuneRapport(jeune, ligneDeBusList, centreList, pdrList, type),
        );

        const jeunesDejaAffectedIdList = jeunesAvantAffectationList.reduce((acc: string[], jeune) => {
            if (jeune.centreId) {
                acc.push(jeune.id);
            }
            return acc;
        }, []);
        const jeunesDejaAffectedList = jeunesList
            .filter((jeune) => jeunesDejaAffectedIdList.includes(jeune.id))
            .map((jeune) => this.mapJeuneRapport(jeune, ligneDeBusList, centreList, pdrList));

        const jeunesNouvellementAffectedList = jeunesAffectedListRapport.reduce(
            (acc: RapportData["jeunesNouvellementAffectedList"], jeune, index) => {
                if (!jeunesDejaAffectedIdList.includes(jeune.id)) {
                    const jeunesNouvellementAffected: RapportData["jeunesNouvellementAffectedList"][0] = {
                        ...jeune,
                        // TODO: utiliser le matricule
                        sejourId: jeuneSejourIdList[index],
                    };
                    if (type === "HTS") {
                        jeunesNouvellementAffected["Point de rassemblement calculé"] = pdrIdJeuneAffectedList[index];
                    }
                    acc.push(jeunesNouvellementAffected);
                }
                return acc;
            },
            [],
        );

        let jeuneAttenteAffectationList = jeunesList
            .filter((jeune) => jeune.statutPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION)
            .map((jeune) => this.mapJeuneRapport(jeune, ligneDeBusList, centreList, pdrList));

        // On recupere les possibilites theoriques des jeunes non affectes
        const infoNonAffectes = this.getInfoNonAffectes(
            jeuneAttenteAffectationList,
            ligneDeBusList,
            centreList,
            sejourList,
            regionsConcerneeList,
            distributionJeunesDepartement,
            type,
        );

        jeuneAttenteAffectationList = jeuneAttenteAffectationList.map((jeune, index) => ({
            ...jeune,
            ...infoNonAffectes.jeunes[index],
        }));

        // on rajoute les HZR dans l'onglet intradep car ils devront être affecté manuellement
        const jeuneIntraDepartementListUpdated = [
            ...jeuneIntraDepartementList.map((jeune) =>
                this.mapJeuneRapport(jeune, ligneDeBusList, centreList, pdrList),
            ),
            ...jeuneAttenteAffectationList.filter(
                (jeune) => jeune.HZR === "oui" && jeune["Hors Zone (région)"] === "oui",
            ),
        ];

        // on enleve les HZR de l'onglet non affecté
        jeuneAttenteAffectationList = jeuneAttenteAffectationList.filter(
            (jeune) => !(jeune.HZR === "oui" && jeune["Hors Zone (région)"] === "oui"),
        );

        const sejourListUpdated = sejourList.map((sejour) => {
            if (sejour.centreId) {
                const centre = centreList.find((centre) => centre.id === sejour.centreId);
                return {
                    id: sejour.id,
                    centreId: sejour.centreId,
                    sessionName: sejour.sessionNom,
                    chefDeCentreReferentId: sejour.chefDeCentreReferentId,
                    placesRestantes: sejour.placesRestantes,
                    placesTotal: sejour.placesTotal,
                    tauxRemplissage: this.affectationService.formatPourcent(
                        1 - (sejour.placesRestantes || 0) / (sejour.placesTotal || 0),
                    ),
                    region: centre?.region,
                    departement: centre?.departement,
                    ville: centre?.ville,
                    codePostal: centre?.codePostal,
                    nomCentre: centre?.nom,
                };
            }
            return sejour;
        }) as RapportData["sejourList"];

        const centreListUpdated = centreList
            .map((centre) => {
                const indexCentre = sejourCentreIdList.indexOf(centre.id);
                const centreSejourList = sejourListUpdated.filter((sejour) => sejour.centreId === centre.id);
                const ligneSejourList = ligneDeBusList.filter((ligne) => ligne.centreId === centre.id);
                const stats = {
                    tauxRemplissage: analytics.tauxRemplissageCentreList?.[indexCentre],
                    tauxGarcon: analytics.tauxRepartitionCentreList?.[indexCentre]?.male,
                    tauxQVP: analytics.tauxRepartitionCentreList?.[indexCentre]?.qvp,
                    tauxPSH: analytics.tauxRepartitionCentreList?.[indexCentre]?.psh,
                };
                return {
                    id: centre.id,
                    matricule: centre.matricule,
                    nom: centre.nom,
                    region: centre.region,
                    departement: centre.departement,
                    ville: centre.ville,
                    codePostal: centre.codePostal,
                    tauxRemplissage: this.affectationService.formatPourcent(stats.tauxRemplissage || 0),
                    tauxGarcon: this.affectationService.formatPourcent(stats.tauxGarcon || 0),
                    tauxFille: this.affectationService.formatPourcent(
                        stats.tauxGarcon !== undefined ? 1 - stats.tauxGarcon : 0,
                    ),
                    tauxQVP: this.affectationService.formatPourcent(stats.tauxQVP || 0),
                    tauxPSH: this.affectationService.formatPourcent(stats.tauxPSH || 0),
                    ...centreSejourList.reduce((acc, sejour, index) => {
                        acc[`${COL_SEJOUR_ID_}${index + 1}`] = sejour.id;
                        acc[`${COL_SEJOUR_PLACES_OCCUPEES}${index + 1}`] =
                            (sejour.placesTotal || 0) - (sejour.placesRestantes || 0);
                        acc[`${COL_SEJOUR_PLACES_RESTANTES}${index + 1}`] = sejour.placesRestantes;
                        return acc;
                    }, {}),
                    ...ligneSejourList.reduce((acc, ligne, index) => {
                        acc[`${COL_BUS_NUMERO_LIGNE}${index}`] = ligne.numeroLigne;
                        acc[`${COL_BUS_PLACES_OCCUPEES}${index}`] = ligne.placesOccupeesJeunes;
                        acc[`${COL_BUS_PLACES_RESTANTES}${index}`] = ligne.capaciteJeunes - ligne.placesOccupeesJeunes;
                        return acc;
                    }, {}),
                } as RapportData["centreList"][0];
            })
            .sort(this.sortRegionEtDepartement);

        const ligneDeBusListUpdated = ligneDeBusList.map((ligne) => {
            const indexCentre = sejourCentreIdList.indexOf(ligne.centreId);
            const centreLigne = centreList.find((centre) => centre.id === ligne.centreId);
            const tauxRemplissageCentre = analytics.tauxRemplissageCentreList?.[indexCentre] || 0;
            return {
                sessionNom: ligne.sessionNom,
                id: ligne.id,
                numeroLigne: ligne.numeroLigne,
                pointDeRassemblementIds: ligne.pointDeRassemblementIds.join(", "),
                pointDeRassemblementDepartements: ligne.pointDeRassemblementIds
                    .map((pdrId) => pdrList.find((pdr) => pdr.id === pdrId)?.departement)
                    .join(", "),
                placesOccupeesJeunes: ligne.placesOccupeesJeunes,
                capaciteJeunes: ligne.capaciteJeunes,
                tauxRemplissageLigne: this.affectationService.formatPourcent(
                    ligne.placesOccupeesJeunes / ligne.capaciteJeunes,
                ),
                centreId: ligne.centreId,
                centreNom: centreLigne?.nom,
                tauxRemplissageCentre: this.affectationService.formatPourcent(tauxRemplissageCentre),
            } as RapportData["ligneDeBusList"][0];
        });

        const pdrListUpdated = pdrList.map((pdr) => ({
            id: pdr.id,
            matricule: pdr.matricule,
            nom: pdr.nom,
            region: pdr.region,
            departement: pdr.departement,
            academie: pdr.academie,
            adresse: pdr.adresse,
            ville: pdr.ville,
            codePostal: pdr.codePostal,
            particularitesAcces: pdr.particularitesAcces,
            localisation: `${pdr.localisation?.lat} ${pdr.localisation?.lon}`,
            ligneDeBus: ligneDeBusList
                .filter((ligne) => ligne.pointDeRassemblementIds.includes(pdr.id))
                .map((ligne) => ligne.numeroLigne)
                .join(", "),
        }));

        const summary = [
            "Nombre de jeunes dans la simulation : " + (jeunesList.length + jeuneIntraDepartementList.length),
            "          dont affectés en amont : " + jeunesDejaAffectedList.length,
            "Nombre de jeunes affectés dans la simulation : " + jeunesNouvellementAffectedList.length,
            "Nombre de jeunes en attente d'affectation : " +
                (jeuneAttenteAffectationList.length + jeuneIntraDepartementListUpdated.length),
            ...(type === "HTS" ? ["          dont intradep : " + jeuneIntraDepartementList.length] : []),
            ...infoNonAffectes.stats,
            ...(analytics.selectedCost !== undefined
                ? ["Taux d'erreur pour l'iteration : " + analytics.selectedCost]
                : []),
            ...(changementsDepartement.length > 0
                ? ["Changement de département : " + this.formatChangementDepartements(changementsDepartement)]
                : []),
            ...(changementsDepartementErreurs.length > 0
                ? ["Erreurs changement de département : " + changementsDepartementErreurs.join(".\n")]
                : []),
        ].map((ligne) => ({
            "": ligne,
        }));

        return {
            summary,
            jeunesNouvellementAffectedList: jeunesNouvellementAffectedList.sort(this.sortRegionEtDepartement),
            jeunesDejaAffectedList: jeunesDejaAffectedList.sort(this.sortRegionEtDepartement),
            jeuneAttenteAffectationList: jeuneAttenteAffectationList.sort(this.sortRegionEtDepartement),
            jeuneAttenteAffectationCount: jeuneAttenteAffectationList.length + jeuneIntraDepartementListUpdated.length,
            sejourList: sejourListUpdated.sort(this.sortRegionEtDepartement),
            ligneDeBusList: ligneDeBusListUpdated.sort(
                (busA, busB) => busA.numeroLigne?.localeCompare(busB.numeroLigne!) || -1,
            ),
            pdrList: pdrListUpdated.sort(this.sortRegionEtDepartement),
            centreList: centreListUpdated.sort(this.sortRegionEtDepartement),
            jeuneIntraDepartementList: jeuneIntraDepartementListUpdated.sort(this.sortRegionEtDepartement),
        };
    }

    async generateRapportExcel(rapportData: RapportData, type: "HTS" | "HTS_DROMCOM"): Promise<Buffer> {
        return this.fileGateway.generateExcel({
            [RAPPORT_SHEETS.RESUME]: rapportData.summary,
            [RAPPORT_SHEETS.AFFECTES]: rapportData.jeunesNouvellementAffectedList,
            [RAPPORT_SHEETS.NON_AFFECTES]: rapportData.jeuneAttenteAffectationList,
            [RAPPORT_SHEETS.INTRA_DEPARTEMENT]: rapportData.jeuneIntraDepartementList,
            [RAPPORT_SHEETS.AFFECTES_EN_AMONT]: rapportData.jeunesDejaAffectedList,
            [RAPPORT_SHEETS.CENTRES]: rapportData.centreList,
            ...(type === "HTS" ? { [RAPPORT_SHEETS.LIGNES_DE_BUS]: rapportData.ligneDeBusList } : {}),
            [RAPPORT_SHEETS.SEJOURS]: rapportData.sejourList,
            ...(type === "HTS" ? { [RAPPORT_SHEETS.PDR]: rapportData.pdrList } : {}),
        });
    }

    async extractPdfAnalyticsFromRapport(simulationTask: SimulationAffectationHTSTaskModel) {
        const rapportKey = simulationTask.metadata?.results?.rapportKey;
        if (!rapportKey) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Fichier associé à la simulation introuvable",
            );
        }
        const importedFile = await this.fileGateway.downloadFile(rapportKey);
        const centres = await this.fileGateway.parseXLS<RapportData["centreList"][0]>(importedFile.Body, {
            sheetName: RAPPORT_SHEETS.CENTRES,
        });
        const ligneDeBusList = await this.fileGateway.parseXLS<RapportData["ligneDeBusList"][0]>(importedFile.Body, {
            sheetName: RAPPORT_SHEETS.LIGNES_DE_BUS,
        });
        const summary = await this.fileGateway.parseXLS<RapportData["summary"][0]>(importedFile.Body, {
            sheetName: RAPPORT_SHEETS.RESUME,
        });
        const jeuneAttenteAffectationList = await this.fileGateway.parseXLS<
            RapportData["jeuneAttenteAffectationList"][0] & {
                "Problème de places ligne": string;
                "Problème de places centre": string;
                Résumé: string;
            }
        >(importedFile.Body, {
            sheetName: RAPPORT_SHEETS.NON_AFFECTES,
        });

        const regions = centres.reduce(
            (acc, centre) => {
                if (!acc[centre.region!]) {
                    acc[centre.region!] = [];
                }
                let i = 0;
                const lignesDeBus: any[] = [];
                while (centre[`${COL_BUS_NUMERO_LIGNE}${i}`]) {
                    const departementsPdr =
                        ligneDeBusList
                            .find((ligne) => ligne.numeroLigne === centre[`${COL_BUS_NUMERO_LIGNE}${i}`])
                            ?.pointDeRassemblementDepartements?.split(",") || [];
                    lignesDeBus.push({
                        numeroLigne: centre[`${COL_BUS_NUMERO_LIGNE}${i}`],
                        placesOccupees: Number(centre[`${COL_BUS_PLACES_OCCUPEES}${i}`]),
                        placesRestances: Number(centre[`${COL_BUS_PLACES_RESTANTES}${i}`]),
                        nonAffectesMemeDepartement: jeuneAttenteAffectationList.filter(
                            (jeune) => departementsPdr?.includes(jeune.departementResidence!),
                        ).length,
                    });
                    i++;
                }
                acc[centre.region!].push({
                    id: centre.id,
                    nom: centre.nom,
                    departement: centre.departement,
                    codePostal: centre.codePostal,
                    ville: centre.ville,
                    placesTotal:
                        Number(centre["sejour_places-occupées_1"]) + Number(centre["sejour_places-restantes_1"]) || 0,
                    placesOccupees: Number(centre["sejour_places-occupées_1"]) || 0,
                    placesRestantes: Number(centre["sejour_places-restantes_1"]) || 0,
                    tauxRemplissage: this.affectationService.parsePourcent(centre.tauxRemplissage),
                    tauxFille: this.affectationService.parsePourcent(centre.tauxFille),
                    tauxGarcon: this.affectationService.parsePourcent(centre.tauxGarcon),
                    tauxPSH: this.affectationService.parsePourcent(centre.tauxPSH),
                    tauxQVP: this.affectationService.parsePourcent(centre.tauxQVP),
                    sejourId: centre.sejour_id_1,
                    lignesDeBus,
                });
                return acc;
            },
            {} as Record<string, any[]>,
        );

        return {
            createdAt: simulationTask.createdAt.toISOString(),
            sessionId: simulationTask.metadata?.parameters?.sessionId!,
            selectedCost: simulationTask.metadata?.results?.selectedCost!,
            iterationCostList: simulationTask.metadata?.results?.iterationCostList!,
            jeuneAttenteAffectation: simulationTask.metadata?.results?.jeuneAttenteAffectation!,
            jeunesDejaAffected: simulationTask.metadata?.results?.jeunesDejaAffected!,
            jeunesNouvellementAffected: simulationTask.metadata?.results?.jeunesNouvellementAffected!,
            summary: summary.map((line) => line[""]),
            regions,
            jeunesProblemeDePlaces: jeuneAttenteAffectationList.reduce((acc, jeune) => {
                if (jeune["Problème de places centre"] !== "oui" && jeune["Problème de places ligne"] !== "oui") {
                    return acc;
                }
                return [
                    ...acc,
                    {
                        id: jeune.id,
                        departement: jeune.departementResidence,
                        detail: jeune.Résumé,
                    },
                ];
            }, [] as any[]),
        };
    }

    mapJeuneRapport(
        jeune: JeuneAffectationModel,
        ligneDeBusList: LigneDeBusModel[],
        centreList: CentreModel[],
        pdrList: PointDeRassemblementModel[],
        type: "HTS" | "HTS_DROMCOM" = "HTS",
    ): JeuneRapport {
        const ligneDeBus = jeune.ligneDeBusId
            ? ligneDeBusList.find((ligneDeBus) => ligneDeBus.id === jeune.ligneDeBusId)
            : undefined;
        const centre = jeune.centreId ? centreList.find((centre) => centre.id === jeune.centreId) : undefined;
        const pdr = jeune.pointDeRassemblementId
            ? pdrList.find((pdr) => pdr.id === jeune.pointDeRassemblementId)
            : undefined;
        return {
            id: jeune.id,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            prenom: jeune.prenom,
            nom: jeune.nom,
            genre: jeune.genre === "female" ? "fille" : "garçon",
            qpv: ["true", "oui"].includes(jeune.qpv!) ? "oui" : "non",
            psh: ["true", "oui"].includes(jeune.psh!) ? "oui" : "non",
            handicapMemeDepartement: ["true", "oui"].includes(jeune.handicapMemeDepartement!) ? "oui" : "non",
            sessionNom: jeune.sessionNom,
            regionResidence: jeune.region,
            departementResidence: jeune.departement,
            regionScolarite: jeune.regionScolarite,
            departementScolarite: jeune.departementScolarite,
            etranger: jeune.paysScolarite !== "FRANCE" ? "oui" : "non",
            HZR: jeune.departementScolarite !== jeune.departement ? "oui" : "non",
            ...(type === "HTS"
                ? {
                      pointDeRassemblementId: jeune.pointDeRassemblementId,
                      pointDeRassemblementMatricule: pdr?.matricule,
                      ligneDeBusId: jeune.ligneDeBusId,
                      ligneDeBusNumeroLigne: ligneDeBus?.numeroLigne,
                  }
                : {}),
            centreId: jeune.centreId,
            centreMatricule: centre?.matricule,
        };
    }

    sortRegionEtDepartement(
        itemA: {
            departement?: string;
            departementResidence?: string;
            region?: string;
            regionResidence?: string;
            handicapMemeDepartement?: string;
        },
        itemB: {
            departement?: string;
            departementResidence?: string;
            region?: string;
            regionResidence?: string;
            handicapMemeDepartement?: string;
        },
    ) {
        if (itemA.handicapMemeDepartement !== itemB.handicapMemeDepartement) {
            return 1;
        }

        const departementA = itemA.departement || itemA.departementResidence;
        const regionA = itemA.region || itemA.regionResidence;
        const departementB = itemB.departement || itemB.departementResidence;
        const regionB = itemB.region || itemB.regionResidence;

        const regionComparison = regionA?.localeCompare(regionB!) || 0;
        if (regionComparison !== 0) {
            return regionComparison;
        }
        // si c'est la même région on tri par departement
        return departementA?.localeCompare(departementB!) || 0;
    }

    randomizeArray(array: any[], returnIndexes: boolean = false): any[] {
        const result = returnIndexes ? Array.from({ length: array.length }, (_, i) => i) : [...array];
        let currentIndex = result.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {
            // Pick a remaining element...
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];
        }
        return result;
    }

    formatChangementDepartements(changementDepartements: ChangementDepartement[]) {
        return changementDepartements
            .map(
                ({ origine, destination }) =>
                    `${formatDepartement(origine)} -> ${[...new Set(destination.map((dest) => dest.departement))]
                        .map(formatDepartement)
                        .join("-")}`,
            )
            .join("; \n");
    }
}
