import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { CustomRequest } from "./CustomRequest";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    use(req: CustomRequest, _: Response, next: NextFunction) {
        const correlationId = uuidv4();
        req.correlationId = correlationId;
        next();
    }
}
