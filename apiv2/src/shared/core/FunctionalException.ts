import { HttpException, HttpStatus } from "@nestjs/common";

export enum FunctionalExceptionCode {
    NOT_FOUND = "NOT_FOUND",
    CLASSE_STATUT_INVALIDE = "CLASSE_STATUT_INVALIDE",
    AFFECTATION_DEPARTEMENT_HORS_METROPOLE = "AFFECTATION_DEPARTEMENT_HORS_METROPOLE",
    AFFECTATION_NOT_ENOUGH_DATA = "AFFECTATION_NOT_ENOUGH_DATA",
    TOO_MANY_REFERENTS_CLASSE = "TOO_MANY_REFERENTS_CLASSE",
}

export class FunctionalException extends HttpException {
    constructor(message: FunctionalExceptionCode, description?: string) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, { description });
    }
}
