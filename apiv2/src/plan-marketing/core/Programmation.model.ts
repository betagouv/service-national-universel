import { SessionModel } from "@admin/core/sejours/phase1/session/Session.model";
import { TypeEvenement } from "snu-lib";

export interface CampagneProgrammation {
    joursDecalage: number;
    type: TypeEvenement;
    envoiDate?: Date;
    createdAt: Date;
}

export type DatesSession = Pick<
    SessionModel,
    | "dateStart"
    | "dateEnd"
    | "inscriptionStartDate"
    | "inscriptionEndDate"
    | "inscriptionModificationEndDate"
    | "instructionEndDate"
    | "validationDate"
>;

export const TYPE_EVENEMENT_TO_DATE_KEY: Record<TypeEvenement, keyof DatesSession | ""> = {
    [TypeEvenement.DATE_DEBUT_SEJOUR]: "dateStart",
    [TypeEvenement.DATE_FIN_SEJOUR]: "dateEnd",
    [TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS]: "inscriptionStartDate",
    [TypeEvenement.DATE_FERMETURE_INSCRIPTIONS]: "inscriptionEndDate",
    [TypeEvenement.DATE_FERMETURE_MODIFICATIONS]: "inscriptionModificationEndDate",
    [TypeEvenement.DATE_FERMETURE_INSTRUCTIONS]: "instructionEndDate",
    [TypeEvenement.DATE_VALIDATION_PHASE1]: "validationDate",
    [TypeEvenement.ENVOI_PRECEDENT]: "",
    [TypeEvenement.AUCUN]: "",
};
