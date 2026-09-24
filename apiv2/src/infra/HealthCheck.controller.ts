import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("")
export class HealthCheckController {
    constructor(private readonly configService: ConfigService) {}

    @Get()
    check() {
        return this.configService.getOrThrow("release");
    }

    @Get("health")
    health() {
        return {
            status: "healthy",
            timestamp: new Date().toISOString(),
        };
    }
}
