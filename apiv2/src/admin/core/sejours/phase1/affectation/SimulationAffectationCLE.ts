import { Inject, Logger } from "@nestjs/common";

import {
    RegionsHorsMetropoleWithoutCorse,
    YOUNG_STATUS,
    YOUNG_STATUS_PHASE1,
    department2region,
    MIME_TYPES,
} from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { RapportData, SimulationAffectationCLEService } from "./SimulationAffectationCLE.service";

import { SejourModel } from "../sejour/Sejour.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { FileGateway } from "@shared/core/File.gateway";
import { SimulationAffectationCLETaskParameters } from "./SimulationAffectationCLETask.model";
import { ClasseGateway } from "../../cle/classe/Classe.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { ClasseModel } from "../../cle/classe/Classe.model";
import { JeuneModel } from "../../jeune/Jeune.model";
import { EtablissementGateway } from "../../cle/etablissement/Etablissement.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";

type Resultats = {
    jeunesList: JeuneModel[];
    jeunesDejaAffectedList: JeuneModel[];
    centreList: {
        sejour: SejourModel;
        placeOccupees: number;
        placeRestantes: number;
    }[];
    ligneDeBusList: {
        ligneDeBus: LigneDeBusModel;
        classeId: string;
        sejourId: string;
        pdr: PointDeRassemblementModel;
        placeOccupees: number;
        placeRestantes: number;
    }[];
    classeErreurList: {
        classe: ClasseModel;
        ligneBus?: LigneDeBusModel;
        sejour?: SejourModel;
        jeunesNombre?: number;
        message: string;
    }[];
};

export type SimulationAffectationCLEResult = {
    rapportData: RapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: {
        classes: number;
        jeunesAffected: number;
        erreurs: number;
    };
};

export class SimulationAffectationCLE implements UseCase<SimulationAffectationCLEResult> {
    constructor(
        @Inject(SimulationAffectationCLEService)
        private readonly simulationAffectationCLEService: SimulationAffectationCLEService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(EtablissementGateway) private readonly etablissementGateway: EtablissementGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(PointDeRassemblementGateway) private readonly pointDeRassemblementGateway: PointDeRassemblementGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        private readonly logger: Logger,
    ) {}
    async execute({
        sessionId,
        departements,
        etranger,
    }: SimulationAffectationCLETaskParameters): Promise<SimulationAffectationCLEResult> {
        if (
            departements.some((departement) =>
                RegionsHorsMetropoleWithoutCorse.includes(department2region[departement]),
            )
        ) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_DEPARTEMENT_HORS_METROPOLE);
        }

        const classeList = await this.classeGateway.findBySessionIdAndDepartmentNotWithdrawn(sessionId, departements);
        if (classeList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucune classes !");
        }

        const etablissementIds = [...new Set(classeList.map((classe) => classe.etablissementId))];
        const etablissementList = await this.etablissementGateway.findByIds(etablissementIds);

        const referentIds = [...new Set(classeList.flatMap((classe) => classe.referentClasseIds))];
        const referentsList = await this.referentGateway.findByIds(referentIds);

        this.logger.log(`Classes à affecter: ${classeList.length} (etablissements: ${etablissementIds.length})`);

        const resultats: Resultats = {
            jeunesList: [],
            jeunesDejaAffectedList: [],
            centreList: [],
            ligneDeBusList: [],
            classeErreurList: [],
        };

        for (const classe of classeList) {
            if (!classe.sessionId || !classe.pointDeRassemblementId) {
                resultats.classeErreurList.push({
                    classe,
                    message: "Pas de session ou de point de rassemblement pour la classe",
                });
                continue;
            }

            const jeunesClasseList = await this.jeuneGateway.findBySessionIdClasseIdAndStatus(
                sessionId,
                classe.id,
                YOUNG_STATUS.VALIDATED,
            );
            if (jeunesClasseList.length === 0) {
                resultats.classeErreurList.push({ classe, message: "Aucun volontaire trouvé" });
                continue;
            }
            let jeunesList = jeunesClasseList.filter((jeune) => jeune.statutPhase1 !== YOUNG_STATUS_PHASE1.AFFECTED);
            if (!etranger) {
                jeunesList = jeunesList.filter((jeune) => jeune.paysScolarite === "FRANCE");
            }

            const jeunesDejaAffectedList = jeunesClasseList.filter(
                (jeune) => jeune.statutPhase1 === YOUNG_STATUS_PHASE1.AFFECTED,
            );
            if (jeunesDejaAffectedList.length > 0) {
                this.logger.log(`Classes ${classe.id}: jeunes déjà affecté ${jeunesDejaAffectedList.length}`);
            }

            if (jeunesList.length === 0) {
                resultats.classeErreurList.push({ classe, message: "Aucun volontaire non affecté trouvé" });
                continue;
            }

            const ligneBus = await this.ligneDeBusGateway.findBySessionIdAndClasseId(sessionId, classe.id);
            if (!ligneBus) {
                resultats.classeErreurList.push({
                    classe,
                    jeunesNombre: jeunesList.length,
                    message: "Pas de bus trouvé",
                });
                continue;
            }

            const sejour = await this.sejourGateway.findById(classe.sejourId!);
            if (!sejour || sejour.sessionId !== sessionId) {
                resultats.classeErreurList.push({
                    classe,
                    ligneBus,
                    jeunesNombre: jeunesList.length,
                    message: "Pas de session déclarée pour le centre",
                });
                continue;
            }

            let pointDeRassemblement: PointDeRassemblementModel | null = null;
            if (ligneBus.pointDeRassemblementIds.includes(classe.pointDeRassemblementId)) {
                pointDeRassemblement = await this.pointDeRassemblementGateway.findById(classe.pointDeRassemblementId);
            }
            if (!pointDeRassemblement) {
                resultats.classeErreurList.push({
                    message: "Pas de point de rassemblement déclaré pour la cohort",
                    classe,
                    ligneBus,
                    jeunesNombre: jeunesList.length,
                });
                continue;
            }

            // Gestion place dans le BUS
            const resultatLigneBus = resultats.ligneDeBusList.find((r) => r.ligneDeBus.id === ligneBus.id);
            let placesRestantes =
                resultatLigneBus?.placeRestantes || ligneBus.capaciteJeunes - ligneBus.placesOccupeesJeunes || 0;
            if (placesRestantes < jeunesList.length) {
                resultats.classeErreurList.push({
                    message: "La capacité du bus est trop faible",
                    classe,
                    ligneBus,
                    jeunesNombre: jeunesList.length,
                });
                continue;
            }
            if (!resultatLigneBus) {
                resultats.ligneDeBusList.push({
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

            // Gestion place dans le centre
            const resultatCentre = resultats.centreList.find((r) => r.sejour.id === sejour.id);
            placesRestantes = resultatCentre?.placeRestantes || sejour.placesRestantes || 0;
            if (placesRestantes < jeunesList.length) {
                resultats.classeErreurList.push({
                    message: "La capacité de la session est trop faible",
                    classe,
                    ligneBus,
                    sejour,
                    jeunesNombre: jeunesList.length,
                });
                continue;
            }
            if (!resultatCentre) {
                resultats.centreList.push({
                    sejour: sejour,
                    placeOccupees: (sejour.placesTotal || 0) - (sejour.placesRestantes || 0) + jeunesList.length,
                    placeRestantes: (sejour.placesRestantes || 0) - jeunesList.length,
                });
            } else {
                resultatCentre.placeOccupees += jeunesList.length;
                resultatCentre.placeRestantes -= jeunesList.length;
            }

            // affectation jeunes
            for (const jeune of jeunesList) {
                resultats.jeunesList.push({
                    ...jeune,
                    pointDeRassemblementId: pointDeRassemblement.id,
                    ligneDeBusId: ligneBus.id,
                    sejourId: sejour.id,
                    centreId: sejour.centreId,
                    statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                });
            }
        }

        const rapportData = this.simulationAffectationCLEService.calculRapportAffectation(
            resultats.jeunesList,
            resultats.ligneDeBusList,
            resultats.centreList,
            resultats.classeErreurList,
            classeList,
            etablissementList,
            referentsList,
        );

        const fileBuffer = await this.simulationAffectationCLEService.generateRapportExcel(rapportData);

        const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const fileName = `simulation-affectation-cle/affectation_simulation_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/affectation/simulation/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        return {
            analytics: {
                classes: classeList.length,
                jeunesAffected: resultats.jeunesList.length,
                erreurs: resultats.classeErreurList.length,
            },
            rapportData,
            rapportFile,
        };
    }
}
