import { Inject, Injectable } from "@nestjs/common";
import { EnvoiCampagneStatut, EVENEMENT_TYPE_MAP, TypeEvenement, TypeRegleEnvoi } from "snu-lib";
import { CampagneSpecifiqueModelWithoutRef, CampagneSpecifiqueModelWithRefAndGeneric } from "../Campagne.model";
import { DatesSession, TYPE_EVENEMENT_TO_DATE_KEY } from "../Programmation.model";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

type CampagneSpecifique = CampagneSpecifiqueModelWithoutRef | CampagneSpecifiqueModelWithRefAndGeneric;

@Injectable()
export class ProgrammationService {
    constructor(@Inject(ClockGateway) private readonly clockGateway: ClockGateway) {}

    computeDateEnvoi(campagne: CampagneSpecifique, datesSession: DatesSession): CampagneSpecifique {
        if (!campagne.programmations?.length) {
            return campagne;
        }

        const programmationsWithDate = campagne.programmations.map((programmation) => {
            const typeRegle = EVENEMENT_TYPE_MAP[programmation.type];
            if (!typeRegle) {
                throw new FunctionalException(FunctionalExceptionCode.PROGRAMMATION_TYPE_REGLE_ENVOI_NON_TROUVE);
            }
            // Cas par défaut : TypeRegleEnvoi = PERSONNALISE, la date d'envoi spécifiée dans la programmation
            let dateEnvoi = programmation.envoiDate;

            if (typeRegle === TypeRegleEnvoi.DATE) {
                dateEnvoi = this.calculateDateBasedOnSessionDate(programmation, datesSession);
            } else if (typeRegle === TypeRegleEnvoi.ACTION && programmation.type === TypeEvenement.ENVOI_PRECEDENT) {
                dateEnvoi = this.calculateDateBasedOnPreviousSending(campagne, programmation.joursDecalage);
            }

            return {
                ...programmation,
                envoiDate: dateEnvoi,
            };
        });

        return {
            ...campagne,
            programmations: programmationsWithDate,
        };
    }

    private calculateDateBasedOnSessionDate(
        programmation: { type: TypeEvenement; joursDecalage: number },
        datesSession: DatesSession,
    ): Date | undefined {
        const propertyName = TYPE_EVENEMENT_TO_DATE_KEY[programmation.type];
        const dateCible = propertyName ? datesSession[propertyName] : undefined;

        if (!dateCible) return undefined;

        return this.clockGateway.addDays(new Date(dateCible), programmation.joursDecalage);
    }

    private calculateDateBasedOnPreviousSending(campagne: CampagneSpecifique, joursDecalage: number): Date | undefined {
        if (!campagne.envois?.length) return undefined;

        const lastCompletedSending = [...campagne.envois]
            .filter((envoi) => envoi.statut === EnvoiCampagneStatut.TERMINE)
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        if (!lastCompletedSending) return undefined;

        return this.clockGateway.addDays(new Date(lastCompletedSending.date), joursDecalage);
    }
}
