import { Inject, Injectable, Logger } from "@nestjs/common";

import { YOUNG_STATUS_PHASE1 } from "snu-lib";

import { FileGateway } from "@shared/core/File.gateway";

import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { SejourModel } from "../sejour/Sejour.model";
import { JeuneModel } from "../../jeune/Jeune.model";
import { CentreModel } from "../centre/Centre.model";

type JeuneRapport = Pick<
    JeuneModel,
    | "id"
    | "statusPhase1"
    | "genre"
    | "qpv"
    | "psh"
    | "sessionNom"
    | "region"
    | "departement"
    | "pointDeRassemblementId"
    | "ligneDeBusId"
    | "centreId"
    | "status"
    | "prenom"
    | "nom"
    | "handicapMemeDepartment"
>;

export type RapportData = {
    summary: { [key: string]: string }[];
    jeunesNouvellementAffectedList: Array<
        JeuneRapport & {
            "Point de rassemblement (id)": string;
            sejourId: string;
        }
    >;
    jeunesDejaAffectedList: JeuneRapport[];
    jeuneAttenteAffectationList: JeuneRapport[];
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
            centreNom: string;
            tauxRemplissageCentre: string;
        }
    >;
    pdrList: Omit<PointDeRassemblementModel, "sessionIds" | "code" | "sessionNoms" | "complementAddress">[];
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

export type Analytics = {
    selectedCost: number;
    tauxRepartitionCentreList: RatioRepartition[];
    centreIdList: string[];
    tauxRemplissageCentreList: number[];
    tauxOccupationLignesParCentreList: number[][];
    iterationCostList: number[];
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

export type JeuneAffectationModel = JeuneModel & { pointDeRassemblementIds: string[] };

@Injectable()
export class SimulationAffectationHTSService {
    constructor(
        @Inject(FileGateway) private readonly fileService: FileGateway,
        private readonly logger: Logger,
    ) {}

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
        const jeunesAffected = jeunesList.filter((jeune) => jeune.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED);

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
    calculTauxRemplissageParCentre(sejourList: SejourModel[], ligneList: LigneDeBusModel[]) {
        const centreIdList = [...new Set(sejourList.map((sejour) => sejour.centreId || ""))];

        const tauxRemplissageCentres = sejourList.map((sejour) => {
            if (!sejour.placesTotal) {
                this.logger.log(`Warning: taille centre NaN -> remplissage fixe a 1 (${sejour.id})`);
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
    ): {
        randomJeuneList: JeuneAffectationModel[];
        randomSejourList: SejourModel[];
        randomLigneDeBusList: LigneDeBusModel[];
    } {
        // on initialise la sortie de la methode
        const randomJeuneList: JeuneAffectationModel[] = JSON.parse(JSON.stringify(jeuneList)); // clone
        const randomSejourList: SejourModel[] = JSON.parse(JSON.stringify(sejourList)); // clone
        const randomLigneDeBusList: LigneDeBusModel[] = JSON.parse(JSON.stringify(ligneDeBusList)); // clone

        const pointDeRassemblementParLigneDeBusId = ligneDeBusList.reduce((acc, ligneDeBus) => {
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
            const ligneDeBusIdList = distributionJeunesDepartement.ligneIdListParDepartement[departementIndex];
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
            const nbAleatoireJeunesSurLignes = this.getAffectationNombreSurLigne(
                placesDisponiblesParLigne,
                nbPlacesAAffecter,
            );

            // on verifie si il y a toujours les places disponibles dans les centres:
            const nbAffectectationARealiser = this.verificationCentres(
                nbAleatoireJeunesSurLignes,
                placesDisponiblesParLigne,
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
                const posValueCentre = randomCentreIdList.indexOf(centreIdListParLigne[jeuneAAffecterIndex]);

                const nmin = nbAffectectationARealiser.slice(0, jeuneAAffecterIndex).reduce((a, b) => a + b, 0);
                let nmax = nbAffectectationARealiser.slice(0, jeuneAAffecterIndex + 1).reduce((a, b) => a + b, 0);

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
                    const pointDeRassemblementIds = pointDeRassemblementParLigneDeBusId[ligneDeBusId];
                    randomJeuneList[index].statusPhase1 = YOUNG_STATUS_PHASE1.AFFECTED;
                    randomJeuneList[index].ligneDeBusId = ligneDeBusId;
                    randomJeuneList[index].pointDeRassemblementIds = pointDeRassemblementIds;
                    randomJeuneList[index].centreId = centreIdListParLigne[jeuneAAffecterIndex];
                });

                randomLigneDeBusList[posValueLigne].placesOccupeesJeunes += jeunesDepartementSelectedIdList.length;
                randomSejourList[posValueCentre].placesRestantes =
                    (randomSejourList[posValueCentre].placesRestantes || 0) - jeunesDepartementSelectedIdList.length;
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
        changementDepartements: { origine: string; destination: string }[],
    ): DistributionJeunesParDepartement {
        // TODO: changementDepartements, les jeunes qui n’ont pas de PDR dans leur département partent du département indiqué dans le SDR

        // on recupere les departements, comme on veut boucler sur les departements, on enleve les doublons
        const departementList = [
            ...new Set([...jeunesList.map((jeune) => jeune.departement), ...pdrList.map((pdr) => pdr.departement)]),
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

            // on parcourt les points de rassemblement de chaque departement
            for (let pdrId of pdrIdsListDepartement) {
                // on parcourt les lignes de bus
                for (const ligneDeBus of ligneDeBusList) {
                    // pour la ligne courante on recupere :
                    //    les id du pdr (il peut y en avoir plusieurs)
                    //    le nombre de places restantes
                    //    l id du centre desservi par la ligne

                    // on regarde si le pdr courant est dans la ligne
                    if (ligneDeBus.pointDeRassemblementIds.includes(pdrId)) {
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
    getAffectationNombreSurLigne(placesDisponiblesParLigne: number[], nbPlacesAAffecter: number): number[] {
        const placesLignesRestantes: number[] = JSON.parse(JSON.stringify(placesDisponiblesParLigne)); // on clone le tableau

        const somme = placesLignesRestantes.reduce((a, b) => a + b, 0);
        // on verifie que le nombre de places est plus grand que celui des jeunes dispos (normalement deja verifie)
        if (somme !== nbPlacesAAffecter) {
            let diff = somme - nbPlacesAAffecter;
            while (diff > 0) {
                // tant que l on peut ajouter un jeune
                const randomIndexLigne = Math.floor(Math.random() * placesLignesRestantes.length); // on selectionne aleatoirement une ligne
                placesLignesRestantes[randomIndexLigne] -= 1; // on enleve une place sur la ligne
                diff -= 1; // on enleve un jeune a affecter
            }
        }
        return placesLignesRestantes;
    }

    // Correction pour affectation des surnumeraires
    verificationCentres(
        nbAleatoireJeunesSurLignes: number[],
        placesDisponiblesParLigne: number[],
        distributionLigneDeBusIdDepartement: string[],
        randomLigneDeBusList: LigneDeBusModel[],
        randomSejourList: SejourModel[],
    ): number[] {
        const nbJeunesAAffecter: number[] = JSON.parse(JSON.stringify(nbAleatoireJeunesSurLignes)); // clone
        const placesLignes = JSON.parse(JSON.stringify(placesDisponiblesParLigne)); // clone

        // TODO: simplifier
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
            const nbPlacesLigne = placesDisponiblesParLigne[randomIndex];
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
        return valeurs.reduce((acc, val, index) => acc + val * poids[index], 0);
    }

    // here we verify that the number of remaining seats is non-negative......
    isPlacesRestantesCoherentes(ligneDeBusList: LigneDeBusModel[], sejourList: SejourModel[]): boolean {
        if (ligneDeBusList.find((ligne) => ligne.capaciteJeunes - ligne.placesOccupeesJeunes < 0)) {
            this.logger.log("lines placesLibres not safe !");
            return false;
        }
        if (sejourList.find((sejour) => sejour.placesRestantes !== undefined && sejour.placesRestantes < 0)) {
            this.logger.log("centre placesLeft not safe !");
            return false;
        }
        return true;
    }

    getInfoNonAffectes(
        jeuneAttenteAffectationList: JeuneRapport[],
        ligneDeBusList: LigneDeBusModel[],
        pdrList: PointDeRassemblementModel[],
        centreList: CentreModel[],
        sejourList: SejourModel[],
        regionsConcerneeList: string[],
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
        let lignesNames = "";
        let pasDecentre = 0;
        let centresNames = "";

        let limite = 0;

        const jeunes = jeuneAttenteAffectationList.map(({ departement, region }) => {
            let resumeJeune: string = "";
            const busIdList: string[] = [];
            const centreNameList: string[] = [];
            const placesLigneList: number[] = [];
            const placesCentreList: number[] = [];

            let isHorsZone = false;
            let isSansLigne = false;
            let isSansCentre = false;
            let isProblemePlace = false;

            // on récupère les pdr du département du jeune
            const pdrSameDepartementList = pdrList.filter((pdr) => pdr.departement === departement);
            for (const pdr of pdrSameDepartementList) {
                // on récupère les lignes de bus associées au pdr
                const pdrLigneList = ligneDeBusList.filter((ligne) => ligne.pointDeRassemblementIds.includes(pdr.id));

                for (const currentLigne of pdrLigneList) {
                    // on récupère les infos du bus si on ne les a pas déjà
                    if (!busIdList.includes(currentLigne.numeroLigne)) {
                        const nbPlaceDispoLigne = currentLigne.capaciteJeunes - currentLigne.placesOccupeesJeunes;
                        busIdList.push(currentLigne.numeroLigne);
                        placesLigneList.push(nbPlaceDispoLigne);
                        resumeJeune += `Ligne : ${currentLigne.numeroLigne} (${currentLigne?.placesOccupeesJeunes}/${currentLigne?.capaciteJeunes})`;
                    }

                    // on récupère les centres associés à la ligne de bus
                    const centreListLigne = centreList.filter((centre) => centre.id === currentLigne.centreId);
                    for (const centre of centreListLigne) {
                        // on récupère les infos du centre si on ne les a pas déjà
                        if (!centreNameList.includes(centre.nom || "")) {
                            const sejour = sejourList.find((sejour) => sejour.centreId === centre.id);
                            const placesPrises = (sejour?.placesTotal || 0) - (sejour?.placesRestantes || 0);
                            centreNameList.push(centre.nom || "");
                            placesCentreList.push(Number(sejour?.placesRestantes));
                            resumeJeune += ` - Centre : ${centre.nom} (${placesPrises}/${sejour?.placesTotal}).\n`;
                        }
                    }
                }
            }

            if (busIdList.length === 0 && centreNameList.length === 0) {
                probHorsZone += 1;
                if (!departmentHortZone.includes(departement!)) {
                    departmentHortZone.push(departement!);
                }
                isHorsZone = true;
            } else if (busIdList.length === 0 && centreNameList.length !== 0) {
                isSansLigne = true;
                pasDeligne += 1;
                centreNameList.forEach((centreNom) => {
                    centresNames += centreNom;
                });
            } else if (busIdList.length !== 0 && centreNameList.length === 0) {
                isSansCentre = true;
                pasDecentre += 1;
                busIdList.forEach((numeroLigne) => {
                    lignesNames += numeroLigne;
                });
            } else {
                isProblemePlace = true;
                limite += 1;
            }

            return {
                "Ligne Theorique": busIdList.join(";"), // lignes avec des pdr dans le departement du jeune
                "Centre Theorique": centreNameList.join(";"), // centre associés au lignes théorique
                "Lignes Places Restantes": placesLigneList.join(";"), // places restantes dans les lignes theoriques
                "Centres Places Restantes": placesCentreList.join(";"), // places restantes dans les centres theoriques
                "Hors Zone (région)": regionsConcerneeList.includes(region || "") ? "non" : "oui", // la region du jeune n'a pas de pdr
                "Probablement hors zones (département)": isHorsZone ? "oui" : "non", // aucune ligne ni centre théorique trouvé
                "Pas de ligne disponible": isSansLigne ? "oui" : "non", // à un centre théorique mais pas de ligne
                "Pas de centre disponible": isSansCentre ? "oui" : "non", // à une ligne théorique mais pas de centre
                "Problème de places": isProblemePlace ? "oui" : "non", // à une ligne et un centre théorique mais n'a pas été affecté
                Résumé: resumeJeune,
            };
        });

        return {
            jeunes,
            stats: [
                "jeunes probablement hors zones : " + probHorsZone,
                "          -> Liste des départements hors zones : " + departmentHortZone.join(", "),
                "jeunes pas de ligne disponible pour centre(s) " + centresNames + " : " + pasDeligne,
                "jeunes pas de centre disponible pour ligne(s) " + lignesNames + " : " + pasDecentre,
                "jeunes non affectés pour problèmes de places : " + limite,
            ],
        };
    }

    calculRapportAffectation(
        jeunesList: JeuneAffectationModel[],
        sejourList: SejourModel[],
        ligneDeBusList: LigneDeBusModel[],
        centreList: CentreModel[],
        pdrList: PointDeRassemblementModel[],
        jeunesAvantAffectationList: JeuneModel[],
        jeuneIntraDepartementList: JeuneModel[],
        analytics: Analytics,
    ): RapportData {
        const jeunesAffectedList = jeunesList.filter((jeune) => jeune.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED);
        const regionsConcerneeList = [...new Set(pdrList.map((pdr) => pdr.region))];
        const sejourCentreIdList = sejourList.map((s) => s.centreId || "");
        const sejourIdList = sejourList.map((s) => s.id);

        const pdrIdJeuneAffectedList: string[] = [];
        const jeuneSejourIdList: string[] = [];

        for (const jeune of jeunesAffectedList) {
            const pdrIds = jeune.pointDeRassemblementIds || [];
            const randomPdrIndex = Math.floor(Math.random() * pdrIds.length);
            const selectedPdrID = pdrIds[randomPdrIndex]?.replace(/[^a-zA-Z0-9]+/g, ""); // ?
            pdrIdJeuneAffectedList.push(selectedPdrID);

            // FIXME: index non coherent entre les deux listes ?
            sejourCentreIdList.forEach((centreId, index) => {
                if (jeune.centreId === centreId) {
                    jeuneSejourIdList.push(sejourIdList[index]);
                }
            });
        }

        const jeunesAffectedListUpdated = jeunesAffectedList.map(this.mapJeuneRapport);

        const jeunesDejaAffectedIdList = jeunesAvantAffectationList.reduce((acc: string[], jeune) => {
            if (jeune.centreId) {
                acc.push(jeune.id);
            }
            return acc;
        }, []);
        const jeunesDejaAffectedList = jeunesList
            .filter((jeune) => jeunesDejaAffectedIdList.includes(jeune.id))
            .map(this.mapJeuneRapport);

        const jeunesNouvellementAffectedList = jeunesAffectedListUpdated.reduce(
            (acc: RapportData["jeunesNouvellementAffectedList"], jeune, index) => {
                if (!jeunesDejaAffectedIdList.includes(jeune.id)) {
                    acc.push({
                        ...jeune,
                        "Point de rassemblement (id)": pdrIdJeuneAffectedList[index],
                        sejourId: jeuneSejourIdList[index],
                    });
                }
                return acc;
            },
            [],
        );

        let jeuneAttenteAffectationList = jeunesList
            .filter((jeune) => jeune.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION)
            .map(this.mapJeuneRapport);

        // On recupere les possibilites theoriques des jeunes non affectes
        const infoNonAffecetes = this.getInfoNonAffectes(
            jeuneAttenteAffectationList,
            ligneDeBusList,
            pdrList,
            centreList,
            sejourList,
            regionsConcerneeList,
        );

        jeuneAttenteAffectationList = jeuneAttenteAffectationList.map((jeune, index) => ({
            ...jeune,
            ...infoNonAffecetes.jeunes[index],
        }));

        const jeuneIntraDepartementListUpdated = jeuneIntraDepartementList.map(this.mapJeuneRapport);

        const sejourListUpdated = sejourList.map((sejour) => {
            if (sejour.centreId) {
                const centre = centreList.find((centre) => centre.id === sejour.centreId);
                return {
                    id: sejour.id,
                    centreId: sejour.centreId,
                    sessionName: sejour.sessionName,
                    chefDeCentreReferentId: sejour.chefDeCentreReferentId,
                    placesRestantes: sejour.placesRestantes,
                    placesTotal: sejour.placesTotal,
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
                    tauxRemplissage: analytics.tauxRemplissageCentreList[indexCentre],
                    tauxGarcon: analytics.tauxRepartitionCentreList[indexCentre]?.male,
                    tauxQVP: analytics.tauxRepartitionCentreList[indexCentre]?.qvp,
                    tauxPSH: analytics.tauxRepartitionCentreList[indexCentre]?.psh,
                };
                return {
                    id: centre.id,
                    nom: centre.nom,
                    region: centre.region,
                    departement: centre.departement,
                    ville: centre.ville,
                    codePostal: centre.codePostal,
                    tauxRemplissage: this.formatPourcent(stats.tauxRemplissage),
                    tauxGarcon: this.formatPourcent(stats.tauxGarcon),
                    tauxFille: this.formatPourcent(1 - stats.tauxGarcon),
                    tauxQVP: this.formatPourcent(stats.tauxQVP),
                    tauxPSH: this.formatPourcent(stats.tauxPSH),
                    ...centreSejourList.reduce((acc, sejour, index) => {
                        acc[`sejour_id_${index + 1}`] = sejour.id;
                        acc[`sejour_places-occupées_${index + 1}`] =
                            (sejour.placesTotal || 0) - (sejour.placesRestantes || 0);
                        acc[`sejour_places-restantes_${index + 1}`] = sejour.placesRestantes;
                        return acc;
                    }, {}),
                    ...ligneSejourList.reduce((acc, ligne, index) => {
                        acc[`bus_numero-ligne_${index}`] = ligne.numeroLigne;
                        acc[`bus_places-occupées_${index}`] = ligne.placesOccupeesJeunes;
                        acc[`bus_places-restantes_${index}`] = ligne.capaciteJeunes - ligne.placesOccupeesJeunes;
                        return acc;
                    }, {}),
                } as RapportData["centreList"][0];
            })
            .sort(this.sortRegionEtDepartement);

        const ligneDeBusListUpdated = ligneDeBusList.map((ligne) => {
            const indexCentre = sejourCentreIdList.indexOf(ligne.centreId);
            const centreLigne = centreList.find((centre) => centre.id === ligne.centreId);
            const tauxRemplissageCentre = analytics.tauxRemplissageCentreList[indexCentre];
            return {
                sessionNom: ligne.sessionNom,
                id: ligne.id,
                numeroLigne: ligne.numeroLigne,
                pointDeRassemblementIds: ligne.pointDeRassemblementIds.join(", "),
                placesOccupeesJeunes: ligne.placesOccupeesJeunes,
                capaciteJeunes: ligne.capaciteJeunes,
                centreId: ligne.centreId,
                centreNom: centreLigne?.nom,
                tauxRemplissageCentre: this.formatPourcent(tauxRemplissageCentre),
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
            geoLoc: pdr.geoLoc,
        }));

        const summary = [
            "Nombre de jeunes affectés : " + jeunesNouvellementAffectedList.length,
            "En attente d'affectation : " + jeuneAttenteAffectationList.length,
            "Taux d'erreur pour l'iteration : " + analytics.selectedCost,
            ...infoNonAffecetes.stats,
        ].map((ligne) => ({
            "": ligne,
        }));

        return {
            summary,
            jeunesNouvellementAffectedList: jeunesNouvellementAffectedList.sort(this.sortRegionEtDepartement),
            jeunesDejaAffectedList: jeunesDejaAffectedList.sort(this.sortRegionEtDepartement),
            jeuneAttenteAffectationList: jeuneAttenteAffectationList.sort(this.sortRegionEtDepartement),
            sejourList: sejourListUpdated.sort(this.sortRegionEtDepartement),
            ligneDeBusList: ligneDeBusListUpdated.sort(
                (busA, busB) => busA.numeroLigne?.localeCompare(busB.numeroLigne!) || -1,
            ),
            pdrList: pdrListUpdated.sort(this.sortRegionEtDepartement),
            centreList: centreListUpdated.sort(this.sortRegionEtDepartement),
            jeuneIntraDepartementList: jeuneIntraDepartementListUpdated.sort(this.sortRegionEtDepartement),
        };
    }

    async generateRapportExcel(rapportData: RapportData): Promise<Buffer> {
        return this.fileService.generateExcel({
            Résumé: rapportData.summary,
            Affectes: rapportData.jeunesNouvellementAffectedList,
            "Affectes en amont": rapportData.jeunesDejaAffectedList,
            "Non affectés": rapportData.jeuneAttenteAffectationList,
            Sejours: rapportData.sejourList,
            "Lignes de bus": rapportData.ligneDeBusList,
            PDR: rapportData.pdrList,
            Centres: rapportData.centreList,
            "intradep à affecter": rapportData.jeuneIntraDepartementList,
        });
    }

    async savePdfFile(reportData: any, fileName: string): Promise<void> {
        // TODO: récupération de la logique de génération du PDF
    }

    mapJeuneRapport(jeune: JeuneModel) {
        return {
            id: jeune.id,
            statusPhase1: jeune.statusPhase1,
            genre: jeune.genre === "female" ? "fille" : "garçon",
            qpv: ["true", "oui"].includes(jeune.qpv!) ? "oui" : "non",
            psh: ["true", "oui"].includes(jeune.psh!) ? "oui" : "non",
            sessionNom: jeune.sessionNom,
            region: jeune.region,
            departement: jeune.departement,
            pointDeRassemblementId: jeune.pointDeRassemblementId,
            ligneDeBusId: jeune.ligneDeBusId,
            centreId: jeune.centreId,
            status: jeune.status,
            prenom: jeune.prenom,
            nom: jeune.nom,
            handicapMemeDepartment: ["true", "oui"].includes(jeune.handicapMemeDepartment!) ? "oui" : "non",
        };
    }

    sortRegionEtDepartement(
        itemA: { departement?: string; region?: string },
        itemB: { departement?: string; region?: string },
    ) {
        const regionComparison = itemA.region?.localeCompare(itemB.region!) || 0;
        if (regionComparison !== 0) {
            return regionComparison;
        }
        return itemA.departement?.localeCompare(itemB.departement!) || 0;
    }

    formatPourcent(value: number): string {
        return (value * 100).toFixed(2) + "%";
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
}
