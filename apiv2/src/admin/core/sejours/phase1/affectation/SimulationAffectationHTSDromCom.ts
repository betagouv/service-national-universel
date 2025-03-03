import { Inject, Logger } from "@nestjs/common";

import { YOUNG_STATUS_PHASE1, department2region, MIME_TYPES, RegionsDromComEtCorse, YOUNG_STATUS } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import {
    Analytics,
    JeuneAffectationModel,
    RapportData,
    SimulationAffectationHTSService,
} from "./SimulationAffectationHTS.service";

import { FileGateway } from "@shared/core/File.gateway";
import { SimulationAffectationHTSDromComTaskParameters } from "./SimulationAffectationHTSDromComTask.model";
import { AffectationService } from "./Affectation.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { CentreGateway } from "../centre/Centre.gateway";
import { SejourModel } from "../sejour/Sejour.model";

export type SimulationAffectationHTSDromComResult = {
    rapportData: RapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: Omit<
        Analytics,
        | "selectedCost"
        | "iterationCostList"
        | "tauxRepartitionCentreList"
        | "tauxRemplissageCentreList"
        | "tauxOccupationLignesParCentreList"
    >;
    jeuneList: JeuneAffectationModel[];
    sejourList: SejourModel[];
};

export class SimulationAffectationHTSDromCom implements UseCase<SimulationAffectationHTSDromComResult> {
    constructor(
        @Inject(AffectationService)
        private readonly affectationService: AffectationService,
        @Inject(SimulationAffectationHTSService)
        private readonly simulationAffectationHTSService: SimulationAffectationHTSService,
        @Inject(CentreGateway) private readonly centresGateway: CentreGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly logger: Logger,
    ) {}
    async execute({
        sessionId,
        niveauScolaires,
        departements,
        etranger,
    }: SimulationAffectationHTSDromComTaskParameters): Promise<SimulationAffectationHTSDromComResult> {
        if (departements.some((departement) => !RegionsDromComEtCorse.includes(department2region[departement]))) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_DEPARTEMENT_HORS_METROPOLE);
        }

        const { sejoursList } = await this.affectationService.loadAffectationData(sessionId, false);

        const centreList = await this.centresGateway.findBySessionId(sessionId);
        if (centreList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucun centres !");
        }

        let jeunesList = await this.jeuneGateway.findBySessionIdStatutNiveauScolairesAndDepartementsCible(
            sessionId,
            YOUNG_STATUS.VALIDATED,
            niveauScolaires,
            departements,
        );
        if (!etranger) {
            jeunesList = jeunesList.filter((jeune) => jeune.paysScolarite?.toUpperCase() === "FRANCE");
        }

        this.logger.log(
            `Jeunes à affecter: ${jeunesList.length} (centres: ${centreList.length}, sejours: ${sejoursList.length})`,
        );

        if (jeunesList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucun jeune !");
        }

        const results: Omit<SimulationAffectationHTSDromComResult, "rapportData" | "rapportFile"> = {
            jeuneList: [],
            sejourList: sejoursList,
            analytics: {
                centreIdList: [],
                jeunesNouvellementAffected: 0,
                jeuneAttenteAffectation: 0,
                jeunesDejaAffected: 0,
            },
        };

        const jeuneAttenteAffectationList = jeunesList.filter(
            ({ statutPhase1 }) => statutPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        );

        const jeuneAffectationList: JeuneAffectationModel[] = JSON.parse(JSON.stringify(jeunesList)); // clone
        for (const jeune of jeuneAffectationList) {
            const centresJeune = centreList.filter((centre) => centre.region === jeune.region);

            const centre = centresJeune?.[0];
            if (centresJeune.length === 1) {
                jeune.centreId = centre.id;
            } else {
                this.logger.warn(`Nombre de centre incohérent ${centreList.length} (${jeune.id} ${jeune.region})`);
            }

            const sejour = sejoursList.find((sejour) => sejour.centreId === centre?.id);
            if (sejour) {
                jeune.sejourId = sejour.id;
            } else {
                this.logger.warn(`Sejour introuvable pour le centre ${centre?.id} (${jeune.id} ${jeune.region})`);
            }

            if (jeune.centreId && jeune.sejourId && sejour?.placesRestantes) {
                jeune.statutPhase1 = YOUNG_STATUS_PHASE1.AFFECTED;
                sejour!.placesRestantes! -= 1;
            }

            results.jeuneList.push(jeune);
        }

        const distributionJeunesDepartement = this.simulationAffectationHTSService.calculDistributionAffectations({
            jeunesList: jeuneAttenteAffectationList,
        });

        const { tauxRemplissageCentres: tauxRemplissageCentreList } =
            this.simulationAffectationHTSService.calculTauxRemplissageParCentre({ sejourList: sejoursList });

        const tauxRepartitionCentreList = this.simulationAffectationHTSService.calculTauxRepartitionParCentre(
            sejoursList,
            results.jeuneList,
        );

        const rapportData = this.simulationAffectationHTSService.calculRapportAffectation({
            jeunesList: results.jeuneList,
            sejourList: results.sejourList,
            centreList,
            jeunesAvantAffectationList: jeunesList,
            distributionJeunesDepartement,
            analytics: {
                ...results.analytics,
                tauxRemplissageCentreList,
                tauxRepartitionCentreList,
            },
            type: "HTS_DROMCOM",
        });

        const fileBuffer = await this.simulationAffectationHTSService.generateRapportExcel(rapportData, "HTS_DROMCOM");

        const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const fileName = `simulation-affectation-hts-dromcom/affectation_simulation_hts-dromcom_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/affectation/simulation/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        return {
            ...results,
            analytics: {
                ...results.analytics,
                jeunesNouvellementAffected: rapportData.jeunesNouvellementAffectedList.length,
                jeuneAttenteAffectation: rapportData.jeuneAttenteAffectationList.length,
                jeunesDejaAffected: rapportData.jeunesDejaAffectedList.length,
            },
            rapportData,
            rapportFile,
        };
    }
}
