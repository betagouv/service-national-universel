import * as Sentry from "@sentry/nestjs";
import { ConfigService } from "@nestjs/config";

// This function will be called after the ConfigService is available
export function initializeSentry(configService: ConfigService) {
    const environment = configService.get<string>("environment");
    const enableSentry = configService.get<boolean>("sentry.enabled");
    const sentryDsn = configService.get<string>("sentry.dsn");
    const sentryRelease = configService.get<string>("release");
    const sentryTracingSampleRate = configService.get<number>("sentry.tracingSampleRate");

    // Only initialize Sentry if explicitly enabled and in production environment
    // This prevents noise from development, staging, CI, and other non-production environments
    if (enableSentry && environment === "production") {
        Sentry.init({
            dsn: sentryDsn,
            environment,
            release: sentryRelease,
            tracesSampleRate: sentryTracingSampleRate,
            normalizeDepth: 16,
        });
    }
}