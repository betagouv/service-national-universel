import { HttpException, HttpStatus } from "@nestjs/common";

export enum TechnicalExceptionType {
    UNAUTORIZED = "Unauthorized",
    FORBIDDEN = "Forbidden",
    CANNOT_SEND_EMAIL = "CANNOT_SEND_EMAIL",
    NOT_IMPLEMENTED_YET = "NOT_IMPLEMENTED_YET",
    BREVO = "BREVO",
    DATABASE_ERROR = "DATABASE_ERROR",
    CRON_JOB_NOT_HANDLED = "CRON_JOB_NOT_HANDLED",
}

export class TechnicalException extends HttpException {
    type: TechnicalExceptionType;
    description?: string;
    constructor(type: TechnicalExceptionType, description?: string) {
        switch (type) {
            case TechnicalExceptionType.UNAUTORIZED:
                super(type, HttpStatus.UNAUTHORIZED, { description: description });
                break;
            case TechnicalExceptionType.FORBIDDEN:
                super(type, HttpStatus.FORBIDDEN, { description: description });
                break;
            default:
                super(type, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.type = type;
        this.description = description;
    }
}
