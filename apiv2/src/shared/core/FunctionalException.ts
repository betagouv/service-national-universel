import { HttpException, HttpStatus } from "@nestjs/common";

export enum FunctionalExceptionCode {
    NOT_FOUND = "NOT_FOUND",
    CLASSE_STATUT_INVALIDE = "CLASSE_STATUT_INVALIDE",
}

export class FunctionalException extends HttpException {
    constructor(message: FunctionalExceptionCode) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
