import { HttpException, HttpStatus } from "@nestjs/common";

export enum TechnicalExceptionType {
    UNAUTORIZED = "Unauthorized",
    CANNOT_SEND_EMAIL = "CANNOT_SEND_EMAIL",
    NOT_IMPLEMENTED_YET = "NOT_IMPLEMENTED_YET",
}

export class TechnicalException extends HttpException {
    type: TechnicalExceptionType;
    description?: string;
    constructor(type: TechnicalExceptionType, description?: string) {
        switch (type) {
            case TechnicalExceptionType.UNAUTORIZED:
                super(type, HttpStatus.UNAUTHORIZED, { description: description });
                break;
            default:
                super(type, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.type = type;
        this.description = description;
    }
}
