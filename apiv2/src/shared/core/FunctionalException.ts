import { HttpException, HttpStatus } from "@nestjs/common";

export enum FunctionalExceptionCode {
    NOT_FOUND = "NOT_FOUND",
    NOT_IMPLEMENTED_YET = "NOT_IMPLEMENTED_YET",
    INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT",
    IMPORT_EMPTY_FILE = "IMPORT_EMPTY_FILE",
    IMPORT_MISSING_COLUMN = "IMPORT_MISSING_COLUMN",
    CLASSE_STATUT_INVALIDE = "CLASSE_STATUT_INVALIDE",
    AFFECTATION_DEPARTEMENT_HORS_METROPOLE = "AFFECTATION_DEPARTEMENT_HORS_METROPOLE",
    AFFECTATION_NOT_ENOUGH_DATA = "AFFECTATION_NOT_ENOUGH_DATA",
    TOO_MANY_REFERENTS_CLASSE = "TOO_MANY_REFERENTS_CLASSE",
    ROLE_NOT_REFERENT_CLASSE = "ROLE_NOT_REFERENT_CLASSE",
}

export class FunctionalException extends HttpException {
    description?: string;
    constructor(message: FunctionalExceptionCode, description?: string) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, { description });
    }
}
