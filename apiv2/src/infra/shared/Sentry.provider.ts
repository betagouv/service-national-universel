import * as Sentry from "@sentry/nestjs";
import { ConfigService } from "@nestjs/config";
import { Provider } from "@nestjs/common";

export const SENTRY_PROVIDER = "SENTRY_PROVIDER";

export const SentryProvider: Provider = {
    provide: SENTRY_PROVIDER,
    useFactory: (configService: ConfigService) => {
        const environment = configService.get<string>("environment");
        const enableSentry = configService.get<boolean>("sentry.enabled");
        const sentryDsn = configService.get<string>("sentry.dsn");
        const sentryRelease = configService.get<string>("release");
        const sentryTracingSampleRate = configService.get<number>("sentry.tracingSampleRate");

        console.log("Sentry configuration:", {
            environment,
            enableSentry,
            sentryDsn: sentryDsn ? "SET" : "NOT SET",
            sentryRelease,
            sentryTracingSampleRate,
        });

        // Only initialize Sentry if explicitly enabled and in production environment
        // This prevents noise from development, staging, CI, and other non-production environments
        //if (enableSentry && environment === "production") {
        if (enableSentry && sentryDsn) {
            console.log("Initializing Sentry...");
            Sentry.init({
                dsn: sentryDsn,
                environment,
                release: sentryRelease,
                tracesSampleRate: sentryTracingSampleRate,
                normalizeDepth: 16,
            });
            console.log("Sentry initialized successfully");
        } else {
            console.log("Sentry not initialized:", {
                reason: !enableSentry ? "Sentry disabled" : "DSN not provided",
            });
        }
//        }

        return Sentry;
    },
    inject: [ConfigService],
}; 