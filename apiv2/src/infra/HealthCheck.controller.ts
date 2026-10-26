import { Controller, Get } from "@nestjs/common";

@Controller("")
export class HealthCheckController {
    // PL12 (25/09/2026) : GET /v2/ exposait la version déployée (`release`) sans authentification,
    // utile à un attaquant pour cibler des CVE connues d'une version précise.
    @Get()
    check() {
        return { status: "ok" };
    }

    @Get("health")
    health() {
        return {
            status: "healthy",
            timestamp: new Date().toISOString(),
        };
    }
}
