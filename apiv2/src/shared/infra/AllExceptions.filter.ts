import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { HttpAdapterHost } from "@nestjs/core";
import * as Sentry from "@sentry/nestjs";
import { Router } from "express";
import { HttpError } from "snu-lib";
import { FunctionalException } from "../core/FunctionalException";
import { CustomRequest } from "./CustomRequest";
import { TechnicalException } from "./TechnicalException";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly logger: Logger,
    ) {}

    catch(exception: Error | HttpException, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const request = context.getRequest<CustomRequest>();

        this.processLog(exception, request);
        this.procesAlert(exception, request);
        this.processResponse(exception, context, request);
    }

    procesAlert(exception: Error | HttpException, request: CustomRequest) {
        const httpStatus =
            exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const ignoreList = [HttpStatus.UNAUTHORIZED, HttpStatus.UNPROCESSABLE_ENTITY];

        if (ignoreList.includes(httpStatus)) {
            return;
        }

        const currentRoute = this.getCurrentRoute(request);

        Sentry.captureMessage(`💥 HTTP ${httpStatus} ${request.method} ${currentRoute} ${exception.name}`, {
            level: "error",
            contexts: {
                params: request.params,
                query: request.query,
                route: request.route,
                payload: request.body,
            },
            extra: {
                request: {
                    auth: request.user?.id,
                    headers: request.headers,
                    method: request.method,
                    params: request.params,
                    originalUrl: request.originalUrl,
                    path: request.path,
                    payload: request.body,
                    route: request.route,
                    correlationId: request.correlationId,
                },
            },
        });
    }

    processResponse(exception: Error | HttpException, context: HttpArgumentsHost, request: CustomRequest) {
        const { httpAdapter } = this.httpAdapterHost;
        const httpStatus =
            exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException ? exception.message : "Internal Server Error";
        const description =
            exception instanceof FunctionalException || exception instanceof TechnicalException
                ? // @ts-expect-error TODO: typer exception la récupération de la description pour les erreurs
                  exception.options?.description
                : undefined;
        const responseBody: HttpError = {
            message: message,
            description,
            statusCode: httpStatus,
            correlationId: request.correlationId,
        };
        httpAdapter.reply(context.getResponse(), responseBody, httpStatus);
    }

    processLog(exception: Error | HttpException, request: CustomRequest) {
        const stack = exception instanceof Error ? exception.stack : null;
        const caller = this.getCallerClassMethod(exception);
        const currentRoute = this.getCurrentRoute(request);
        // @ts-expect-error TODO: typer exception pour les erreur de validation
        let log = `Unhandled - ${request.correlationId} - ${currentRoute} - ${exception.response?.message} ${stack}`;
        if (exception instanceof TechnicalException || exception instanceof FunctionalException) {
            log = `${request.correlationId} - ${currentRoute} -  ${exception.message} ${
                exception.description || ""
            } - ${stack}`;
        }
        this.logger.error(log, caller);
    }

    private getCurrentRoute(request: CustomRequest) {
        try {
            const router = request.app._router as Router;
            const currentRoute = router.stack
                .filter((layer) => {
                    if (layer.route) {
                        const path = layer.route?.path;
                        const method = layer.route?.stack[0].method;
                        const isMatchingPath = !!request.originalUrl.match(layer.regexp);
                        return method === request.method && isMatchingPath;
                    }
                    return false;
                })
                .map((layer) => layer.route?.path)?.[0];
            return currentRoute || request.originalUrl;
        } catch (error) {
            return request.originalUrl;
        }
    }

    private getCallerClassMethod = (error: Error) => {
        let callerClass: string | undefined = "CallerNotFound";
        try {
            const stack = error?.stack;
            const stackLines = stack?.split("\n");
            const callerLine = stackLines?.[1];
            callerClass = callerLine?.match(/at (.*) \(/)?.[1];
        } catch (e) {
            this.logger.log(`Cannot get caller of : ${error.stack}`);
        }

        return callerClass;
    };
}
