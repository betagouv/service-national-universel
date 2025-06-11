import { Inject, Injectable, Logger } from "@nestjs/common";
import { EnvoiCampagneStatut, EVENEMENT_TYPE_MAP, TypeEvenement, TypeRegleEnvoi } from "snu-lib";
import { CampagneSpecifiqueModelWithoutRef, CampagneSpecifiqueModelWithRefAndGeneric } from "../Campagne.model";
import { CampagneProgrammation, DatesSession, TYPE_EVENEMENT_TO_DATE_KEY } from "../Programmation.model";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

type CampagneSpecifique = CampagneSpecifiqueModelWithoutRef | CampagneSpecifiqueModelWithRefAndGeneric;

@Injectable()
export class ProgrammationService {
    private readonly logger: Logger = new Logger(ProgrammationService.name);

    constructor(@Inject(ClockGateway) private readonly clockGateway: ClockGateway) {}

    computeDateEnvoi(campagne: CampagneSpecifique, datesSession: DatesSession): CampagneSpecifique {
        if (!campagne.programmations?.length) {
            return campagne;
        }
        this.logger.log(`Computation of date for campagne ${campagne.id}`);

        // First pass: Calculate dates that don't depend on previous programmations
        const programmationsWithDate = campagne.programmations.map((programmation) => {
            const typeRegle = EVENEMENT_TYPE_MAP[programmation.type];
            if (!typeRegle) {
                throw new FunctionalException(FunctionalExceptionCode.PROGRAMMATION_TYPE_REGLE_ENVOI_NON_TROUVE);
            }
            // Cas par défaut : TypeRegleEnvoi = PERSONNALISE, la date d'envoi spécifiée dans la programmation
            let dateEnvoi = programmation.envoiDate;

            if (typeRegle === TypeRegleEnvoi.DATE) {
                dateEnvoi = this.calculateDateBasedOnSessionDate(programmation, datesSession);
            }

            return {
                ...programmation,
                envoiDate: dateEnvoi,
            };
        });

        // Second pass: Calculate dates that depend on previous programmations
        for (const [index, programmation] of programmationsWithDate.entries()) {
            const typeRegle = EVENEMENT_TYPE_MAP[programmation.type];

            if (typeRegle === TypeRegleEnvoi.ACTION && programmation.type === TypeEvenement.ENVOI_PRECEDENT) {
                programmation.envoiDate = this.calculateDateBasedOnPreviousSending(
                    programmationsWithDate,
                    index,
                    programmation.joursDecalage,
                );
            }
        }

        this.logger.log(`Computed dates for campagne ${campagne.id}, ${JSON.stringify(programmationsWithDate)}`);
        return {
            ...campagne,
            programmations: programmationsWithDate,
        };
    }

    shouldProgrammationBeSent(programmation: CampagneProgrammation, startDate: Date, endDate: Date): boolean {
        if (!programmation.envoiDate) {
            return false;
        }
        return programmation.envoiDate >= startDate && programmation.envoiDate <= endDate && !programmation.sentAt;
    }

    private calculateDateBasedOnSessionDate(
        programmation: { type: TypeEvenement; joursDecalage?: number },
        datesSession: DatesSession,
    ): Date | undefined {
        const propertyName = TYPE_EVENEMENT_TO_DATE_KEY[programmation.type];
        const dateCible = propertyName ? datesSession[propertyName] : undefined;

        if (!dateCible) return undefined;

        return this.clockGateway.addDays(new Date(dateCible), programmation.joursDecalage || 0);
    }

    private calculateDateBasedOnPreviousSending(
        programmationsWithDate: CampagneProgrammation[],
        currentIndex: number,
        joursDecalage?: number,
    ): Date | undefined {
        if (currentIndex <= 0) {
            return undefined;
        }

        const previousProgrammation = programmationsWithDate[currentIndex - 1];
        if (!previousProgrammation || !previousProgrammation.envoiDate) {
            return undefined;
        }

        return this.clockGateway.addDays(new Date(previousProgrammation.envoiDate), joursDecalage ?? 0);
    }
}
