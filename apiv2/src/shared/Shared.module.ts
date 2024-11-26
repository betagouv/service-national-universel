import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AllExceptionsFilter } from "./infra/AllExceptions.filter";
import { ClockGateway } from "./core/Clock.gateway";
import { ClockProvider } from "./infra/Clock.provider";
import { FileProvider } from "./infra/File.provider";

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        AllExceptionsFilter,
        Logger,
        FileProvider,
        {
            provide: ClockGateway,
            useClass: ClockProvider,
        },
    ],
    exports: [AllExceptionsFilter, ClockGateway],
})
export class SharedModule {}
