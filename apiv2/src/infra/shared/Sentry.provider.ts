import * as Sentry from "@sentry/nestjs";
import { ConfigService } from "@nestjs/config";
import { Provider } from "@nestjs/common";

export const SENTRY_PROVIDER = "SENTRY_PROVIDER";

export const SentryProvider: Provider = {
    provide: SENTRY_PROVIDER,
    useFactory: (configService: ConfigService) => {
        const environment =  configService.get<string>("environment");
        const sentryDsn = configService.get<string>("sentry.dsn");
        const sentryRelease = configService.get<string>("release");
        const sentryTracingSampleRate = configService.get<number>("sentry.tracingSampleRate");

        console.info("Sentry configuration:", {
            environment,
            sentryDsn: sentryDsn ? "SET" : "NOT SET",
            sentryRelease,
            sentryTracingSampleRate,
        });

        // Only initialize Sentry if explicitly enabled and in production environment
        // This prevents noise from development, staging, CI, and other non-production environments
        if (sentryDsn && environment === "production") {
            console.log("Initializing Sentry...");
            Sentry.init({
                dsn: sentryDsn,
                environment,
                release: sentryRelease,
                tracesSampleRate: sentryTracingSampleRate,
                normalizeDepth: 16,
            });
            console.log("Sentry initialized successfully");
        }

        return Sentry;
    },
    inject: [ConfigService],
}; 