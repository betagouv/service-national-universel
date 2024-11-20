import { promises as fs } from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { Injectable } from "@nestjs/common";

import { YOUNG_STATUS_PHASE1 } from "snu-lib";

import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { SejourModel } from "../sejour/Sejour.model";
import { JeuneModel } from "../../jeune/Jeune.model";
import { CentreModel } from "../centre/Centre.model";

export type RapportData = {
    jeunesNouvellementAffectedList: Array<
        JeuneAffectationModel & {
            "Point de rassemblement (id)": string;
            sp1_id: string;
        }
    >;
    jeunesDejaAffectedList: JeuneAffectationModel[];
    jeuneAttenteAffectationList: JeuneAffectationModel[];
    sejourList: SejourModel[];
    pdrList: PointDeRassemblementModel[];
    ligneDeBusList: Array<
        Partial<LigneDeBusModel> & {
            pointDeRassemblementIds: string;
            centreNom: string;
            tauxRemplissageCentre: string;
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
    jeuneIntraDepartementList: JeuneModel[];
};

export type Analytics = {
    selectedCost: number[];
    tauxRepartitionCentreList: number[][];
    centreIdList: string[];
    tauxRemplissageCentreList: number[];
    tauxOccupationLignesParCentreList: number[][];
    iterationCostList: number[];
};

export interface DistributionJeunes {
    Department: string[];
    idJeunes: string[][];
    Lignes: string[][];
    PlacesParLignes: number[][];
    idCentres: string[][];
}

export type JeuneAffectationModel = JeuneModel & { pointDeRassemblementIds: string[] };

@Injectable()
export class SimulationAffectationHTSService {
    constructor() {} // readonly simulationAffectationPdfService: SimulationAffectationPdfService

    computeRatioRepartition(jeunesList: JeuneModel[]): number[] {
        let initialRatios = [0.5, 0.3, 0.1];
        if (jeunesList.length > 0) {
            let maleCount = 0;
            let qvpCount = 0;
            let handicapCount = 0;

            for (const jeune of jeunesList) {
                if (jeune.genre === "male") {
                    maleCount++;
                }

                let qvp = (jeune.qpv as string)?.toLowerCase();
                if (qvp !== "oui" && qvp !== "non") {
                    qvp = "non";
                }
                if (qvp === "oui") {
                    qvpCount++;
                }

                let handicap = (jeune.handicap as string)?.toLowerCase();
                if (handicap !== "oui" && handicap !== "non") {
                    handicap = "non";
                }
                if (handicap === "oui") {
                    handicapCount++;
                }
            }

            let maleRatio = maleCount / jeunesList.length;
            let qvpRatio = qvpCount / jeunesList.length;
            let handicapRatio = handicapCount / jeunesList.length;

            initialRatios = [maleRatio, qvpRatio, handicapRatio];
        }
        // TODO: retourner un objet avec des proprités nommées
        return initialRatios;
    }

    // ici, on calcule les taux de repartition par centre
    calculTauxRepartitionParCentre(sejourList: SejourModel[], jeunesList: JeuneModel[]) {
        const centresIds = sejourList.map((item) => item.centreId);
        const jeunesAffected = jeunesList.filter((jeune) => jeune.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED);

        let taux: number[][] = [];
        for (const centreId of centresIds) {
            const jeunesAffectedToCenter = jeunesAffected.filter((jeune) => jeune.centreId === centreId);
            const tauxCentre = this.computeRatioRepartition(jeunesAffectedToCenter);
            taux.push(tauxCentre);
        }
        // TODO: retourner un objet avec les ids des centres et les taux de repartition
        return taux;
    }

    // on calcule les taux de remplissage de chaque centre et les taux de remplissage des lignes de chaque centre
    calculTauxRemplissageParCentre(sejourList: SejourModel[], ligneList: LigneDeBusModel[]) {
        const centreIdList = [...new Set(sejourList.map((sejour) => sejour.centreId || ""))];

        const tauxRemplissageCentres = sejourList.map((sejour) => {
            if (!sejour.placesTotal) {
                console.log(`Warning: taille centre NaN -> remplissage fixe a 1 (${sejour.id})`);
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

    // ici on effectue l affectation aleatoire
    randomAffectation(
        distributionJeunes: DistributionJeunes,
        jeuneList: JeuneModel[],
        sejourList: SejourModel[],
        ligneDeBusList: LigneDeBusModel[],
        indexes: {
            meeting_points_index: {
                [key: string]: string[];
            };
        },
    ): {
        randomJeuneList: JeuneAffectationModel[];
        randomSejourList: SejourModel[];
        randomLigneDeBusList: LigneDeBusModel[];
    } {
        // on initialise la sortie de la methode
        let randomJeuneList: JeuneAffectationModel[] = JSON.parse(JSON.stringify(jeuneList)); // clone
        let randomSejourList: SejourModel[] = JSON.parse(JSON.stringify(sejourList)); // clone
        let randomLigneDeBusList: LigneDeBusModel[] = JSON.parse(JSON.stringify(ligneDeBusList)); // clone

        // donne des indexes aleatoire pour les jeunes de chaque departement
        let randomPosition = this.getPositionJeuneAleatoireParDepartement(distributionJeunes.idJeunes);

        let departementList = distributionJeunes.Department;

        // on randomise l ordre de lecture des departements -> pour ne pas privilegier toujours le meme
        let randomDepIndex = this.randomizeArray(departementList, true);

        // on boucle sur les departements
        for (let departementIndex of randomDepIndex) {
            const departement = departementList[departementIndex]; // nom du département
            const ligneDeBusIdList = distributionJeunes["Lignes"][departementIndex];
            const centreIdList = distributionJeunes["idCentres"][departementIndex];
            const placesLignes = distributionJeunes["PlacesParLignes"][departementIndex];
            const randomPositionDepartement = randomPosition[departementIndex]; // position aleatoire pour le departement courant
            const jeuneIdDispoDepartementList = distributionJeunes["idJeunes"][departementIndex]; // liste des jeunes dispo dans le departement courant

            // securite dans la bdd
            if (departement && departement !== "NaN") {
                const nbPlaceLignes = placesLignes.reduce((a, b) => a + b, 0);
                if (nbPlaceLignes > 0) {
                    // le nombre de jeunes pouvant etre affecter est soit le nombre de jeunes dans le departement courant soit le nombre de places
                    // le facteur limitant est le plus petit nombre parmis les 2
                    const nbPlacesAAffecter = Math.min(nbPlaceLignes, jeuneIdDispoDepartementList.length);

                    // on recupere les nbPlacesAAffecter premiers indexes (aleatoires) des jeunes du departement courant
                    const jeunePositionDepartementSelected = randomPositionDepartement.slice(0, nbPlacesAAffecter);

                    // on affecte de maniere aleatoire un nombre de jeunes sur chaque ligne
                    const nbAleatoireJeunesSurLignes = this.getAffectationNombreSurLigne(
                        placesLignes,
                        nbPlacesAAffecter,
                    );

                    // on verifie si il y a toujours les places disponibles dans les centres:
                    const nbAffectectationARealiser = this.verificationCentres(
                        nbAleatoireJeunesSurLignes,
                        placesLignes,
                        ligneDeBusIdList,
                        randomLigneDeBusList,
                        randomSejourList,
                    );

                    const randomLigneDeBusIdList = randomLigneDeBusList.map((ligne) => ligne.id);
                    const randomCentreIdList = randomSejourList.map((sejour) => sejour.centreId);

                    for (
                        let jeuneAAffecterIndex = 0;
                        jeuneAAffecterIndex < nbAffectectationARealiser.length;
                        jeuneAAffecterIndex++
                    ) {
                        const posValueLigne = randomLigneDeBusIdList.indexOf(ligneDeBusIdList[jeuneAAffecterIndex]);
                        const posValueCentre = randomCentreIdList.indexOf(centreIdList[jeuneAAffecterIndex]);

                        const nmin = nbAffectectationARealiser.slice(0, jeuneAAffecterIndex).reduce((a, b) => a + b, 0);
                        let nmax = nbAffectectationARealiser
                            .slice(0, jeuneAAffecterIndex + 1)
                            .reduce((a, b) => a + b, 0);

                        // securite: Plus de jeunes que de places dans le Centre
                        while (nmax - nmin > (randomSejourList[posValueCentre].placesRestantes || 0)) {
                            nmax += -1;
                        }

                        const randomIndices = jeunePositionDepartementSelected.slice(nmin, nmax).map(Number);
                        const jeunesDepartementSelectedIdList = randomIndices.map(
                            (index) => jeuneIdDispoDepartementList[index],
                        );

                        // On actualise la base de donnees
                        const randomJeuneIdList = randomJeuneList.map((jeune) => jeune.id);
                        const randomJeuneSelectedIndices = jeunesDepartementSelectedIdList.map((id) =>
                            randomJeuneIdList.indexOf(id),
                        );

                        randomJeuneSelectedIndices.forEach((index) => {
                            const ligneDeBusId = ligneDeBusIdList[jeuneAAffecterIndex];
                            const pointDeRassemblementIds = indexes.meeting_points_index[ligneDeBusId];
                            randomJeuneList[index].statusPhase1 = YOUNG_STATUS_PHASE1.AFFECTED;
                            randomJeuneList[index].ligneDeBusId = ligneDeBusId;
                            randomJeuneList[index].pointDeRassemblementIds = pointDeRassemblementIds;
                            randomJeuneList[index].centreId = centreIdList[jeuneAAffecterIndex];
                        });

                        randomLigneDeBusList[posValueLigne].placesOccupeesJeunes +=
                            jeunesDepartementSelectedIdList.length;
                        randomSejourList[posValueCentre].placesRestantes =
                            (randomSejourList[posValueCentre].placesRestantes || 0) -
                            jeunesDepartementSelectedIdList.length;
                    }
                }
            }
        }

        if (randomSejourList.find((sejour) => sejour.placesRestantes && sejour.placesRestantes < 0)) {
            throw new Error("Sejour negative placesLeft");
        }
        return { randomJeuneList, randomSejourList, randomLigneDeBusList };
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
    calculDistributionAffectations(
        jeunesList: JeuneModel[],
        pdrList: PointDeRassemblementModel[],
        ligneDeBusList: LigneDeBusModel[],
    ): DistributionJeunes {
        // on recupere les departements, comme on veut boucler sur les departements, on enleve les doublons
        const departementList = [
            ...new Set([...jeunesList.map((jeune) => jeune.departement), ...pdrList.map((pdr) => pdr.departement)]),
        ] as string[];

        const distributionJeunes: {
            Department: string[];
            idJeunes: string[][];
            Lignes: string[][];
            PlacesParLignes: number[][];
            idCentres: string[][];
        } = { Department: [], idJeunes: [], Lignes: [], PlacesParLignes: [], idCentres: [] };

        // on boucle sur les departements
        for (const departement of departementList) {
            // on recupere les jeunes du departement courant
            const jeunesListDepartement = jeunesList.filter((jeune) => jeune.departement === departement);

            // idem pour les points de rassemblement, on prend les id des pdr selectionnes
            const pdrIdsListDepartement = pdrList
                .filter((pdr) => pdr.departement?.toString() === departement)
                .map((pdr) => pdr.id.toString());

            const centreDispoIdList: string[] = [];
            const placeslignes: number[] = [];
            const ligneIdList: string[] = [];

            // on parcourt les points de rassemblement de chaque departement
            for (let pdrId of pdrIdsListDepartement) {
                // on parcourt les lignes de bus
                for (const ligneDeBus of ligneDeBusList) {
                    // pour la ligne courante on recupere :
                    //    les id du pdr (il peut y en avoir plusieurs)
                    //    le nombre de places restantes
                    //    l id du centre desservi par la ligne
                    const nbPlacesligne = ligneDeBus.capaciteJeunes - ligneDeBus.placesOccupeesJeunes;

                    // on regarde si le pdr courant est dans la ligne
                    if (ligneDeBus.pointDeRassemblementIds.includes(pdrId)) {
                        // une ligne peut avoir plusieurs points de rassemblement dans un meme departement
                        // on ajoute l information une seule fois
                        if (!ligneIdList.includes(ligneDeBus.id)) {
                            placeslignes.push(nbPlacesligne);
                            ligneIdList.push(ligneDeBus.id);
                            centreDispoIdList.push(ligneDeBus.centreId);
                        }
                    }
                }
            }
            distributionJeunes["Department"].push(departement);
            distributionJeunes["idCentres"].push(centreDispoIdList);
            distributionJeunes["Lignes"].push(ligneIdList);
            distributionJeunes["PlacesParLignes"].push(placeslignes);
            distributionJeunes["idJeunes"].push(jeunesListDepartement.map((jeune) => jeune.id.toString()));
        }

        return distributionJeunes;
    }

    // On affecte un nombre aleatoire de jeunes sur les lignes a sa disposition
    getAffectationNombreSurLigne(placesLignes: number[], nbPlacesAAffecter: number): number[] {
        const placesLignesRestantes: number[] = JSON.parse(JSON.stringify(placesLignes)); // on clone le tableau

        const somme = placesLignesRestantes.reduce((a, b) => a + b, 0);
        // on verifie que le nombre de places est plus grand que celui des jeunes dispos (normalement deja verifie)
        if (somme !== nbPlacesAAffecter) {
            let diff = somme - nbPlacesAAffecter;
            while (diff > 0) {
                // tant que l on peut ajouter un jeune
                const randLigne = Math.floor(Math.random() * placesLignesRestantes.length); // on selectionne aleatoirement une ligne
                placesLignesRestantes[randLigne] -= 1; // on enleve une place sur la ligne
                diff -= 1; // on enleve un jeune a affecter
            }
        }
        return placesLignesRestantes;
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

    // Correction pour affectation des surnumeraires
    verificationCentres(
        nbAleatoireJeunesSurLignes: number[],
        placesLigneList: number[],
        distributionLigneDeBusIdDepartement: string[],
        randomLigneDeBusList: LigneDeBusModel[],
        randomSejourList: SejourModel[],
    ): number[] {
        const nbJeunesAAffecter: number[] = JSON.parse(JSON.stringify(nbAleatoireJeunesSurLignes)); // clone
        const placesLignes = JSON.parse(JSON.stringify(placesLigneList)); // clone

        const ligneDeBusIdList = randomLigneDeBusList.map((ligne) => ligne.id);
        const ligneDeBusIndexList = distributionLigneDeBusIdDepartement.map((id) => ligneDeBusIdList.indexOf(id));
        const ligneDeBusList = ligneDeBusIndexList.map((index) => randomLigneDeBusList[index]);
        const ligneCenterId = ligneDeBusList.map((ligne) => ligne.centreId);

        const centreIdList = randomSejourList.map((sejour) => sejour.centreId);
        const centreIndexList = ligneCenterId.map((id) => centreIdList.indexOf(id));
        const centreList = centreIndexList.map((index) => randomSejourList[index]);
        const placesLeftList = centreList.map((centre) => centre.placesRestantes || 0);

        const randomLecture = this.randomizeArray(distributionLigneDeBusIdDepartement, true);

        for (let ligneIndex = 0; ligneIndex < distributionLigneDeBusIdDepartement.length; ligneIndex++) {
            const randomIndex = randomLecture[ligneIndex];
            const nbPlacesCentre = placesLeftList[randomIndex];
            const nbPlacesLigne = placesLigneList[randomIndex];
            const nbPlaceDispo = Math.min(nbPlacesCentre || 0, nbPlacesLigne);
            let diff = nbJeunesAAffecter[randomIndex] - nbPlaceDispo;

            if (diff > 0) {
                nbJeunesAAffecter[randomIndex] = nbPlaceDispo;
                placesLeftList[randomIndex] += -nbJeunesAAffecter[randomIndex];
                placesLignes[randomIndex] += -nbJeunesAAffecter[randomIndex];

                for (
                    let ligneIndexNiveau2 = 0;
                    ligneIndexNiveau2 < distributionLigneDeBusIdDepartement.length;
                    ligneIndexNiveau2++
                ) {
                    if (ligneIndexNiveau2 !== ligneIndex && diff > 0) {
                        const randomIndexNiveau2 = randomLecture[ligneIndexNiveau2];
                        const nbPlacesCentreNiveau2 = placesLeftList[randomIndexNiveau2];
                        const nbPlacesLigneNiveau2 = placesLignes[randomIndexNiveau2];
                        const nbPlaceDispoNiveau2 = Math.min(nbPlacesCentreNiveau2, nbPlacesLigneNiveau2);

                        if (nbPlaceDispoNiveau2 > 0) {
                            nbJeunesAAffecter[randomIndexNiveau2] += Math.min(diff, nbPlaceDispoNiveau2);
                            diff += -Math.min(diff, nbPlaceDispoNiveau2);
                            placesLeftList[randomIndexNiveau2] += -Math.min(diff, nbPlaceDispoNiveau2);
                            placesLignes[randomIndexNiveau2] += -Math.min(diff, nbPlaceDispoNiveau2);
                        }
                    }
                }
            } else {
                // code inutilisé ?
                placesLeftList[randomLecture[ligneIndex]] += -nbJeunesAAffecter[randomLecture[ligneIndex]];
                placesLignes[randomLecture[ligneIndex]] += -nbJeunesAAffecter[randomLecture[ligneIndex]];
            }
        }

        return nbJeunesAAffecter;
    }

    // Calcul de la fonction de cout pour une affectation donnee
    computeCost(
        tauxRepartitionCourant: number[][],
        tauxRemplissageCentreCourant: number[],
        tauxInit: number[], // genre, qpv, psh
    ) {
        // get the average of the array elements. The average is taken over the flattened array by default, otherwise over the specified axis. float64 intermediate and return values are used for integer inputs.
        const mn_trc = tauxRepartitionCourant.flat().reduce((acc, val) => acc + val, 0) / tauxRepartitionCourant.length;
        // get the standard deviation of tauxRepartitionCourant, a measure of the spread of a distribution, of the array elements. The standard deviation is computed for the flattened array by default, otherwise over the specified axis.
        const std_trc = Math.sqrt(
            tauxRepartitionCourant.flat().reduce((acc, val) => acc + Math.pow(val - mn_trc, 2), 0) /
                tauxRepartitionCourant.length,
        );

        const tr = tauxInit.map((taux) => Math.abs(mn_trc - taux));

        // get the average of the array elements. The average is taken over the flattened array by default, otherwise over the specified axis. float64 intermediate and return values are used for integer inputs.
        const mn_remp =
            tauxRemplissageCentreCourant.flat().reduce((acc, val) => acc + val, 0) /
            tauxRemplissageCentreCourant.length;
        const tremp = Math.abs(mn_remp - 1.0);
        // get the standard deviation of tauxRepartitionCourant, a measure of the spread of a distribution, of the array elements. The standard deviation is computed for the flattened array by default, otherwise over the specified axis.
        const std_remp = Math.sqrt(
            tauxRemplissageCentreCourant.flat().reduce((acc, val) => acc + Math.pow(val - mn_remp, 2), 0) /
                tauxRemplissageCentreCourant.length,
        );

        // pour le moment, le critere principal est d envoyer l ensemble des jeunes. Le seul poids non nul est porte sur ce critere
        const valeurs: number[] = [tremp, std_remp, tr[0], tr[1], std_trc[0] || 0, std_trc[1] || 0]; // centre, std centre, genre, qpv, stdgenre, stdqpv
        const poids = [1.0, 0.0, 0.0, 0.0, 0.0, 0.0];

        // Dot product of two arrays
        return valeurs.reduce((acc, val, index) => acc + val * poids[index], 0);
    }

    // here we verify that the number of remaining seats is non-negative......
    isRemainingSeatSafe(ligneDeBusList: LigneDeBusModel[], sejourList: SejourModel[]): boolean {
        if (ligneDeBusList.find((ligne) => ligne.capaciteJeunes - ligne.placesOccupeesJeunes < 0)) {
            console.log("lines placesLibres not safe !");
            return false;
        }
        if (sejourList.find((sejour) => sejour.placesRestantes !== undefined && sejour.placesRestantes < 0)) {
            console.log("centre placesLeft not safe !");
            return false;
        }
        return true;
    }

    computeRapport(
        jeunesList: JeuneAffectationModel[],
        sejourList: SejourModel[],
        ligneDeBusList: LigneDeBusModel[],
        centreList: CentreModel[],
        pdrList: PointDeRassemblementModel[],
        jeunesAvantAffectationList: JeuneModel[],
        jeuneIntraDepartementList: JeuneModel[],
        analytics: Analytics,
    ): RapportData {
        const jeunesAffectedList = jeunesList.filter((young) => young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED);
        const regionsConcerneeList = [...new Set(pdrList.map((pdr) => pdr.region))];
        const sejourCentreIdList = sejourList.map((s) => s.centreId || "");
        const sejourIdList = sejourList.map((s) => s.id);

        const pdrIdJeuneAffectedList: string[] = [];
        const jeuneSejourIdList: string[] = [];

        for (const jeune of jeunesAffectedList) {
            const pdrIds = jeune.pointDeRassemblementIds || [];
            const randomPdrIndex = Math.floor(Math.random() * pdrIds.length);
            const selectedPdrID = pdrIds[randomPdrIndex]?.replace(/[^a-zA-Z0-9]+/g, "");
            pdrIdJeuneAffectedList.push(selectedPdrID);

            // FIXME: index non coherent entre les deux listes ?
            sejourCentreIdList.forEach((centreId, index) => {
                if (jeune.centreId === centreId) {
                    jeuneSejourIdList.push(sejourIdList[index]);
                }
            });
        }

        const jeuneAlreadyAffectedId = jeunesAvantAffectationList.reduce((acc, jeune) => {
            if (jeune.centreId) {
                acc.push(jeune.id);
            }
            return acc;
        }, [] as string[]);

        const jeunesDejaAffectedList = jeunesList.filter((jeune) => jeuneAlreadyAffectedId.includes(jeune.id));
        const jeunesNouvellementAffectedList = jeunesAffectedList.reduce(
            (acc, jeune, index) => {
                if (!jeuneAlreadyAffectedId.includes(jeune.id)) {
                    acc.push({
                        ...jeune,
                        "Point de rassemblement (id)": pdrIdJeuneAffectedList[index],
                        sp1_id: jeuneSejourIdList[index],
                    });
                }
                return acc;
            },
            [] as RapportData["jeunesNouvellementAffectedList"],
        );

        let jeuneAttenteAffectationList = jeunesList.filter(
            (jeune) => jeune.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        );

        // On recupere les possibilites theoriques des jeunes non affectes
        const infoNonAffecetesList = this.getInfoNonAffectes(
            jeuneAttenteAffectationList,
            ligneDeBusList,
            pdrList,
            centreList,
            sejourList,
            regionsConcerneeList,
        );

        jeuneAttenteAffectationList = jeuneAttenteAffectationList.map((jeune, index) => ({
            ...jeune,
            ...infoNonAffecetesList[index],
        }));

        sejourList = sejourList.map((sejour) => {
            if (sejour.centreId) {
                const centre = centreList.find((centre) => centre.id === sejour.centreId);
                return {
                    ...sejour,
                    departement: centre?.departement,
                    region: centre?.region,
                    ville: centre?.ville,
                    codePostal: centre?.codePostal,
                    nom: centre?.nom,
                };
            }
            return sejour;
        });

        const centreListUpdated = centreList.map((centre) => {
            const indexCentre = sejourCentreIdList.indexOf(centre.id);
            const centreSejourList = sejourList.filter((sejour) => sejour.centreId === centre.id);
            const ligneSejourList = ligneDeBusList.filter((ligne) => ligne.centreId === centre.id);
            const stats = {
                tauxRemplissage: analytics.tauxRemplissageCentreList[indexCentre],
                tauxGarcon: analytics.tauxRepartitionCentreList[indexCentre]?.[0],
                tauxQVP: analytics.tauxRepartitionCentreList[indexCentre]?.[1],
                tauxPSH: analytics.tauxRepartitionCentreList[indexCentre]?.[2],
            };
            return {
                id: centre.id,
                nom: centre.nom,
                departement: centre.departement,
                region: centre.region,
                ville: centre.ville,
                codePostal: centre.codePostal,
                tauxRemplissage: this.formatPourcent(stats.tauxRemplissage),
                tauxGarcon: this.formatPourcent(stats.tauxGarcon),
                tauxFille: this.formatPourcent(1 - stats.tauxGarcon),
                tauxQVP: this.formatPourcent(stats.tauxQVP),
                tauxPSH: this.formatPourcent(stats.tauxPSH),
                ...centreSejourList.reduce((acc, sejour, index) => {
                    acc[`sp1-id-${index}`] = sejour.id;
                    acc[`sp1-places_restantes-${index}`] = sejour.placesRestantes;
                    acc[`sp1-places_total-${index}`] = sejour.placesTotal;
                    return acc;
                }, {}),
                ...ligneSejourList.reduce((acc, ligne, index) => {
                    acc[`bus-numero_ligne-${index}`] = ligne.numeroLigne;
                    acc[`bus-places_occupées-${index}`] = ligne.placesOccupeesJeunes;
                    acc[`bus-places_total-${index}`] = ligne.capaciteJeunes;
                    return acc;
                }, {}),
            } as RapportData["centreList"][0];
        });

        const ligneDeBusListUpdated = ligneDeBusList.map((ligne) => {
            const indexCentre = sejourCentreIdList.indexOf(ligne.centreId);
            const centreLigne = centreList.find((centre) => centre.id === ligne.centreId);
            const tauxRemplissageCentre = analytics.tauxRemplissageCentreList[indexCentre];
            return {
                sessionNom: ligne.sessionNom,
                id: ligne.id,
                numeroLigne: ligne.numeroLigne,
                pointDeRassemblementIds: ligne.pointDeRassemblementIds,
                placesOccupeesJeunes: ligne.placesOccupeesJeunes,
                capaciteJeunes: ligne.capaciteJeunes,
                centreId: ligne.centreId,
                centreNom: centreLigne?.nom,
                tauxRemplissageCentre: this.formatPourcent(tauxRemplissageCentre),
            } as RapportData["ligneDeBusList"][0];
        });

        return {
            jeunesNouvellementAffectedList,
            jeunesDejaAffectedList,
            jeuneAttenteAffectationList,
            sejourList,
            ligneDeBusList: ligneDeBusListUpdated,
            pdrList,
            centreList: centreListUpdated,
            jeuneIntraDepartementList,
        };
    }

    getInfoNonAffectes(
        jeuneAttenteAffectationList: JeuneModel[],
        ligneDeBusList: LigneDeBusModel[],
        pdrList: PointDeRassemblementModel[],
        centreList: CentreModel[],
        sejourList: SejourModel[],
        regionsConcerneeList: string[],
    ): {
        "Ligne Theorique": string;
        "Centre Theorique": string;
        "Places Restantes Lignes": string;
        "Places Restantes Centres": string;
        "Hors Zone": string;
    }[] {
        const pdrDepartementList = pdrList.map((pdr) => pdr.departement);
        const lignePdrIdList = ligneDeBusList.map((ligne) => ligne.pointDeRassemblementIds);
        const sejourCentreIdList = centreList.map((centre) => centre.id);

        // Iterate through the young individuals
        return jeuneAttenteAffectationList.map(({ departement, region }) => {
            const busIdList: string[] = [];
            const centreNameList: string[] = [];
            const placesLigneList: number[] = [];
            const placesCentreList: number[] = [];

            pdrDepartementList.forEach((pdrDepartement, indexDepartement) => {
                if (departement === pdrDepartement) {
                    const currentPdr = pdrList[indexDepartement];
                    const currentPdrId = currentPdr.id;

                    lignePdrIdList.forEach((currentLignePdrIdList, curentLigneIndex) => {
                        if (currentLignePdrIdList.includes(currentPdrId)) {
                            const currentLigne = ligneDeBusList[curentLigneIndex];
                            const nbPlaceDispoLigne = currentLigne.capaciteJeunes - currentLigne.placesOccupeesJeunes;

                            if (!busIdList.includes(currentLigne.numeroLigne)) {
                                busIdList.push(currentLigne.numeroLigne);
                                placesLigneList.push(nbPlaceDispoLigne);
                            }

                            sejourCentreIdList.forEach((currentCentreId, currentCentreIndex) => {
                                if (currentLigne.centreId === currentCentreId) {
                                    const currentCentre = centreList[currentCentreIndex];
                                    const currentSejourList = sejourList.filter(
                                        (sejour) => sejour.centreId === currentCentre.id,
                                    );
                                    const iplacesCentreList = currentSejourList[0].placesRestantes;

                                    if (!centreNameList.includes(currentCentre.nom || "")) {
                                        centreNameList.push(currentCentre.nom || "");
                                        placesCentreList.push(Number(iplacesCentreList));
                                    }
                                }
                            });
                        }
                    });
                }
            });

            return {
                "Ligne Theorique": JSON.stringify(busIdList),
                "Centre Theorique": JSON.stringify(centreNameList),
                "Places Restantes Lignes": JSON.stringify(placesLigneList),
                "Places Restantes Centres": JSON.stringify(placesCentreList),
                "Hors Zone": regionsConcerneeList.includes(region || "") ? "Non" : "Oui",
            };
        });
    }

    // TODO: déplacer cette fonction dans un service/utilitaire
    async saveExcelFile(rapportData: RapportData, fileName: string): Promise<void> {
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(rapportData.jeunesNouvellementAffectedList),
            "Affectes",
        );
        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(rapportData.jeunesDejaAffectedList),
            "Affectes en amont",
        );
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rapportData.jeuneAttenteAffectationList), "Attente");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rapportData.sejourList), "SessionPhase1");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rapportData.ligneDeBusList), "Lignes de bus");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rapportData.pdrList), "PDR");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rapportData.centreList), "Centres");
        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(rapportData.jeuneIntraDepartementList),
            "intradep à affecter",
        );

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
        await fs.writeFile(path.join(fileName), wbout);
    }

    async savePdfFile(reportData: any, fileName: string): Promise<void> {
        // TODO: récupération de la logique de génération du PDF
    }

    formatPourcent(value: number): string {
        return (value * 100).toFixed(2) + "%";
    }
}
