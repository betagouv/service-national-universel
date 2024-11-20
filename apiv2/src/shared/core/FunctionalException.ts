import { HttpException, HttpStatus } from "@nestjs/common";

export enum FunctionalExceptionCode {
    NOT_FOUND = "NOT_FOUND",
    CLASSE_STATUT_INVALIDE = "CLASSE_STATUT_INVALIDE",
    AFFECTATION_DEPARTEMENT_HORS_METROPOLE = "AFFECTATION_DEPARTEMENT_HORS_METROPOLE",
}

export class FunctionalException extends HttpException {
    constructor(message: FunctionalExceptionCode) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
