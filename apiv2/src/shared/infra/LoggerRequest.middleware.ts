import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { redactUrl } from "@snu/log-redaction";
import { CustomRequest } from "./CustomRequest";

@Injectable()
export class LoggerRequestMiddleware implements NestMiddleware {
    constructor(private logger: Logger) {}
    use(req: CustomRequest, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;
        const userAgent = req.get("user-agent") || "";
        const now = Date.now();

        res.on("finish", () => {
            const { statusCode } = res;
            const contentLength = res.get("content-length");
            const responseTime = Date.now() - now;
            // PL16 : originalUrl porte parfois un jeton en query string (ex. le HMAC du webhook
            // Brevo de plan-marketing) : ne jamais le journaliser brut.
            this.logger.log(
                `${req.correlationId} - userId: ${req.user?.id} - ${method} ${redactUrl(originalUrl, req.params)} - ${statusCode} - ${contentLength} - ${responseTime}ms - ${userAgent}`,
                LoggerRequestMiddleware.name,
            );
        });
        next();
    }
}
