import { Controller, Get, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Sentry from "@sentry/nestjs";
import { SENTRY_PROVIDER } from "./shared/Sentry.provider";

@Controller("")
export class HealthCheckController {
    constructor(private readonly configService: ConfigService, @Inject(SENTRY_PROVIDER) private readonly sentry: typeof Sentry) {}

    @Get()
    check() {
        return this.configService.getOrThrow("release");
    }

    @Get("testsentry")
    testSentry(): string {
        try {
            throw new Error("Test Sentry - Erreur intentionnelle pour tester l'intégration");
        } catch (error) {
            this.sentry.captureException(error);
            return "Erreur envoyée à Sentry !";
        }
    }
}
