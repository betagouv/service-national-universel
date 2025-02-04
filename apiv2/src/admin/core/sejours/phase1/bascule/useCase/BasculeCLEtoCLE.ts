import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { EtablissementGateway } from "@admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { SessionGateway } from "../../session/Session.gateway";
import { ChangerLaSessionDuJeunePayloadDto } from "@admin/infra/sejours/phase1/bascule/api/Bascule.validation";
import { JeuneMapper } from "@admin/infra/sejours/jeune/repository/Jeune.mapper";
import { YoungDto, YOUNG_SOURCE, YOUNG_STATUS, YOUNG_STATUS_PHASE1, STEPS2023 } from "snu-lib";
import { SessionService } from "../../session/Session.service";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { BasculeService } from "../Bascule.service";
import { SejourService } from "../../sejour/Sejour.Service";
import { PlanDeTransportService } from "../../PlanDeTransport/PlanDeTransport.service";
import { ClasseStateManager } from "@admin/core/sejours/cle/classe/stateManager/Classe.stateManager";
import e from "express";

@Injectable()
export class BasculeCLEtoCLE implements UseCase<YoungDto> {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(EtablissementGateway) private readonly etablissementGateway: EtablissementGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        private readonly sessionService: SessionService,
        private readonly basculeService: BasculeService,
        private readonly sejourService: SejourService,
        private readonly planDeTransportService: PlanDeTransportService,
        private readonly classeStateManager: ClasseStateManager,
    ) {}
    async execute(
        jeuneId: string,
        payload: ChangerLaSessionDuJeunePayloadDto,
        user: Partial<ReferentModel>,
    ): Promise<YoungDto> {
        if (payload.source !== YOUNG_SOURCE.CLE || !payload.classeId || !payload.etablissementId) {
            throw new Error("Invalid payload");
        }

        const jeune = await this.jeuneGateway.findById(jeuneId);
        if (jeune.source !== YOUNG_SOURCE.CLE || !jeune.classeId || !jeune.etablissementId) {
            throw new Error("Invalid object jeune");
        }
        const classe = await this.classeGateway.findById(payload.classeId);
        if (!classe.sessionId) {
            throw new Error("Classe has no session");
        }
        if (classe.placesPrises >= classe.placesTotal) {
            throw new Error("Classe is full");
        }
        const etablissement = await this.etablissementGateway.findById(payload.etablissementId);
        const session = await this.sessionGateway.findById(classe.sessionId);
        const availableSession = await this.sessionService.getFilteredSessionsForCLE();
        if (!availableSession.some(({ nom }) => nom === session.nom)) {
            throw new Error("Session not available");
        }
        const ancienneClasse = await this.classeGateway.findById(jeune.classeId);
        const ancienEtablissement = await this.etablissementGateway.findById(jeune.etablissementId);
        const oldSessionPhase1Id = jeune.sejourId;
        const oldBusId = jeune.ligneDeBusId;
        const originaleSource = jeune.source;

        let inscriptionStep = jeune.etapeInscription2023;
        let reinscriptionStep = jeune.etapeReinscription2023;
        if (
            jeune.statut === YOUNG_STATUS.IN_PROGRESS &&
            (jeune.etapeInscription2023 === STEPS2023.DOCUMENTS || jeune.etapeReinscription2023 === STEPS2023.DOCUMENTS)
        ) {
            jeune.aCommenceReinscription
                ? (reinscriptionStep = STEPS2023.REPRESENTANTS)
                : (inscriptionStep = STEPS2023.REPRESENTANTS);
        }

        let statutPhase1 = jeune.statutPhase1;
        let hasMeetingInformation = jeune.hasMeetingInformation;
        if (classe.centreCohesionId && classe.sessionId && classe.pointDeRassemblementId) {
            hasMeetingInformation = "true";
            statutPhase1 = YOUNG_STATUS_PHASE1.AFFECTED;
        }

        const correctionRequestsFiltered =
            jeune.correctionRequests?.filter((correction) => correction.field !== "CniFile") || [];

        const newNote = BasculeService.generateYoungNoteForBascule({
            jeune,
            session,
            sessionChangeReason: null,
            previousClasse: ancienneClasse,
            previousEtablissement: ancienEtablissement,
            newSource: payload.source,
            user,
        });

        const newJeune = BasculeCLEtoCLE.updateYoungForBasculeCLEtoCLE(
            jeune,
            statutPhase1,
            classe,
            etablissement,
            hasMeetingInformation,
            inscriptionStep,
            reinscriptionStep,
            correctionRequestsFiltered,
            newNote,
        );

        await this.jeuneGateway.update(newJeune);

        await this.classeStateManager.compute(ancienneClasse.id);
        await this.classeStateManager.compute(classe.id);

        // if they had a session, we check if we need to update the places taken / left
        if (oldSessionPhase1Id) {
            await this.sejourService.updatePlacesSejour(oldSessionPhase1Id);
        }

        // if they had a meetingPoint, we check if we need to update the places taken / left in the bus
        if (oldBusId) {
            await this.planDeTransportService.updateSeatsTakenInBusLine(oldBusId);
        }

        await this.basculeService.generateNotificationForBascule({
            jeune,
            originaleSource,
            session,
            sessionChangeReason: "",
            message: "",
            classe,
        });

        return JeuneMapper.toDto(jeune);
    }

    static getStatutJeuneForBasculeCLEtoCLE(statut: string): string {
        switch (statut) {
            case YOUNG_STATUS.IN_PROGRESS:
            case YOUNG_STATUS.NOT_AUTORISED:
                return YOUNG_STATUS.IN_PROGRESS;
            default:
                return YOUNG_STATUS.WAITING_VALIDATION;
        }
    }

    static updateYoungForBasculeCLEtoCLE(
        jeune,
        statutPhase1,
        classe,
        etablissement,
        hasMeetingInformation,
        inscriptionStep,
        reinscriptionStep,
        correctionRequestsFiltered,
        newNote,
    ) {
        const newStatus = BasculeCLEtoCLE.getStatutJeuneForBasculeCLEtoCLE(jeune.statut);
        const newJeune = {
            ...jeune,
            originalSessionNom: jeune.sessionNom,
            originalSessionId: jeune.sessionId,
            statut: newStatus,
            statutPhase1: statutPhase1,
            sessionNom: classe.sessionNom,
            sessionId: classe.sessionId,
            centreId: classe.centreCohesionId,
            sejourId: classe.sessionId,
            etablissementId: etablissement.id,
            pointDeRassemblementId: classe.pointDeRassemblementId,
            ligneDeBusId: classe.ligneId,
            deplacementPhase1Autonomous: undefined,
            transportInfoGivenByLocal: undefined,
            cohesionStayPresence: undefined,
            presenceJDM: undefined,
            departInform: undefined,
            departSejourAt: undefined,
            departSejourMotif: undefined,
            departSejourMotifComment: undefined,
            youngPhase1Agreement: "false",
            hasMeetingInformation: hasMeetingInformation,
            cohesionStayMedicalFileReceived: undefined,
            source: YOUNG_SOURCE.CLE,
            cniFiles: [],
            fichiers: {
                ...(jeune.fichiers || {}),
                cniFiles: [],
            },
            etapeInscription2023: inscriptionStep,
            etapeReinscription2023: reinscriptionStep,
            dateExpirationDernierFichierCNI: undefined,
            categorieDernierFichierCNI: undefined,
            correctionRequests: correctionRequestsFiltered,
            scolarise: "true",
            nomEtablissement: etablissement.nom,
            typeEtablissement: etablissement.type.length ? etablissement.type[0] : "",
            adresseEtablissement: etablissement.adresse,
            codePostalEtablissement: etablissement.codePostal,
            villeEtablissement: etablissement.commune,
            departementEtablissement: etablissement.departement,
            regionEtablissement: etablissement.region,
            paysEtablissement: etablissement.pays,
            ecoleRamsesId: undefined,
            situation: BasculeService.getYoungSituationIfCLE(classe.filiere || ""),
            notes: [...(jeune.notes ?? []), newNote],
            hasNotes: "true",
        };

        return newJeune;
    }
}
