import { Injectable, Logger } from "@nestjs/common";

import { YOUNG_STATUS } from "snu-lib";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { SejourModel } from "../sejour/Sejour.model";
import { JeuneModel } from "../../jeune/Jeune.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { RapportData } from "./SimulationAffectationCLE.service";

type JeuneRapportData = RapportData["jeunesNouvellementAffectedList"][0];

@Injectable()
export class ValiderAffectationCLEService {
    constructor(private readonly logger: Logger) {}

    checkValiderAffectation(jeuneRapport: JeuneRapportData, jeune: JeuneModel, sejour?: SejourModel) {
        // Controle de coherence
        if (jeune.statut !== YOUNG_STATUS.VALIDATED) {
            // WITHDRAW ? (prevenir avant communication)
            this.logger.warn(`🚩 young ${jeune.id} status is not VALIDATED ${jeune.statut}`);
            return "jeune n'ayant pas le statut validé";
        }

        if (!sejour) {
            this.logger.warn(`🚩 sejour introuvable: ${jeuneRapport.sejourId} (jeune: ${jeune.id})`);
            throw new FunctionalException(
                FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                `sejour non trouvé ${jeuneRapport.sejourId} (jeune: ${jeune.id})`,
            );
        }
        if (!sejour.placesRestantes || sejour.placesRestantes < 0) {
            this.logger.warn(`🚩 plus de place pour ce sejour: ${sejour.id} (jeune: ${jeune.id})`);
            return "plus de place pour ce sejour";
        }
        // session
        if (jeune?.sessionNom !== sejour?.sessionNom) {
            this.logger.warn(
                `🚩 Le jeune (${jeune?.id}) a changé de cohort depuis la simulation (sejour: ${sejour?.sessionNom}, jeune: ${jeune?.sessionNom})`,
            );
            return "jeune ayant changé de cohorte depuis la simulation";
        }
        return null;
    }

    formatJeuneRapport(
        jeune: JeuneModel,
        sejour?: SejourModel,
        ligneDeBus?: LigneDeBusModel,
        pdr?: PointDeRassemblementModel,
        erreur = "",
    ) {
        return {
            id: jeune.id,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            genre: jeune.genre === "female" ? "fille" : "garçon",
            qpv: ["true", "oui"].includes(jeune.qpv!) ? "oui" : "non",
            psh: ["true", "oui"].includes(jeune.psh!) ? "oui" : "non",
            email: jeune.email,
            region: jeune.region,
            departement: jeune.departement,
            sessionId: sejour?.id || "",
            sessionNom: jeune.sessionNom,
            classeId: jeune.classeId,
            ...(jeune.ligneDeBusId
                ? {
                      ligneDeBusId: jeune.ligneDeBusId || "",
                      ligneDeBusNumeroLigne: ligneDeBus?.numeroLigne || "",
                  }
                : {}),
            ...(jeune.pointDeRassemblementId
                ? {
                      pointDeRassemblementId: jeune.pointDeRassemblementId || "",
                      pointDeRassemblementMatricule: pdr?.matricule || "",
                  }
                : {}),
            centreId: sejour?.centreId || "",
            centreNom: sejour?.centreNom || "",
            "places restantes après l'inscription (centre)": sejour?.placesRestantes || "",
            "places totale (centre)": sejour?.placesTotal || "",
            erreur,
            ...(!erreur
                ? {
                      prenom: jeune.prenom,
                      nom: jeune.nom,
                      email: jeune.email,
                      telephone: jeune.telephone,
                      dateNaissance: jeune.dateNaissance,
                      parent1Prenom: jeune.parent1Prenom,
                      parent1Nom: jeune.parent1Nom,
                      parent1Email: jeune.parent1Email,
                      parent1Telephone: jeune.parent1Telephone,
                      parent2Prenom: jeune.parent2Prenom,
                      parent2Nom: jeune.parent2Nom,
                      parent2Email: jeune.parent2Email,
                      parent2Telephone: jeune.parent2Telephone,
                  }
                : {}),
        };
    }
}
